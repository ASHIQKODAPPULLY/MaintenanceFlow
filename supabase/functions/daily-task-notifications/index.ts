import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "@shared/cors.ts";
import { Database } from "@shared/database.types.ts";

interface TaskNotification {
  task: {
    id: string;
    title: string;
    due_date: string;
    checklist: any[];
    priority: string;
    task_type: string;
    description?: string;
  };
  property: {
    name: string;
    address?: string;
    property_type?: string;
  };
  technician: {
    name: string;
    email: string;
    phone_number: string;
    contact_method: string;
    notification_preferences: any;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for full access
    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Calculate date range (next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch upcoming tasks due within the next 7 days
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        due_date,
        checklist,
        priority,
        task_type,
        description,
        property_id,
        assigned_to,
        properties (
          name,
          address,
          property_type
        ),
        users!inner (
          name,
          email,
          phone_number,
          contact_method,
          notification_preferences
        )
      `,
      )
      .gte("due_date", now.toISOString())
      .lte("due_date", sevenDaysFromNow.toISOString())
      .eq("status", "pending");

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No upcoming tasks found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Found ${tasks.length} upcoming tasks`);

    // Process each task and send notifications
    const notifications: TaskNotification[] = [];
    const notificationResults = [];

    for (const task of tasks) {
      const notification: TaskNotification = {
        task: {
          id: task.id,
          title: task.title,
          due_date: task.due_date || "",
          checklist: task.checklist || [],
          priority: task.priority || "medium",
          task_type: task.task_type || "recurring",
          description: task.description,
        },
        property: {
          name: task.properties?.name || "Unknown Property",
          address: task.properties?.address,
          property_type: task.properties?.property_type,
        },
        technician: {
          name: task.users?.name || "Unknown Technician",
          email: task.users?.email || "",
          phone_number: task.users?.phone_number || "",
          contact_method: task.users?.contact_method || "email",
          notification_preferences: task.users?.notification_preferences || {
            email: true,
            sms: false,
            whatsapp: false,
          },
        },
      };

      notifications.push(notification);

      // Send notification based on user mode
      try {
        const result = await sendNotification(notification);
        notificationResults.push({
          taskId: task.id,
          success: true,
          method: result.method,
          recipient: result.recipient,
        });
      } catch (error) {
        console.error(
          `Failed to send notification for task ${task.id}:`,
          error,
        );
        notificationResults.push({
          taskId: task.id,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${tasks.length} upcoming tasks`,
        notifications: notificationResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in daily task notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendNotification(
  notification: TaskNotification,
): Promise<{ method: string; recipient: string }> {
  const message = formatMessage(notification);

  // Priority order: SMS (if phone available and not no_phone mode) > Email > PDF

  // Check notification preferences and contact method
  const preferences = notification.technician.notification_preferences;
  const contactMethod = notification.technician.contact_method;

  // Check for SMS first (if enabled in preferences and phone available)
  if (
    notification.technician.phone_number &&
    (preferences.sms || contactMethod === "sms") &&
    contactMethod !== "no_phone"
  ) {
    try {
      await sendSmsNotification(
        notification.technician.phone_number,
        message,
        notification,
      );
      return { method: "sms", recipient: notification.technician.phone_number };
    } catch (error) {
      console.error(
        `SMS failed for ${notification.technician.phone_number}, falling back to email:`,
        error,
      );
      // Fall through to email
    }
  }

  // Fallback to email if SMS failed or not available (and email is enabled)
  if (
    notification.technician.email &&
    (preferences.email || contactMethod === "email")
  ) {
    try {
      await sendEmailNotification(
        notification.technician.email,
        message,
        notification,
      );
      return { method: "email", recipient: notification.technician.email };
    } catch (error) {
      console.error(
        `Email failed for ${notification.technician.email}:`,
        error,
      );
      // Fall through to PDF
    }
  }

  // Final fallback: PDF generation for no-phone mode or when other methods fail
  console.log(
    `Task ${notification.task.id} requires PDF generation - no other notification methods available or all failed`,
  );
  await generatePdfNotification(notification);
  return { method: "pdf", recipient: notification.technician.name };
}

function formatMessage(notification: TaskNotification): string {
  const dueDate = new Date(notification.task.due_date).toLocaleDateString();
  const checklistItems = notification.task.checklist
    .map(
      (item: any, index: number) =>
        `${index + 1}. ${typeof item === "string" ? item : item.text || item.description || "Checklist item"}`,
    )
    .join("\n");

  return `
Maintenance Task Reminder

Task: ${notification.task.title}
Type: ${notification.task.task_type.replace("_", " ").toUpperCase()}
Priority: ${notification.task.priority.toUpperCase()}
Due Date: ${dueDate}

${notification.task.description ? `Description: ${notification.task.description}\n\n` : ""}Property Information:
- Name: ${notification.property.name}
${notification.property.address ? `- Address: ${notification.property.address}\n` : ""}${notification.property.property_type ? `- Type: ${notification.property.property_type}\n` : ""}
Checklist:
${checklistItems || "No checklist items"}

Please complete this task by the due date.
  `.trim();
}

async function sendEmailNotification(
  email: string,
  message: string,
  notification: TaskNotification,
) {
  const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");

  if (!sendGridApiKey) {
    throw new Error("SendGrid API key not configured");
  }

  const emailData = {
    personalizations: [
      {
        to: [{ email }],
        subject: `Maintenance Task Due: ${notification.task.title}`,
      },
    ],
    from: {
      email: Deno.env.get("FROM_EMAIL") || "noreply@maintenance-scheduler.com",
      name: "Maintenance Scheduler",
    },
    content: [
      {
        type: "text/plain",
        value: message,
      },
    ],
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendGridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }

  console.log(`Email sent successfully to ${email}`);
}

async function sendSmsNotification(
  phoneNumber: string,
  message: string,
  notification: TaskNotification,
) {
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    throw new Error("Twilio credentials not configured");
  }

  // Format message for SMS (shorter version)
  const smsMessage = formatSmsMessage(notification);

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append("From", twilioPhoneNumber);
  formData.append("To", phoneNumber);
  formData.append("Body", smsMessage);

  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
  }

  console.log(`SMS sent successfully to ${phoneNumber}`);
}

function formatSmsMessage(notification: TaskNotification): string {
  const dueDate = new Date(notification.task.due_date).toLocaleDateString();

  return `🔧 MAINTENANCE ALERT\n\n${notification.task.title}\nPriority: ${notification.task.priority.toUpperCase()}\nDue: ${dueDate}\nProperty: ${notification.property.name}${notification.property.address ? ` (${notification.property.address})` : ""}\n\nComplete by due date. Check app for full details.`;
}

async function generatePdfNotification(notification: TaskNotification) {
  // Placeholder for PDF generation logic
  // This would typically:
  // 1. Generate a PDF with task details and checklist
  // 2. Save it to a storage location (e.g., Supabase Storage)
  // 3. Log the location for printing/pickup

  console.log(
    `PDF notification generated for task ${notification.task.id} - ${notification.task.title}`,
  );
  console.log(
    `Technician: ${notification.technician.name} (No-phone mode or fallback)`,
  );

  // In a real implementation, you might:
  // - Use a PDF library like jsPDF or Puppeteer
  // - Store the PDF in Supabase Storage
  // - Create a record in a "pdf_notifications" table
  // - Send an admin notification that a PDF is ready for printing
}
