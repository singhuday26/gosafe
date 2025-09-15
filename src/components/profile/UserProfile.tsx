import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Phone, Mail, MapPin, Globe } from "lucide-react";
import { UserProfileData } from "./index";

interface UserProfileProps {
  profile: UserProfileData;
  onEdit?: () => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  onEdit,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Profile Information</CardTitle>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <p className="text-muted-foreground">Tourist ID: {profile.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.phone}</span>
            </div>
          )}

          {profile.nationality && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.nationality}</span>
            </div>
          )}

          {profile.age && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Age: {profile.age}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Preferences</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Language: {profile.preferences.language}
            </Badge>
            <Badge variant="outline">
              Font: {profile.preferences.accessibility.fontSize}
            </Badge>
            {profile.preferences.notifications.push && (
              <Badge variant="secondary">Push Notifications</Badge>
            )}
            {profile.preferences.privacy.shareLocation && (
              <Badge variant="secondary">Location Sharing</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
