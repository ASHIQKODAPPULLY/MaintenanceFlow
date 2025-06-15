"use client";

import { useState } from "react";
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
import { createPropertyAction } from "@/app/actions";
import { Home, MapPin, FileText } from "lucide-react";

interface PropertyFormProps {
  onSuccess?: () => void;
}

export default function PropertyForm({ onSuccess }: PropertyFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createPropertyAction(formData);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home size={20} />
            Add New Property
          </CardTitle>
          <CardDescription>
            Create a new property to manage maintenance tasks and schedules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <Home size={16} />
                Property Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Downtown Apartment, Beach House"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin size={16} />
                Address
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, State 12345"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="property_type">Property Type</Label>
              <Select name="property_type" disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="cabin">Cabin</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText size={16} />
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Special instructions, amenities, or important details..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Property..." : "Create Property"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
