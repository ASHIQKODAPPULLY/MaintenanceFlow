"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        user_id: user.id,
        name: fullName,
        email: email,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        // Error handling without console.error
        return encodedRedirect(
          "error",
          "/sign-up",
          "Error updating user. Please try again.",
        );
      }
    } catch (err) {
      // Error handling without console.error
      return encodedRedirect(
        "error",
        "/sign-up",
        "Error updating user. Please try again.",
      );
    }
  }

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

  const { error } = await supabase.auth.signInWithPassword({
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

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

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
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
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
    .select("tasks_per_week")
    .eq("plan_tier", planTier)
    .single();

  const weeklyLimit = planLimit?.tasks_per_week || 5;

  // If unlimited plan
  if (weeklyLimit === -1) {
    return { canCreateTask: true, currentCount: 0, limit: -1, planTier };
  }

  // Count tasks created this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: tasks, count } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("assigned_to", userId)
    .gte("created_at", oneWeekAgo.toISOString());

  const currentCount = count || 0;
  const canCreateTask = currentCount < weeklyLimit;

  return {
    canCreateTask,
    currentCount,
    limit: weeklyLimit,
    planTier,
  };
};

export const createTaskAction = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "Authentication required");
  }

  // Check task limits
  const taskLimitCheck = await checkTaskLimit(user.id);

  if (!taskLimitCheck.canCreateTask) {
    return encodedRedirect(
      "error",
      "/dashboard",
      `Task limit reached! You can create ${taskLimitCheck.limit} tasks per week on the ${taskLimitCheck.planTier} plan. Current: ${taskLimitCheck.currentCount}/${taskLimitCheck.limit}`,
    );
  }

  const title = formData.get("title")?.toString();
  const assetId = formData.get("asset_id")?.toString();
  const assignedTo = formData.get("assigned_to")?.toString();
  const dueDate = formData.get("due_date")?.toString();
  const priority = formData.get("priority")?.toString() || "medium";
  const frequency = formData.get("frequency")?.toString();

  if (!title) {
    return encodedRedirect("error", "/dashboard", "Task title is required");
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    asset_id: assetId,
    assigned_to: assignedTo || user.id,
    due_date: dueDate ? new Date(dueDate).toISOString() : null,
    priority,
    frequency,
    status: "pending",
  });

  if (error) {
    return encodedRedirect("error", "/dashboard", "Failed to create task");
  }

  return encodedRedirect("success", "/dashboard", "Task created successfully!");
};
