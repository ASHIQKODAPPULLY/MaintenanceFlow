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
  FileText,
  Download,
  Filter,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Shield,
  Clock,
  DollarSign,
  User,
  Building,
  Search,
  Eye,
} from "lucide-react";
import { createClient } from "../../supabase/client";

interface MaintenanceLog {
  id: string;
  task_id?: string;
  property_id?: string;
  user_id?: string;
  log_type: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  completion_date?: string;
  inspection_date?: string;
  inspector_name?: string;
  inspector_certification?: string;
  compliance_status?: string;
  cost?: number;
  labor_hours?: number;
  materials_used?: string;
  safety_notes?: string;
  next_inspection_due?: string;
  regulatory_requirements?: string;
  qa_approved?: boolean;
  qa_approved_by?: string;
  qa_approved_date?: string;
  legal_compliance_verified?: boolean;
  created_at: string;
  updated_at?: string;
  properties?: { name: string; address?: string };
  tasks?: { title: string };
  users?: { name?: string; email?: string };
}

interface MaintenanceLogProps {
  isAdmin?: boolean;
  userId?: string;
}

export default function MaintenanceLog({
  isAdmin = false,
  userId,
}: MaintenanceLogProps) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    logType: "all",
    complianceStatus: "all",
    dateRange: "all",
    search: "",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("maintenance_logs")
        .select(
          `
          *,
          properties(name, address),
          tasks(title),
          users(name, email)
        `,
        )
        .order("completion_date", { ascending: false });

      // If not admin, filter by user
      if (!isAdmin && userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching maintenance logs:", error);
        return;
      }

      setLogs(data || []);
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

    // Compliance status filter
    if (filters.complianceStatus !== "all") {
      filtered = filtered.filter(
        (log) => log.compliance_status === filters.complianceStatus,
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
        const logDate = new Date(log.completion_date || log.created_at);
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
          log.inspector_name?.toLowerCase().includes(searchLower),
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
      "Compliance",
      "Inspector",
      "Cost",
      "Labor Hours",
      "QA Approved",
      "Legal Compliance",
    ];

    const csvData = filteredLogs.map((log) => [
      new Date(log.completion_date || log.created_at).toLocaleDateString(),
      log.title,
      log.properties?.name || "N/A",
      log.log_type,
      log.status,
      log.compliance_status || "N/A",
      log.inspector_name || "N/A",
      log.cost ? `$${log.cost}` : "N/A",
      log.labor_hours || "N/A",
      log.qa_approved ? "Yes" : "No",
      log.legal_compliance_verified ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maintenance-log-${new Date().toISOString().split("T")[0]}.csv`;
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

  const getComplianceBadge = (status?: string) => {
    if (!status) return null;

    const isCompliant = status === "compliant";
    return (
      <Badge
        variant={isCompliant ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isCompliant ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
        {status.toUpperCase()}
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
              <p className="text-muted-foreground">
                Loading maintenance logs...
              </p>
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
                <FileText size={20} />
                Maintenance Log
                {isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    Admin View
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Comprehensive maintenance records for legal inspections, QA, and
                compliance documentation
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
              <Label>Log Type</Label>
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
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Compliance</Label>
              <Select
                value={filters.complianceStatus}
                onValueChange={(value) =>
                  setFilters({ ...filters, complianceStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Compliance</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
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
                    complianceStatus: "all",
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
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{filteredLogs.length}</div>
                <div className="text-xs text-muted-foreground">Total Logs</div>
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
                  {filteredLogs.filter((log) => log.qa_approved).length}
                </div>
                <div className="text-xs text-muted-foreground">QA Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {
                    filteredLogs.filter(
                      (log) => log.compliance_status === "compliant",
                    ).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Compliant</div>
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
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>
            {filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
              <p className="text-muted-foreground">
                No maintenance logs match your current filters.
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
                    <TableHead>Compliance</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>QA</TableHead>
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
                            {new Date(
                              log.completion_date || log.created_at,
                            ).toLocaleDateString()}
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
                          <span className="text-sm">
                            {log.properties?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.log_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {getComplianceBadge(log.compliance_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-muted-foreground" />
                          <span className="text-sm">
                            {log.inspector_name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
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
                        {log.qa_approved ? (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1"
                          >
                            <CheckCircle size={12} />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
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
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{log.title}</DialogTitle>
                              <DialogDescription>
                                Detailed maintenance log record
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-6">
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
                                        {selectedLog.log_type}
                                      </div>
                                      <div>
                                        <strong>Status:</strong>{" "}
                                        {getStatusBadge(selectedLog.status)}
                                      </div>
                                      <div>
                                        <strong>Priority:</strong>{" "}
                                        {selectedLog.priority || "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Inspection Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Inspector:</strong>{" "}
                                        {selectedLog.inspector_name || "N/A"}
                                      </div>
                                      <div>
                                        <strong>Certification:</strong>{" "}
                                        {selectedLog.inspector_certification ||
                                          "N/A"}
                                      </div>
                                      <div>
                                        <strong>Compliance:</strong>{" "}
                                        {getComplianceBadge(
                                          selectedLog.compliance_status,
                                        )}
                                      </div>
                                      <div>
                                        <strong>Legal Compliance:</strong>{" "}
                                        {selectedLog.legal_compliance_verified ? (
                                          <Badge variant="default">
                                            Verified
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary">
                                            Pending
                                          </Badge>
                                        )}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Cost & Labor
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Cost:</strong>{" "}
                                        {selectedLog.cost
                                          ? `$${selectedLog.cost}`
                                          : "N/A"}
                                      </div>
                                      <div>
                                        <strong>Labor Hours:</strong>{" "}
                                        {selectedLog.labor_hours || "N/A"}
                                      </div>
                                      <div>
                                        <strong>Materials:</strong>{" "}
                                        {selectedLog.materials_used || "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      QA & Compliance
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>QA Approved:</strong>{" "}
                                        {selectedLog.qa_approved ? (
                                          <Badge variant="default">Yes</Badge>
                                        ) : (
                                          <Badge variant="secondary">No</Badge>
                                        )}
                                      </div>
                                      {selectedLog.qa_approved_date && (
                                        <div>
                                          <strong>QA Date:</strong>{" "}
                                          {new Date(
                                            selectedLog.qa_approved_date,
                                          ).toLocaleDateString()}
                                        </div>
                                      )}
                                      {selectedLog.next_inspection_due && (
                                        <div>
                                          <strong>Next Inspection:</strong>{" "}
                                          {new Date(
                                            selectedLog.next_inspection_due,
                                          ).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {selectedLog.safety_notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Safety Notes
                                    </h4>
                                    <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
                                      {selectedLog.safety_notes}
                                    </p>
                                  </div>
                                )}

                                {selectedLog.regulatory_requirements && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Regulatory Requirements
                                    </h4>
                                    <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                                      {selectedLog.regulatory_requirements}
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
