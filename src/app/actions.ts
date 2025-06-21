"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { createAdminClient } from "../../supabase/admin-client";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";

  console.log("SignUp attempt:", { email, hasPassword: !!password, fullName });

  const supabase = await createClient();

  if (!email || !password) {
    console.log("Missing email or password");
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Invalid email format:", email);
    return encodedRedirect(
      "error",
      "/sign-up",
      "Please enter a valid email address",
    );
  }

  // Validate password length
  if (password.length < 6) {
    console.log("Password too short:", password.length);
    return encodedRedirect(
      "error",
      "/sign-up",
      "Password must be at least 6 characters long",
    );
  }

  console.log("Attempting Supabase signup...");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        name: fullName,
        email: email,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    console.error("Supabase signup error:", error);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  console.log("Signup successful:", {
    userId: data.user?.id,
    email: data.user?.email,
  });
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // Special handling for admin user - create directly in auth.users if needed
  if (email === "admin@tempodemo.com" && password === "Admin12345") {
    // Try to sign in first
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // If sign in successful, ensure admin role in database
    if (!signInError && signInData.user) {
      const adminClient = createAdminClient();
      const { error: dbError } = await adminClient.from("users").upsert(
        {
          id: signInData.user.id,
          user_id: signInData.user.id,
          name: "System Administrator",
          full_name: "System Administrator",
          email: "admin@tempodemo.com",
          role: "admin",
          token_identifier: signInData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        },
      );

      if (dbError) {
        console.warn("Failed to ensure admin user in database:", dbError);
      }

      return redirect("/dashboard");
    }

    // If sign in failed, create the user directly using admin client
    if (
      signInError &&
      signInError.message.includes("Invalid login credentials")
    ) {
      console.log("Creating admin user directly in auth.users...");

      const adminClient = createAdminClient();

      // Create user directly in auth.users table using admin client
      const { data: adminUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email: "admin@tempodemo.com",
          password: "Admin12345",
          email_confirm: true, // Skip email verification
          user_metadata: {
            full_name: "System Administrator",
            name: "System Administrator",
          },
        });

      if (createError) {
        console.error("Failed to create admin user:", createError);
        return encodedRedirect(
          "error",
          "/sign-in",
          "Failed to create admin account: " + createError.message,
        );
      }

      if (adminUser.user) {
        // Create corresponding record in public.users table
        const { error: dbError } = await adminClient.from("users").upsert(
          {
            id: adminUser.user.id,
            user_id: adminUser.user.id,
            name: "System Administrator",
            full_name: "System Administrator",
            email: "admin@tempodemo.com",
            role: "admin",
            token_identifier: adminUser.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
            ignoreDuplicates: false,
          },
        );

        if (dbError) {
          console.warn("Failed to create admin user in database:", dbError);
        }

        // Now try to sign in with the created user
        const { data: finalSignInData, error: finalSignInError } =
          await supabase.auth.signInWithPassword({
            email: "admin@tempodemo.com",
            password: "Admin12345",
          });

        if (finalSignInError) {
          console.error(
            "Failed to sign in after creating admin:",
            finalSignInError,
          );
          return encodedRedirect(
            "error",
            "/sign-in",
            "Admin account created but sign in failed. Please try again.",
          );
        }

        return redirect("/dashboard");
      }
    }

    // If we get here, something went wrong with the admin account
    return encodedRedirect(
      "error",
      "/sign-in",
      signInError?.message || "Failed to process admin login",
    );
  }

  // Regular sign in for other users
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  // Construct the redirect URL dynamically based on environment
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://nervous-cohen2-vhwd5.view-3.tempo-dev.app";
  const redirectTo = `${baseUrl}/auth/callback?type=recovery&next=/dashboard/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed: " + error.message,
    );
  }

  return encodedRedirect(
    "success",
    "/dashboard",
    "Password updated successfully!",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error) {
    return false;
  }

  return !!subscription;
};

export const checkTaskLimit = async (userId: string) => {
  const supabase = await createClient();

  // Get user's current plan
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  const planTier = subscription?.plan_tier || "free";

  // Get plan limits
  const { data: planLimit } = await supabase
    .from("plan_limits")
    .select("tasks_per_week, max_active_tasks")
    .eq("plan_tier", planTier)
    .single();

  const weeklyLimit = planLimit?.tasks_per_week || 5;
  const activeTaskLimit = planLimit?.max_active_tasks || 10;

  // If unlimited plan
  if (weeklyLimit === -1 && activeTaskLimit === -1) {
    return {
      canCreateTask: true,
      currentCount: 0,
      limit: -1,
      planTier,
      activeTaskCount: 0,
      activeTaskLimit: -1,
      limitType: null,
    };
  }

  // Count active tasks (pending, in_progress)
  const { count: activeTaskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("assigned_to", userId)
    .in("status", ["pending", "in_progress"]);

  const currentActiveCount = activeTaskCount || 0;

  // Count tasks created this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { count: weeklyTaskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("assigned_to", userId)
    .gte("created_at", oneWeekAgo.toISOString());

  const currentWeeklyCount = weeklyTaskCount || 0;

  // Check both limits
  const activeTasksExceeded =
    activeTaskLimit !== -1 && currentActiveCount >= activeTaskLimit;
  const weeklyTasksExceeded =
    weeklyLimit !== -1 && currentWeeklyCount >= weeklyLimit;

  let limitType = null;
  if (activeTasksExceeded && weeklyTasksExceeded) {
    limitType = "both";
  } else if (activeTasksExceeded) {
    limitType = "active";
  } else if (weeklyTasksExceeded) {
    limitType = "weekly";
  }

  const canCreateTask = !activeTasksExceeded && !weeklyTasksExceeded;

  return {
    canCreateTask,
    currentCount: currentWeeklyCount,
    limit: weeklyLimit,
    planTier,
    activeTaskCount: currentActiveCount,
    activeTaskLimit,
    limitType,
  };
};

export const createPropertyAction = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "Authentication required");
  }

  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const propertyType = formData.get("property_type")?.toString();
  const notes = formData.get("notes")?.toString();

  if (!name) {
    return encodedRedirect("error", "/dashboard", "Property name is required");
  }

  if (name.length > 255) {
    return encodedRedirect(
      "error",
      "/dashboard",
      "Property name is too long (max 255 characters)",
    );
  }

  const { error } = await supabase.from("properties").insert({
    name,
    address,
    property_type: propertyType,
    notes,
    owner_id: user.id,
  });

  if (error) {
    console.error("Property creation error:", error);
    return encodedRedirect(
      "error",
      "/dashboard",
      "Failed to create property. Please try again.",
    );
  }

  return encodedRedirect(
    "success",
    "/dashboard",
    "✅ Property created successfully!",
  );
};

export const updatePropertyAction = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "Authentication required");
  }

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const propertyType = formData.get("property_type")?.toString();
  const notes = formData.get("notes")?.toString();

  if (!id || !name) {
    return encodedRedirect(
      "error",
      "/dashboard",
      "Property ID and name are required",
    );
  }

  const { error } = await supabase
    .from("properties")
    .update({
      name,
      address,
      property_type: propertyType,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Property update error:", error);
    return encodedRedirect(
      "error",
      "/dashboard",
      "Failed to update property. Please try again.",
    );
  }

  return encodedRedirect(
    "success",
    "/dashboard",
    "✅ Property updated successfully!",
  );
};

export const deletePropertyAction = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "Authentication required");
  }

  const id = formData.get("id")?.toString();

  if (!id) {
    return encodedRedirect("error", "/dashboard", "Property ID is required");
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Property deletion error:", error);
    return encodedRedirect(
      "error",
      "/dashboard",
      "Failed to delete property. Please try again.",
    );
  }

  return encodedRedirect(
    "success",
    "/dashboard",
    "✅ Property deleted successfully!",
  );
};

export const createTaskAction = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "Authentication required");
  }

  // Logic Agent: Check task limits before creation
  const taskLimitCheck = await checkTaskLimit(user.id);

  if (!taskLimitCheck.canCreateTask) {
    let errorMessage = "";

    // Generate specific error message based on limit type
    switch (taskLimitCheck.limitType) {
      case "active":
        errorMessage = `🚫 Active task limit reached! You have ${taskLimitCheck.activeTaskCount}/${taskLimitCheck.activeTaskLimit} active tasks on the ${taskLimitCheck.planTier} plan. Complete some tasks or upgrade your plan to create more.`;
        break;
      case "weekly":
        errorMessage = `🚫 Weekly task limit reached! You've created ${taskLimitCheck.currentCount}/${taskLimitCheck.limit} tasks this week on the ${taskLimitCheck.planTier} plan. Upgrade to create more tasks.`;
        break;
      case "both":
        errorMessage = `🚫 Task limits reached! You have ${taskLimitCheck.activeTaskCount}/${taskLimitCheck.activeTaskLimit} active tasks and ${taskLimitCheck.currentCount}/${taskLimitCheck.limit} weekly tasks on the ${taskLimitCheck.planTier} plan. Upgrade your plan to continue.`;
        break;
      default:
        errorMessage = `🚫 Task limit reached on the ${taskLimitCheck.planTier} plan. Upgrade to create more tasks.`;
    }

    return encodedRedirect("error", "/dashboard", errorMessage);
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const propertyId = formData.get("property_id")?.toString();
  const assignedTo = formData.get("assigned_to")?.toString();
  const dueDate = formData.get("due_date")?.toString();
  const priority = formData.get("priority")?.toString() || "medium";
  const frequency = formData.get("frequency")?.toString();
  const taskType = formData.get("task_type")?.toString() || "recurring";
  const assetId = formData.get("asset_id")?.toString();
  const checklistStr = formData.get("checklist")?.toString();

  if (!title) {
    return encodedRedirect("error", "/dashboard", "Task title is required");
  }

  if (!propertyId) {
    return encodedRedirect(
      "error",
      "/dashboard",
      "Property selection is required",
    );
  }

  // Validate task data before creation
  if (title.length > 200) {
    return encodedRedirect(
      "error",
      "/dashboard",
      "Task title is too long (max 200 characters)",
    );
  }

  let checklist = [];
  if (checklistStr) {
    try {
      checklist = JSON.parse(checklistStr);
    } catch (error) {
      console.error("Invalid checklist JSON:", error);
    }
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    property_id: propertyId,
    assigned_to: assignedTo || user.id,
    due_date: dueDate ? new Date(dueDate).toISOString() : null,
    priority,
    frequency,
    task_type: taskType,
    asset_id: assetId || null,
    checklist,
    status: "pending",
  });

  if (error) {
    console.error("Task creation error:", error);
    return encodedRedirect(
      "error",
      "/dashboard",
      "Failed to create task. Please try again.",
    );
  }

  return encodedRedirect(
    "success",
    "/dashboard",
    "✅ Task created successfully!",
  );
};
