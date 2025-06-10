import { corsHeaders } from "@shared/cors.ts";
import { Database } from "@shared/database.types.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TaskCompletionRequest {
  task_id: string;
  technician_id: string;
  time_taken?: number; // in minutes
  cost?: number;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body: TaskCompletionRequest = await req.json();

    // Validate required fields
    if (!body.task_id || !body.technician_id) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: task_id and technician_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY")!;

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Fetch task details to get asset_id and verify task exists
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, asset_id, assigned_to, status")
      .eq("id", body.task_id)
      .single();

    if (taskError || !task) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the technician is assigned to this task or is an admin
    const { data: technician, error: techError } = await supabase
      .from("users")
      .select("user_id, role")
      .eq("user_id", body.technician_id)
      .single();

    if (techError || !technician) {
      return new Response(JSON.stringify({ error: "Technician not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if technician is authorized (assigned to task or admin)
    if (
      task.assigned_to !== body.technician_id &&
      technician.role !== "admin"
    ) {
      return new Response(
        JSON.stringify({ error: "Technician not authorized for this task" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update task status to completed
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.task_id);

    if (updateError) {
      console.error("Error updating task status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update task status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Insert maintenance log entry
    const logEntry = {
      task_id: body.task_id,
      asset_id: task.asset_id,
      completed_by: body.technician_id,
      date_completed: new Date().toISOString(),
      time_taken: body.time_taken || null,
      cost: body.cost || null,
      notes: body.notes || null,
    };

    const { data: logData, error: logError } = await supabase
      .from("maintenance_logs")
      .insert(logEntry)
      .select()
      .single();

    if (logError) {
      console.error("Error inserting maintenance log:", logError);
      return new Response(
        JSON.stringify({ error: "Failed to log task completion" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Task completion logged successfully",
        data: {
          task_id: body.task_id,
          maintenance_log_id: logData.id,
          completed_at: logData.date_completed,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
