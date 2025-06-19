"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Home,
  Download,
  Filter,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  Building,
  Search,
  Eye,
  Edit,
  Plus,
  MapPin,
  FileText,
} from "lucide-react";
import { createClient } from "../../supabase/client";

interface PropertyLog {
  id: string;
  property_id: string;
  user_id?: string;
  log_type: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  event_date: string;
  cost?: number;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
  properties?: { name: string; address?: string; property_type?: string };
  users?: { name?: string; email?: string };
}

interface PropertyLogProps {
  isAdmin?: boolean;
  userId?: string;
}

export default function PropertyLog({
  isAdmin = false,
  userId,
}: PropertyLogProps) {
  const [logs, setLogs] = useState<PropertyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<PropertyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<PropertyLog | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    logType: "all",
    propertyId: "all",
    dateRange: "all",
    search: "",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchProperties();
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from("properties")
        .select("id, name, address, property_type")
        .order("name", { ascending: true });

      // If not admin, filter by user's properties
      if (!isAdmin && userId) {
        query = query.eq("owner_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching properties:", error);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // For now, we'll simulate property logs using existing data
      // In a real implementation, you'd have a property_logs table
      let query = supabase
        .from("properties")
        .select(
          `
          *,
          tasks!property_id(count)
        `,
        )
        .order("created_at", { ascending: false });

      // If not admin, filter by user
      if (!isAdmin && userId) {
        query = query.eq("owner_id", userId);
      }

      const { data: propertiesData, error } = await query;

      if (error) {
        console.error("Error fetching property data:", error);
        return;
      }

      // Transform properties into log entries
      const propertyLogs: PropertyLog[] = (propertiesData || []).map(
        (property) => ({
          id: `property-${property.id}`,
          property_id: property.id,
          user_id: property.owner_id,
          log_type: "property_created",
          title: `Property Created: ${property.name}`,
          description: `New property added to the system${property.address ? ` at ${property.address}` : ""}`,
          status: "completed",
          priority: "normal",
          event_date: property.created_at,
          created_at: property.created_at,
          properties: {
            name: property.name,
            address: property.address,
            property_type: property.property_type,
          },
        }),
      );

      // Fetch task-related logs for properties
      const { data: tasksData } = await supabase
        .from("tasks")
        .select(
          `
          *,
          properties(name, address, property_type)
        `,
        )
        .order("created_at", { ascending: false });

      const taskLogs: PropertyLog[] = (tasksData || []).map((task) => ({
        id: `task-${task.id}`,
        property_id: task.property_id,
        user_id: task.assigned_to,
        log_type: "task_activity",
        title: `Task ${task.status === "completed" ? "Completed" : "Created"}: ${task.title}`,
        description:
          task.description || `Task ${task.status} for property maintenance`,
        status: task.status || "pending",
        priority: task.priority || "normal",
        event_date: task.completed_at || task.created_at,
        created_at: task.created_at,
        properties: task.properties,
      }));

      // Combine and sort all logs
      const allLogs = [...propertyLogs, ...taskLogs].sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
      );

      setLogs(allLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((log) => log.status === filters.status);
    }

    // Log type filter
    if (filters.logType !== "all") {
      filtered = filtered.filter((log) => log.log_type === filters.logType);
    }

    // Property filter
    if (filters.propertyId !== "all") {
      filtered = filtered.filter(
        (log) => log.property_id === filters.propertyId,
      );
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.event_date);
        return logDate >= filterDate;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.title.toLowerCase().includes(searchLower) ||
          log.description?.toLowerCase().includes(searchLower) ||
          log.properties?.name.toLowerCase().includes(searchLower) ||
          log.properties?.address?.toLowerCase().includes(searchLower),
      );
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Title",
      "Property",
      "Type",
      "Status",
      "Priority",
      "Description",
      "Cost",
    ];

    const csvData = filteredLogs.map((log) => [
      new Date(log.event_date).toLocaleDateString(),
      log.title,
      log.properties?.name || "N/A",
      log.log_type.replace("_", " "),
      log.status,
      log.priority || "N/A",
      log.description || "N/A",
      log.cost ? `$${log.cost}` : "N/A",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `property-log-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, icon: CheckCircle },
      pending: { variant: "secondary" as const, icon: Clock },
      in_progress: { variant: "outline" as const, icon: Clock },
      failed: { variant: "destructive" as const, icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const priorityConfig = {
      urgent: { variant: "destructive" as const },
      high: { variant: "default" as const },
      normal: { variant: "secondary" as const },
      low: { variant: "outline" as const },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || {
      variant: "secondary" as const,
    };

    return (
      <Badge variant={config.variant} className="capitalize">
        {priority}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="bg-white">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading property logs...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home size={20} />
                Property Activity Log
                {isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    Admin View
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Comprehensive activity log for all property-related events,
                changes, and maintenance activities
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              <Button onClick={fetchLogs} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter size={18} />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Property</Label>
              <Select
                value={filters.propertyId}
                onValueChange={(value) =>
                  setFilters({ ...filters, propertyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Activity Type</Label>
              <Select
                value={filters.logType}
                onValueChange={(value) =>
                  setFilters({ ...filters, logType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="property_created">
                    Property Created
                  </SelectItem>
                  <SelectItem value="property_updated">
                    Property Updated
                  </SelectItem>
                  <SelectItem value="task_activity">Task Activity</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters({ ...filters, dateRange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() =>
                  setFilters({
                    status: "all",
                    logType: "all",
                    propertyId: "all",
                    dateRange: "all",
                    search: "",
                  })
                }
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{filteredLogs.length}</div>
                <div className="text-xs text-muted-foreground">
                  Total Activities
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {
                    filteredLogs.filter((log) => log.status === "completed")
                      .length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{properties.length}</div>
                <div className="text-xs text-muted-foreground">Properties</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  $
                  {filteredLogs
                    .reduce((sum, log) => sum + (log.cost || 0), 0)
                    .toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Activity Records</CardTitle>
          <CardDescription>
            {filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
              <p className="text-muted-foreground">
                No property activities match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar
                            size={14}
                            className="text-muted-foreground"
                          />
                          <span className="text-sm">
                            {new Date(log.event_date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.title}</div>
                          {log.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {log.description.slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building
                            size={14}
                            className="text-muted-foreground"
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {log.properties?.name || "N/A"}
                            </div>
                            {log.properties?.property_type && (
                              <div className="text-xs text-muted-foreground capitalize">
                                {log.properties.property_type}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.log_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{getPriorityBadge(log.priority)}</TableCell>
                      <TableCell>
                        {log.cost ? (
                          <div className="flex items-center gap-1">
                            <DollarSign
                              size={14}
                              className="text-muted-foreground"
                            />
                            <span className="text-sm">${log.cost}</span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{log.title}</DialogTitle>
                              <DialogDescription>
                                Detailed property activity record
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Basic Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Property:</strong>{" "}
                                        {selectedLog.properties?.name || "N/A"}
                                      </div>
                                      <div>
                                        <strong>Type:</strong>{" "}
                                        {selectedLog.log_type.replace("_", " ")}
                                      </div>
                                      <div>
                                        <strong>Status:</strong>{" "}
                                        {getStatusBadge(selectedLog.status)}
                                      </div>
                                      <div>
                                        <strong>Priority:</strong>{" "}
                                        {getPriorityBadge(selectedLog.priority)}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Property Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Address:</strong>{" "}
                                        {selectedLog.properties?.address ||
                                          "N/A"}
                                      </div>
                                      <div>
                                        <strong>Property Type:</strong>{" "}
                                        {selectedLog.properties
                                          ?.property_type || "N/A"}
                                      </div>
                                      <div>
                                        <strong>Event Date:</strong>{" "}
                                        {new Date(
                                          selectedLog.event_date,
                                        ).toLocaleDateString()}
                                      </div>
                                      <div>
                                        <strong>Cost:</strong>{" "}
                                        {selectedLog.cost
                                          ? `$${selectedLog.cost}`
                                          : "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {selectedLog.description && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Description
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedLog.description}
                                    </p>
                                  </div>
                                )}

                                {selectedLog.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Notes
                                    </h4>
                                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                                      {selectedLog.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
