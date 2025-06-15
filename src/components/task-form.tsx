"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createTaskAction } from "@/app/actions";
import { CheckSquare, Plus, X, Calendar, AlertCircle } from "lucide-react";

interface Property {
  id: string;
  name: string;
  address?: string;
  property_type?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskFormProps {
  properties?: Property[];
  users?: User[];
  onSuccess?: () => void;
  canCreateTask?: boolean;
  taskLimitMessage?: string;
}

export default function TaskForm({
  properties = [],
  users = [],
  onSuccess,
  canCreateTask = true,
  taskLimitMessage,
}: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [taskType, setTaskType] = useState("recurring");

  const handleSubmit = async (formData: FormData) => {
    if (!canCreateTask) return;

    setIsSubmitting(true);
    try {
      // Add checklist to form data
      formData.append("checklist", JSON.stringify(checklistItems));
      formData.append("task_type", taskType);

      await createTaskAction(formData);

      // Reset form
      setChecklistItems([]);
      setNewChecklistItem("");
      setTaskType("recurring");

      onSuccess?.();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, newChecklistItem.trim()]);
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChecklistItem();
    }
  };

  return (
    <div className="bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare size={20} />
            Create New Task
          </CardTitle>
          <CardDescription>
            Schedule maintenance tasks with automated reminders and checklists.
          </CardDescription>
          {!canCreateTask && taskLimitMessage && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle size={16} className="text-orange-600" />
              <span className="text-sm text-orange-800">
                {taskLimitMessage}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Clean HVAC filters, Check smoke detectors"
                required
                disabled={isSubmitting || !canCreateTask}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed instructions for completing this task..."
                rows={3}
                disabled={isSubmitting || !canCreateTask}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_id">Property *</Label>
                <Select
                  name="property_id"
                  disabled={isSubmitting || !canCreateTask}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                        {property.address && (
                          <span className="text-muted-foreground ml-2">
                            - {property.address}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select
                  name="assigned_to"
                  disabled={isSubmitting || !canCreateTask}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                        <span className="text-muted-foreground ml-2">
                          - {user.email}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Select
                  value={taskType}
                  onValueChange={setTaskType}
                  disabled={isSubmitting || !canCreateTask}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="stay_based">Stay-Based</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="asset_id">Link to Asset (Optional)</Label>
                <Input
                  id="asset_id"
                  name="asset_id"
                  placeholder="e.g., HVAC Unit #1, Kitchen Sink"
                  disabled={isSubmitting || !canCreateTask}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  name="priority"
                  disabled={isSubmitting || !canCreateTask}
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
                  disabled={isSubmitting || !canCreateTask}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="after_checkout">
                      After Checkout
                    </SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="datetime-local"
                  disabled={isSubmitting || !canCreateTask}
                />
              </div>
            </div>

            {/* Checklist Section */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <CheckSquare size={16} />
                Task Checklist
              </Label>

              {/* Add new checklist item */}
              <div className="flex gap-2 mb-3">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add checklist item..."
                  disabled={isSubmitting || !canCreateTask}
                />
                <Button
                  type="button"
                  onClick={addChecklistItem}
                  size="sm"
                  disabled={
                    isSubmitting || !canCreateTask || !newChecklistItem.trim()
                  }
                >
                  <Plus size={16} />
                </Button>
              </div>

              {/* Display checklist items */}
              {checklistItems.length > 0 && (
                <div className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(index)}
                        disabled={isSubmitting || !canCreateTask}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                  <Badge variant="secondary" className="text-xs">
                    {checklistItems.length} checklist item
                    {checklistItems.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !canCreateTask}
            >
              {isSubmitting
                ? "Creating Task..."
                : canCreateTask
                  ? "Create Task"
                  : "Task Limit Reached"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
