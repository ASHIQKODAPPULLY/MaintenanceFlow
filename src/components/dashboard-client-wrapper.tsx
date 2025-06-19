"use client";

import { useState } from "react";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import PropertyForm from "@/components/property-form";
import PropertyList from "@/components/property-list";
import TaskForm from "@/components/task-form";
import MaintenanceLog from "@/components/maintenance-log";
import PropertyLog from "@/components/property-log";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  CheckSquare,
  ChevronDown,
  BarChart3,
  Plus,
  Settings,
  FileText,
  DollarSign,
  Clock,
  TrendingUp,
  Eye,
  Calendar,
  Building,
  PieChart,
  Activity,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DashboardClientWrapperProps {
  propertiesWithTaskCount: any[];
  usersForAssignment: any[];
  tasks: any[];
  taskLimitInfo: any;
  isAdmin: boolean;
  userId?: string;
}

export default function DashboardClientWrapper({
  propertiesWithTaskCount,
  usersForAssignment,
  tasks,
  taskLimitInfo,
  isAdmin,
  userId,
}: DashboardClientWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState("overview");
  const [costAnalytics, setCostAnalytics] = useState<any>(null);
  const [timeAnalytics, setTimeAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    // Force a page refresh to get updated data from server
    window.location.reload();
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("../../supabase/client");
      const supabase = createClient();

      // Determine if we're viewing plant or property analytics
      const isPlantView = activeView.startsWith("plant-");

      // Fetch maintenance logs for cost and time analysis
      let query = supabase.from("maintenance_logs").select(`
          *,
          properties(name, property_type),
          plants(name, plant_type),
          tasks(title, priority)
        `);

      // Filter by plant or property based on current view
      if (isPlantView) {
        query = query.not("plant_id", "is", null);
      } else {
        query = query.not("property_id", "is", null);
      }

      if (!isAdmin && userId) {
        query = query.eq("user_id", userId);
      }

      const { data: maintenanceLogs } = await query;

      // Calculate cost analytics
      const totalCost =
        maintenanceLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
      const totalTime =
        maintenanceLogs?.reduce(
          (sum, log) => sum + (log.labor_hours || 0),
          0,
        ) || 0;

      // Group by categories
      const costByCategory =
        maintenanceLogs?.reduce((acc, log) => {
          const category = log.log_type || "uncategorized";
          acc[category] = (acc[category] || 0) + (log.cost || 0);
          return acc;
        }, {}) || {};

      const timeByCategory =
        maintenanceLogs?.reduce((acc, log) => {
          const category = log.log_type || "uncategorized";
          acc[category] = (acc[category] || 0) + (log.labor_hours || 0);
          return acc;
        }, {}) || {};

      // Group by property or plant based on current view
      const costByLocation =
        maintenanceLogs?.reduce((acc, log) => {
          const locationName = isPlantView
            ? log.plants?.name || "Unknown Plant"
            : log.properties?.name || "Unknown Property";
          acc[locationName] = (acc[locationName] || 0) + (log.cost || 0);
          return acc;
        }, {}) || {};

      const timeByLocation =
        maintenanceLogs?.reduce((acc, log) => {
          const locationName = isPlantView
            ? log.plants?.name || "Unknown Plant"
            : log.properties?.name || "Unknown Property";
          acc[locationName] = (acc[locationName] || 0) + (log.labor_hours || 0);
          return acc;
        }, {}) || {};

      // Group by task
      const costByTask =
        maintenanceLogs?.reduce((acc, log) => {
          const taskTitle = log.tasks?.title || log.title || "Unknown Task";
          if (!acc[taskTitle]) {
            acc[taskTitle] = {
              cost: 0,
              time: 0,
              count: 0,
              priority: log.tasks?.priority || log.priority || "normal",
            };
          }
          acc[taskTitle].cost += log.cost || 0;
          acc[taskTitle].time += log.labor_hours || 0;
          acc[taskTitle].count += 1;
          return acc;
        }, {}) || {};

      setCostAnalytics({
        total: totalCost,
        byCategory: costByCategory,
        byProperty: costByLocation,
        byTask: costByTask,
        logs: maintenanceLogs || [],
        isPlantView: isPlantView,
      });

      setTimeAnalytics({
        total: totalTime,
        byCategory: timeByCategory,
        byProperty: timeByLocation,
        byTask: costByTask, // Same structure for tasks
        logs: maintenanceLogs || [],
        isPlantView: isPlantView,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics when component mounts or view changes to analytics
  React.useEffect(() => {
    if (
      activeView === "cost-analytics" ||
      activeView === "plant-cost-analytics" ||
      activeView === "overview"
    ) {
      fetchAnalytics();
    }
  }, [activeView, userId, isAdmin]);

  const getViewTitle = () => {
    switch (activeView) {
      case "overview":
        return "Properties Overview";
      case "properties":
        return "Properties Management";
      case "property-overview":
        return "Properties Dashboard";
      case "tasks":
        return "Property Tasks";
      case "create":
        return "Create New Items";
      case "property-setup":
        return "Property Setup";
      case "maintenance-log":
        return "Maintenance Log";
      case "property-log":
        return "Property Activity Log";
      case "cost-analytics":
        return "Cost & Time Analytics";
      case "plant-overview":
        return "Plant Overview";
      case "plant-dashboard":
        return "Plant Dashboard";
      case "plant-management":
        return "Plant Management";
      case "plant-tasks":
        return "Plant Tasks";
      case "plant-maintenance-log":
        return "Plant Maintenance Log";
      case "plant-log":
        return "Plant Activity Log";
      case "plant-cost-analytics":
        return "Plant Cost & Time Analytics";
      case "plant-setup":
        return "Plant Setup";
      default:
        return "Properties Overview";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Property Management Navigation Header */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {getViewTitle()}
            </h2>
            <Badge variant="outline" className="text-xs">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </Badge>
          </div>

          {/* Main Navigation Dropdown */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  Navigation
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Dashboard Sections</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Properties Section with Sub-items */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Home className="mr-2 h-4 w-4" />
                    Properties
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => setActiveView("overview")}
                      className={activeView === "overview" ? "bg-accent" : ""}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Overview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("property-overview")}
                      className={
                        activeView === "property-overview" ? "bg-accent" : ""
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("properties")}
                      className={activeView === "properties" ? "bg-accent" : ""}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Management
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("tasks")}
                      className={activeView === "tasks" ? "bg-accent" : ""}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Tasks
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("maintenance-log")}
                      className={
                        activeView === "maintenance-log" ? "bg-accent" : ""
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Maintenance Log
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("property-log")}
                      className={
                        activeView === "property-log" ? "bg-accent" : ""
                      }
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Property Log
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("cost-analytics")}
                      className={
                        activeView === "cost-analytics" ? "bg-accent" : ""
                      }
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Cost & Time Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setActiveView("property-setup")}
                      className={
                        activeView === "property-setup" ? "bg-accent" : ""
                      }
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Property Setup
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Plant Section with Sub-items */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Building className="mr-2 h-4 w-4" />
                    Plant
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-overview")}
                      className={
                        activeView === "plant-overview" ? "bg-accent" : ""
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Overview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-dashboard")}
                      className={
                        activeView === "plant-dashboard" ? "bg-accent" : ""
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-management")}
                      className={
                        activeView === "plant-management" ? "bg-accent" : ""
                      }
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Management
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-tasks")}
                      className={
                        activeView === "plant-tasks" ? "bg-accent" : ""
                      }
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Tasks
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-maintenance-log")}
                      className={
                        activeView === "plant-maintenance-log"
                          ? "bg-accent"
                          : ""
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Maintenance Log
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-log")}
                      className={activeView === "plant-log" ? "bg-accent" : ""}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Plant Log
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-cost-analytics")}
                      className={
                        activeView === "plant-cost-analytics" ? "bg-accent" : ""
                      }
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Cost & Time Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-setup")}
                      className={
                        activeView === "plant-setup" ? "bg-accent" : ""
                      }
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Plant Setup
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setActiveView("create")}
                  className={activeView === "create" ? "bg-accent" : ""}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRefresh}>
                  Refresh Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveView("create")}>
                  Add Property
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveView("create")}>
                  Create Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home size={20} />
                Properties Overview
              </CardTitle>
              <CardDescription>
                {propertiesWithTaskCount.length > 0
                  ? `You have ${propertiesWithTaskCount.length} propert${propertiesWithTaskCount.length !== 1 ? "ies" : "y"}`
                  : "No properties created yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesWithTaskCount.length > 0 ? (
                <div className="space-y-3">
                  {propertiesWithTaskCount.slice(0, 3).map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{property.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {property.property_type || "Property"} •{" "}
                          {property.task_count} task
                          {property.task_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  {propertiesWithTaskCount.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{propertiesWithTaskCount.length - 3} more properties
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Create your first property to get started.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare size={20} />
                {isAdmin ? "All Recent Tasks" : "Recent Tasks"}
                {isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    Admin View
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Latest maintenance tasks from all users"
                  : "Your latest maintenance tasks"}
              </CardDescription>
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
                          {task.properties && (
                            <span className="ml-2 text-blue-600">
                              • {task.properties.name}
                            </span>
                          )}
                          {task.assigned_user && (
                            <span className="ml-2 text-purple-600">
                              • Assigned to:{" "}
                              {task.assigned_user.name ||
                                task.assigned_user.full_name ||
                                task.assigned_user.email}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="ml-2 text-orange-600">
                              • Due:{" "}
                              {new Date(task.due_date).toLocaleDateString(
                                "en-US",
                              )}
                            </span>
                          )}
                          {task.completed_at && (
                            <span className="ml-2 text-green-600">
                              • Completed:{" "}
                              {new Date(task.completed_at).toLocaleDateString(
                                "en-US",
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString("en-US")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isAdmin
                    ? "No tasks in the system yet."
                    : "No tasks yet. Create your first maintenance task."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "property-overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home size={20} />
                Properties Summary
              </CardTitle>
              <CardDescription>
                Overview of all your properties and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesWithTaskCount.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {propertiesWithTaskCount.length}
                      </div>
                      <div className="text-sm text-blue-700">
                        Total Properties
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {propertiesWithTaskCount.reduce(
                          (sum, prop) => sum + prop.task_count,
                          0,
                        )}
                      </div>
                      <div className="text-sm text-green-700">Total Tasks</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {propertiesWithTaskCount.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{property.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property.property_type || "Property"}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {property.task_count} task
                          {property.task_count !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No properties created yet. Create your first property to get
                  started.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Property Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Property Types
              </CardTitle>
              <CardDescription>
                Distribution of property types in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesWithTaskCount.length > 0 ? (
                <div className="space-y-3">
                  {(() => {
                    const typeCount = propertiesWithTaskCount.reduce(
                      (acc, prop) => {
                        const type = prop.property_type || "Unspecified";
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      },
                      {},
                    );

                    return Object.entries(typeCount).map(([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {count} propert{count !== 1 ? "ies" : "y"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{count}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(
                              (count / propertiesWithTaskCount.length) * 100,
                            )}
                            %
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No property data available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "properties" && (
        <div className="space-y-6">
          <PropertyList
            properties={propertiesWithTaskCount}
            onUpdate={handleRefresh}
          />
        </div>
      )}

      {activeView === "tasks" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare size={20} />
              All Tasks
              {isAdmin && (
                <Badge variant="outline" className="text-xs">
                  Admin View
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "All maintenance tasks in the system"
                : "All your maintenance tasks"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge
                          variant={
                            task.priority === "urgent"
                              ? "destructive"
                              : task.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.description && (
                          <span>
                            {task.description.slice(0, 100)}
                            {task.description.length > 100 ? "..." : ""} •{" "}
                          </span>
                        )}
                        {task.properties && (
                          <span className="text-blue-600">
                            {task.properties.name}
                          </span>
                        )}
                        {task.assigned_user && (
                          <span className="ml-2 text-purple-600">
                            • Assigned to:{" "}
                            {task.assigned_user.name ||
                              task.assigned_user.full_name ||
                              task.assigned_user.email}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="ml-2 text-orange-600">
                            • Due:{" "}
                            {new Date(task.due_date).toLocaleDateString(
                              "en-US",
                            )}
                          </span>
                        )}
                        {task.completed_at && (
                          <span className="ml-2 text-green-600">
                            • Completed:{" "}
                            {new Date(task.completed_at).toLocaleDateString(
                              "en-US",
                            )}
                          </span>
                        )}
                      </p>
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {task.checklist.length} checklist item
                            {task.checklist.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>Created</div>
                      <div>
                        {new Date(task.created_at).toLocaleDateString("en-US")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isAdmin
                  ? "No tasks in the system yet."
                  : "No tasks yet. Create your first maintenance task."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeView === "create" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PropertyForm onSuccess={handleRefresh} />
            <TaskForm
              properties={propertiesWithTaskCount}
              users={usersForAssignment}
              onSuccess={handleRefresh}
              canCreateTask={taskLimitInfo.canCreateTask}
              taskLimitMessage={
                !taskLimitInfo.canCreateTask
                  ? `Task limit reached (${taskLimitInfo.currentCount}/${taskLimitInfo.limit} this week on ${taskLimitInfo.planTier} plan)`
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {activeView === "property-setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Property Setup
            </CardTitle>
            <CardDescription>
              Configure your property settings and maintenance equipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Property Information
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">
                        Property Configuration
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Set up your property details, room layouts, and
                        equipment inventory.
                      </p>
                      <Button variant="outline" size="sm">
                        Configure Property
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Equipment Registry</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Register and manage all property equipment and
                        appliances.
                      </p>
                      <Button variant="outline" size="sm">
                        Manage Equipment
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Maintenance Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">
                        Maintenance Schedules
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Set up preventive maintenance schedules and intervals.
                      </p>
                      <Button variant="outline" size="sm">
                        Setup Schedules
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Safety Protocols</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Configure safety checklists and compliance requirements.
                      </p>
                      <Button variant="outline" size="sm">
                        Configure Safety
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Quick Setup Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default">Import Property List</Button>
                  <Button variant="outline">Setup Room Layouts</Button>
                  <Button variant="outline">Configure Alerts</Button>
                  <Button variant="outline">Generate QR Codes</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeView === "maintenance-log" && (
        <MaintenanceLog isAdmin={isAdmin} userId={userId} />
      )}

      {activeView === "property-log" && (
        <PropertyLog isAdmin={isAdmin} userId={userId} />
      )}

      {(activeView === "cost-analytics" ||
        activeView === "plant-cost-analytics") && (
        <div className="space-y-6">
          {/* Analytics Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                {activeView === "plant-cost-analytics"
                  ? "Plant"
                  : "Property"}{" "}
                Cost & Time Analytics
                {isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    Admin View
                  </Badge>
                )}
                {activeView === "plant-cost-analytics" && (
                  <Badge variant="secondary" className="text-xs">
                    Plant View
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Comprehensive cost and time tracking for{" "}
                {activeView === "plant-cost-analytics"
                  ? "plants"
                  : "properties"}{" "}
                with drill-down capabilities
              </CardDescription>
            </CardHeader>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          ${costAnalytics?.total?.toFixed(0) || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Cost
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          {timeAnalytics?.total?.toFixed(1) || 0}h
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Time
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          {costAnalytics?.logs?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Records
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          $
                          {(
                            (costAnalytics?.total || 0) /
                            (timeAnalytics?.total || 1)
                          ).toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cost per Hour
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Smart Charts - Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart size={18} />
                      Cost Distribution by Category
                    </CardTitle>
                    <CardDescription>
                      Visual breakdown of maintenance costs across categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Chart Visualization */}
                      <div className="relative h-48 mb-6">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-40 h-40">
                            {/* Donut Chart Simulation */}
                            <div className="w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden">
                              {Object.entries(
                                costAnalytics?.byCategory || {},
                              ).map(([category, cost], index) => {
                                const percentage =
                                  ((cost as number) /
                                    (costAnalytics?.total || 1)) *
                                  100;
                                const colors = [
                                  "border-blue-500",
                                  "border-green-500",
                                  "border-purple-500",
                                  "border-orange-500",
                                  "border-red-500",
                                ];
                                const bgColors = [
                                  "bg-blue-500",
                                  "bg-green-500",
                                  "bg-purple-500",
                                  "bg-orange-500",
                                  "bg-red-500",
                                ];
                                return (
                                  <div
                                    key={category}
                                    className={`absolute inset-0 rounded-full ${colors[index % colors.length]}`}
                                    style={{
                                      background: `conic-gradient(${bgColors[index % bgColors.length].replace("bg-", "")} ${percentage}%, transparent ${percentage}%)`,
                                      transform: `rotate(${Object.entries(
                                        costAnalytics?.byCategory || {},
                                      )
                                        .slice(0, index)
                                        .reduce(
                                          (acc, [, c]) =>
                                            acc +
                                            ((c as number) /
                                              (costAnalytics?.total || 1)) *
                                              360,
                                          0,
                                        )}deg)`,
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg font-bold">
                                  ${costAnalytics?.total?.toFixed(0) || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Total
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Legend and Progress Bars */}
                      <div className="space-y-3">
                        {Object.entries(costAnalytics?.byCategory || {}).map(
                          ([category, cost], index) => {
                            const percentage =
                              ((cost as number) / (costAnalytics?.total || 1)) *
                              100;
                            const colors = [
                              "bg-blue-500",
                              "bg-green-500",
                              "bg-purple-500",
                              "bg-orange-500",
                              "bg-red-500",
                            ];
                            return (
                              <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                                    />
                                    <span className="font-medium capitalize text-sm">
                                      {category.replace("_", " ")}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">
                                      ${(cost as number).toFixed(0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {percentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity size={18} />
                      Time Distribution by Category
                    </CardTitle>
                    <CardDescription>
                      Visual breakdown of time spent across maintenance
                      categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Bar Chart Visualization */}
                      <div className="h-48 flex items-end justify-center gap-2 p-4">
                        {Object.entries(timeAnalytics?.byCategory || {}).map(
                          ([category, time], index) => {
                            const maxTime = Math.max(
                              ...Object.values(timeAnalytics?.byCategory || {}),
                            ) as number;
                            const height = ((time as number) / maxTime) * 100;
                            const colors = [
                              "bg-blue-500",
                              "bg-green-500",
                              "bg-purple-500",
                              "bg-orange-500",
                              "bg-red-500",
                            ];
                            return (
                              <div
                                key={category}
                                className="flex flex-col items-center gap-2 flex-1 max-w-16"
                              >
                                <div className="text-xs font-medium text-center">
                                  {(time as number).toFixed(1)}h
                                </div>
                                <div
                                  className={`w-full ${colors[index % colors.length]} rounded-t transition-all duration-500 min-h-2`}
                                  style={{ height: `${Math.max(height, 8)}%` }}
                                />
                                <div className="text-xs text-muted-foreground text-center capitalize leading-tight">
                                  {category
                                    .replace("_", " ")
                                    .split(" ")
                                    .map((word) => word.slice(0, 4))
                                    .join(" ")}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-3">
                        {Object.entries(timeAnalytics?.byCategory || {}).map(
                          ([category, time], index) => {
                            const percentage =
                              ((time as number) / (timeAnalytics?.total || 1)) *
                              100;
                            const colors = [
                              "bg-blue-500",
                              "bg-green-500",
                              "bg-purple-500",
                              "bg-orange-500",
                              "bg-red-500",
                            ];
                            return (
                              <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                                    />
                                    <span className="font-medium capitalize text-sm">
                                      {category.replace("_", " ")}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">
                                      {(time as number).toFixed(1)}h
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {percentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Smart Charts - Property Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building size={18} />
                      {activeView === "plant-cost-analytics"
                        ? "Plant"
                        : "Property"}{" "}
                      Cost Performance
                    </CardTitle>
                    <CardDescription>
                      Comparative cost analysis across{" "}
                      {activeView === "plant-cost-analytics"
                        ? "plants"
                        : "properties"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Horizontal Bar Chart */}
                      <div className="space-y-4">
                        {Object.entries(costAnalytics?.byProperty || {}).map(
                          ([property, cost], index) => {
                            const maxCost = Math.max(
                              ...Object.values(costAnalytics?.byProperty || {}),
                            ) as number;
                            const percentage =
                              ((cost as number) / maxCost) * 100;
                            const totalPercentage =
                              ((cost as number) / (costAnalytics?.total || 1)) *
                              100;
                            const colors = [
                              "bg-emerald-500",
                              "bg-blue-500",
                              "bg-purple-500",
                              "bg-orange-500",
                              "bg-red-500",
                            ];
                            return (
                              <div key={property} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                                    />
                                    <span className="font-medium text-sm truncate max-w-32">
                                      {property}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">
                                      ${(cost as number).toFixed(0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {totalPercentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                      className={`h-3 rounded-full ${colors[index % colors.length]} transition-all duration-700`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>

                      {/* Summary Stats */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-emerald-600">
                              {
                                Object.keys(costAnalytics?.byProperty || {})
                                  .length
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {activeView === "plant-cost-analytics"
                                ? "Plants"
                                : "Properties"}
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              $
                              {(
                                (costAnalytics?.total || 0) /
                                Math.max(
                                  Object.keys(costAnalytics?.byProperty || {})
                                    .length,
                                  1,
                                )
                              ).toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Avg Cost
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building size={18} />
                      {activeView === "plant-cost-analytics"
                        ? "Plant"
                        : "Property"}{" "}
                      Time Efficiency
                    </CardTitle>
                    <CardDescription>
                      Time allocation and efficiency metrics by{" "}
                      {activeView === "plant-cost-analytics"
                        ? "plant"
                        : "property"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stacked Area Chart Simulation */}
                      <div className="h-32 flex items-end gap-1 p-2 bg-gradient-to-t from-gray-50 to-transparent rounded">
                        {Object.entries(timeAnalytics?.byProperty || {}).map(
                          ([property, time], index) => {
                            const maxTime = Math.max(
                              ...Object.values(timeAnalytics?.byProperty || {}),
                            ) as number;
                            const height = ((time as number) / maxTime) * 100;
                            const colors = [
                              "bg-cyan-500",
                              "bg-indigo-500",
                              "bg-pink-500",
                              "bg-amber-500",
                              "bg-teal-500",
                            ];
                            return (
                              <div
                                key={property}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <div className="text-xs font-medium">
                                  {(time as number).toFixed(1)}h
                                </div>
                                <div
                                  className={`w-full ${colors[index % colors.length]} rounded-t transition-all duration-700 min-h-2`}
                                  style={{ height: `${Math.max(height, 10)}%` }}
                                />
                              </div>
                            );
                          },
                        )}
                      </div>

                      {/* Detailed Time Breakdown */}
                      <div className="space-y-3">
                        {Object.entries(timeAnalytics?.byProperty || {}).map(
                          ([property, time], index) => {
                            const totalPercentage =
                              ((time as number) / (timeAnalytics?.total || 1)) *
                              100;
                            const colors = [
                              "bg-cyan-500",
                              "bg-indigo-500",
                              "bg-pink-500",
                              "bg-amber-500",
                              "bg-teal-500",
                            ];
                            const efficiency =
                              ((costAnalytics?.byProperty?.[
                                property
                              ] as number) || 0) / ((time as number) || 1);
                            return (
                              <div
                                key={property}
                                className="p-3 border rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                                    />
                                    <span className="font-medium text-sm">
                                      {property}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">
                                      {(time as number).toFixed(1)}h
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {totalPercentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>
                                    Efficiency: ${efficiency.toFixed(0)}/hour
                                  </span>
                                  <Progress
                                    value={totalPercentage}
                                    className="w-20 h-1"
                                  />
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Task Breakdown with Drill-down */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare size={18} />
                    Cost & Time by Task
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown by individual tasks with drill-down
                    capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Records</TableHead>
                          <TableHead>Avg Cost/Hour</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(costAnalytics?.byTask || {}).map(
                          ([taskTitle, data]) => {
                            const taskData = data as any;
                            return (
                              <TableRow key={taskTitle}>
                                <TableCell>
                                  <div className="font-medium">{taskTitle}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      taskData.priority === "urgent"
                                        ? "destructive"
                                        : taskData.priority === "high"
                                          ? "default"
                                          : "secondary"
                                    }
                                    className="capitalize"
                                  >
                                    {taskData.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <DollarSign
                                      size={14}
                                      className="text-muted-foreground"
                                    />
                                    <span>${taskData.cost.toFixed(0)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock
                                      size={14}
                                      className="text-muted-foreground"
                                    />
                                    <span>{taskData.time.toFixed(1)}h</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {taskData.count}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  $
                                  {taskData.time > 0
                                    ? (taskData.cost / taskData.time).toFixed(0)
                                    : "0"}
                                </TableCell>
                                <TableCell>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Eye size={14} />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Task Details: {taskTitle}
                                        </DialogTitle>
                                        <DialogDescription>
                                          Detailed records for this task
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                              ${taskData.cost.toFixed(0)}
                                            </div>
                                            <div className="text-sm text-green-700">
                                              Total Cost
                                            </div>
                                          </div>
                                          <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                              {taskData.time.toFixed(1)}h
                                            </div>
                                            <div className="text-sm text-blue-700">
                                              Total Time
                                            </div>
                                          </div>
                                          <div className="p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                              {taskData.count}
                                            </div>
                                            <div className="text-sm text-purple-700">
                                              Records
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold mb-3">
                                            Related Records
                                          </h4>
                                          <div className="space-y-2">
                                            {costAnalytics?.logs
                                              ?.filter(
                                                (log: any) =>
                                                  (log.tasks?.title ||
                                                    log.title) === taskTitle,
                                              )
                                              ?.map(
                                                (log: any, index: number) => (
                                                  <div
                                                    key={index}
                                                    className="p-3 border rounded-lg"
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <div>
                                                        <div className="font-medium">
                                                          {log.title}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                          {activeView ===
                                                          "plant-cost-analytics"
                                                            ? log.plants?.name
                                                            : log.properties
                                                                ?.name}{" "}
                                                          •{" "}
                                                          {new Date(
                                                            log.completion_date ||
                                                              log.created_at,
                                                          ).toLocaleDateString()}
                                                        </div>
                                                      </div>
                                                      <div className="text-right">
                                                        <div className="font-semibold">
                                                          ${log.cost || 0}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                          {log.labor_hours || 0}
                                                          h
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            );
                          },
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
