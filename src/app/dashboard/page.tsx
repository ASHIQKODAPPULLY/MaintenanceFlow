import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import {
  InfoIcon,
  UserCircle,
  Plus,
  AlertTriangle,
  Shield,
  Users,
  Settings,
  BarChart3,
  Home,
  CheckSquare,
} from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { checkTaskLimit } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import DashboardClientWrapper from "@/components/dashboard-client-wrapper";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Reliable admin role detection with fallback
  let isAdmin = false;

  const { data: profileById } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileById?.role === "admin") {
    isAdmin = true;
  } else {
    const { data: profileByEmail } = await supabase
      .from("users")
      .select("role")
      .eq("email", user.email)
      .single();

    isAdmin =
      profileByEmail?.role === "admin" || user.email === "ashiqdink@gmail.com";
  }

  // Debug logging for admin detection
  console.log("Admin detection:", {
    isAdmin,
    email: user.email,
    userId: user.id,
  });

  // Check task limits (admins have unlimited access)
  const taskLimitInfo = isAdmin
    ? {
        canCreateTask: true,
        currentCount: 0,
        limit: -1,
        planTier: "unlimited",
        activeTaskCount: 0,
        activeTaskLimit: -1,
        limitType: null,
      }
    : await checkTaskLimit(user.id);

  // Get user's properties
  const { data: properties } = await supabase
    .from("properties")
    .select(
      `
      *,
      tasks!property_id(count)
    `,
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Get all users for task assignment (admin sees all, regular users see themselves)
  const { data: allUsers } = isAdmin
    ? await supabase
        .from("users")
        .select("id, name, email, full_name")
        .order("name", { ascending: true })
    : await supabase
        .from("users")
        .select("id, name, email, full_name")
        .eq("user_id", user.id);

  // Transform properties to include task count
  const propertiesWithTaskCount =
    properties?.map((property) => ({
      ...property,
      task_count: property.tasks?.[0]?.count || 0,
    })) || [];

  // Transform users for task assignment
  const usersForAssignment =
    allUsers?.map((user) => ({
      id: user.id,
      name: user.name || user.full_name || "Unknown User",
      email: user.email,
    })) || [];

  // Get recent tasks (admin sees all tasks, users see only their own)
  const { data: tasks } = isAdmin
    ? await supabase
        .from("tasks")
        .select(
          `
          *,
          properties(name, address)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5)
    : await supabase
        .from("tasks")
        .select(
          `
          *,
          properties(name, address)
        `,
        )
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

  // Admin-only data
  let adminStats = null;
  if (isAdmin) {
    const [totalTasksResult, totalUsersResult, activeTasksResult] =
      await Promise.all([
        supabase.from("tasks").select("*", { count: "exact" }),
        supabase.from("users").select("*", { count: "exact" }),
        supabase
          .from("tasks")
          .select("*", { count: "exact" })
          .in("status", ["pending", "in_progress"]),
      ]);

    adminStats = {
      totalTasks: totalTasksResult.count || 0,
      totalUsers: totalUsersResult.count || 0,
      activeTasks: activeTasksResult.count || 0,
    };
  }

  return (
    <>
      {!isAdmin ? (
        <SubscriptionCheck>
          <DashboardContent
            isAdmin={isAdmin}
            user={user}
            taskLimitInfo={taskLimitInfo}
            adminStats={adminStats}
            propertiesWithTaskCount={propertiesWithTaskCount}
            usersForAssignment={usersForAssignment}
            tasks={tasks}
          />
        </SubscriptionCheck>
      ) : (
        <DashboardContent
          isAdmin={isAdmin}
          user={user}
          taskLimitInfo={taskLimitInfo}
          adminStats={adminStats}
          propertiesWithTaskCount={propertiesWithTaskCount}
          usersForAssignment={usersForAssignment}
          tasks={tasks}
        />
      )}
    </>
  );
}

interface DashboardContentProps {
  isAdmin: boolean;
  user: any;
  taskLimitInfo: any;
  adminStats: any;
  propertiesWithTaskCount: any[];
  usersForAssignment: any[];
  tasks: any[];
}

function DashboardContent({
  isAdmin,
  user,
  taskLimitInfo,
  adminStats,
  propertiesWithTaskCount,
  usersForAssignment,
  tasks,
}: DashboardContentProps) {
  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
                {isAdmin && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Shield size={12} />
                    Admin Access
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Plan:{" "}
                <span className="font-semibold capitalize">
                  {taskLimitInfo.planTier}
                </span>
              </div>
            </div>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>
                {isAdmin
                  ? "Admin Dashboard - Manage all maintenance tasks, users, and system settings"
                  : "Manage your maintenance tasks and schedule work orders"}
              </span>
            </div>
          </header>

          {/* Admin Statistics */}
          {isAdmin && adminStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Total Tasks
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {adminStats.totalTasks}
                  </div>
                  <p className="text-xs text-blue-600">All tasks in system</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Active Tasks
                  </CardTitle>
                  <Settings className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {adminStats.activeTasks}
                  </div>
                  <p className="text-xs text-green-600">
                    Pending & In Progress
                  </p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {adminStats.totalUsers}
                  </div>
                  <p className="text-xs text-purple-600">Registered users</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Task Limit Alert */}
          {!taskLimitInfo.canCreateTask && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You've reached your task limit ({taskLimitInfo.currentCount}/
                {taskLimitInfo.limit} tasks this week).
                <Link href="/pricing" className="underline font-medium ml-1">
                  Upgrade your plan
                </Link>{" "}
                to create more tasks.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content Tabs */}
          <DashboardClientWrapper
            propertiesWithTaskCount={propertiesWithTaskCount}
            usersForAssignment={usersForAssignment}
            tasks={tasks}
            taskLimitInfo={taskLimitInfo}
            isAdmin={isAdmin}
          />

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <UserCircle size={48} className="text-primary" />
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                    <Shield size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-xl">User Profile</h2>
                  {isAdmin && (
                    <Badge variant="destructive" className="text-xs">
                      Administrator
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  Plan: {taskLimitInfo.planTier}
                  {taskLimitInfo.limit === -1
                    ? " (Unlimited)"
                    : ` (${taskLimitInfo.limit} tasks/week)`}
                </p>
                {isAdmin && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    ✓ Full system access enabled
                  </p>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Admin Capabilities:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    View all user tasks
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    System-wide statistics
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Unlimited task creation
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    User management access
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
