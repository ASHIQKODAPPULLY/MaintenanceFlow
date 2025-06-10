import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { InfoIcon, UserCircle, Plus, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { checkTaskLimit, createTaskAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check task limits
  const taskLimitInfo = await checkTaskLimit(user.id);

  // Get recent tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
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
                Manage your maintenance tasks and schedule work orders
              </span>
            </div>
          </header>

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Task Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} />
                  Create New Task
                </CardTitle>
                <CardDescription>
                  Schedule a new maintenance task.
                  {taskLimitInfo.limit === -1 ? (
                    <span className="text-green-600 font-medium">
                      Unlimited tasks available
                    </span>
                  ) : (
                    <span>
                      Using {taskLimitInfo.currentCount}/{taskLimitInfo.limit}{" "}
                      tasks this week
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createTaskAction} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Check HVAC filters"
                      required
                      disabled={!taskLimitInfo.canCreateTask}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        name="priority"
                        disabled={!taskLimitInfo.canCreateTask}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        name="frequency"
                        disabled={!taskLimitInfo.canCreateTask}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">One Time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="datetime-local"
                      disabled={!taskLimitInfo.canCreateTask}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!taskLimitInfo.canCreateTask}
                  >
                    {taskLimitInfo.canCreateTask
                      ? "Create Task"
                      : "Task Limit Reached"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Tasks Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Your latest maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {task.priority} priority • {task.status}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No tasks yet. Create your first maintenance task above.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">User Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  Plan: {taskLimitInfo.planTier}
                  {taskLimitInfo.limit === -1
                    ? " (Unlimited)"
                    : ` (${taskLimitInfo.limit} tasks/week)`}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
