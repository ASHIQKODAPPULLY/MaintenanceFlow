"use client";

import { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  CheckSquare,
  ChevronDown,
  BarChart3,
  Plus,
  Settings,
} from "lucide-react";

interface DashboardClientWrapperProps {
  propertiesWithTaskCount: any[];
  usersForAssignment: any[];
  tasks: any[];
  taskLimitInfo: any;
  isAdmin: boolean;
}

export default function DashboardClientWrapper({
  propertiesWithTaskCount,
  usersForAssignment,
  tasks,
  taskLimitInfo,
  isAdmin,
}: DashboardClientWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState("overview");

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    // Force a page refresh to get updated data from server
    window.location.reload();
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "overview":
        return "Plant Overview";
      case "properties":
        return "Properties Management";
      case "property-overview":
        return "Properties Overview";
      case "tasks":
        return "Plant Tasks";
      case "create":
        return "Create New Items";
      case "plant-setup":
        return "Manufacturing Plant Setup";
      default:
        return "Plant Overview";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Manufacturing-Style Navigation Header */}
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

                {/* Plant Section with Sub-items */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Settings className="mr-2 h-4 w-4" />
                    Plant
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
                      onClick={() => setActiveView("tasks")}
                      className={activeView === "tasks" ? "bg-accent" : ""}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Tasks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setActiveView("plant-setup")}
                      className={
                        activeView === "plant-setup" ? "bg-accent" : ""
                      }
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Setup
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Properties Section with Sub-items */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Home className="mr-2 h-4 w-4" />
                    Properties
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => setActiveView("property-overview")}
                      className={
                        activeView === "property-overview" ? "bg-accent" : ""
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Overview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView("properties")}
                      className={activeView === "properties" ? "bg-accent" : ""}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Management
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
                          {isAdmin && task.assigned_to && (
                            <span className="ml-2 text-purple-600">
                              • User: {task.assigned_to.slice(0, 8)}
                              ...
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
                        {task.due_date && (
                          <span className="ml-2">
                            Due:{" "}
                            {new Date(task.due_date).toLocaleDateString(
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

      {activeView === "plant-setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Manufacturing Plant Setup
            </CardTitle>
            <CardDescription>
              Configure your manufacturing plant settings and equipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Plant Information</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Plant Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Set up your manufacturing plant details, production
                        lines, and equipment inventory.
                      </p>
                      <Button variant="outline" size="sm">
                        Configure Plant
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Equipment Registry</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Register and manage all manufacturing equipment and
                        machinery.
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
                  <Button variant="default">Import Equipment List</Button>
                  <Button variant="outline">Setup Production Lines</Button>
                  <Button variant="outline">Configure Alerts</Button>
                  <Button variant="outline">Generate QR Codes</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
