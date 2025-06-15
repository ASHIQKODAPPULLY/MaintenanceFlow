"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updatePropertyAction, deletePropertyAction } from "@/app/actions";
import {
  Home,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Calendar,
  CheckSquare,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  address?: string;
  property_type?: string;
  notes?: string;
  created_at: string;
  task_count?: number;
}

interface PropertyListProps {
  properties: Property[];
  onUpdate?: () => void;
}

export default function PropertyList({
  properties = [],
  onUpdate,
}: PropertyListProps) {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleEdit = async (formData: FormData) => {
    if (!editingProperty) return;

    setIsSubmitting(true);
    try {
      formData.append("id", editingProperty.id);
      await updatePropertyAction(formData);
      setEditingProperty(null);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    setIsDeleting(propertyId);
    try {
      const formData = new FormData();
      formData.append("id", propertyId);
      await deletePropertyAction(formData);
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting property:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="bg-white">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
            <p className="text-muted-foreground text-center">
              Create your first property to start managing maintenance tasks.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Home size={18} />
                    {property.name}
                  </CardTitle>
                  {property.address && (
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {property.address}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProperty(property)}
                      >
                        <Edit size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Property</DialogTitle>
                        <DialogDescription>
                          Update property information and settings.
                        </DialogDescription>
                      </DialogHeader>
                      {editingProperty && (
                        <form action={handleEdit} className="space-y-4">
                          <div>
                            <Label htmlFor="edit_name">Property Name *</Label>
                            <Input
                              id="edit_name"
                              name="name"
                              defaultValue={editingProperty.name}
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_address">Address</Label>
                            <Input
                              id="edit_address"
                              name="address"
                              defaultValue={editingProperty.address || ""}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_property_type">
                              Property Type
                            </Label>
                            <Select
                              name="property_type"
                              defaultValue={editingProperty.property_type || ""}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="apartment">
                                  Apartment
                                </SelectItem>
                                <SelectItem value="house">House</SelectItem>
                                <SelectItem value="condo">Condo</SelectItem>
                                <SelectItem value="townhouse">
                                  Townhouse
                                </SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="cabin">Cabin</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit_notes">Notes</Label>
                            <Textarea
                              id="edit_notes"
                              name="notes"
                              defaultValue={editingProperty.notes || ""}
                              rows={3}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? "Updating..." : "Update Property"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingProperty(null)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(property.id)}
                    disabled={isDeleting === property.id}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {property.property_type && (
                  <Badge variant="secondary" className="capitalize">
                    {property.property_type.replace("_", " ")}
                  </Badge>
                )}

                {property.notes && (
                  <div className="flex items-start gap-2">
                    <FileText
                      size={14}
                      className="text-muted-foreground mt-0.5"
                    />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {property.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Created {new Date(property.created_at).toLocaleDateString()}
                  </div>
                  {property.task_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <CheckSquare size={14} />
                      {property.task_count} task
                      {property.task_count !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
