import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserProfileData } from "./index";

interface ProfileFormProps {
  profile: UserProfileData;
  onSave: (updatedProfile: UserProfileData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
  isLoading = false,
  className = "",
}) => {
  const [formData, setFormData] = useState<UserProfileData>(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (
    field: keyof UserProfileData,
    value: string | number | UserProfileData["preferences"]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePreference = (
    category: keyof typeof profile.preferences,
    field: string,
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...(prev.preferences[category] as Record<string, boolean | string>),
          [field]: value,
        },
      },
    }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality || ""}
                onChange={(e) => updateField("nationality", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ""}
                onChange={(e) =>
                  updateField("age", parseInt(e.target.value) || undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                value={formData.preferences.language}
                onValueChange={(value) =>
                  updateField("preferences", {
                    ...formData.preferences,
                    language: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Notification Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <Switch
                  id="pushNotifications"
                  checked={formData.preferences.notifications.push}
                  onCheckedChange={(checked) =>
                    updatePreference("notifications", "push", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <Switch
                  id="smsNotifications"
                  checked={formData.preferences.notifications.sms}
                  onCheckedChange={(checked) =>
                    updatePreference("notifications", "sms", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={formData.preferences.notifications.email}
                  onCheckedChange={(checked) =>
                    updatePreference("notifications", "email", checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Privacy Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="shareLocation">Share Location</Label>
                <Switch
                  id="shareLocation"
                  checked={formData.preferences.privacy.shareLocation}
                  onCheckedChange={(checked) =>
                    updatePreference("privacy", "shareLocation", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowTracking">Allow Tracking</Label>
                <Switch
                  id="allowTracking"
                  checked={formData.preferences.privacy.allowTracking}
                  onCheckedChange={(checked) =>
                    updatePreference("privacy", "allowTracking", checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
