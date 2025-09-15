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
import { Plus, Trash2, Phone } from "lucide-react";
import { EmergencyContactData } from "./index";

interface EmergencyContactsProps {
  contacts: EmergencyContactData[];
  onUpdate: (contacts: EmergencyContactData[]) => void;
  className?: string;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  contacts,
  onUpdate,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingContacts, setEditingContacts] =
    useState<EmergencyContactData[]>(contacts);

  const addContact = () => {
    const newContact: EmergencyContactData = {
      id: Date.now().toString(),
      name: "",
      phone: "",
      relationship: "",
      priority: "secondary",
    };
    setEditingContacts([...editingContacts, newContact]);
  };

  const updateContact = (
    id: string,
    field: keyof EmergencyContactData,
    value: string
  ) => {
    setEditingContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const removeContact = (id: string) => {
    setEditingContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const handleSave = () => {
    const validContacts = editingContacts.filter(
      (contact) => contact.name.trim() && contact.phone.trim()
    );
    onUpdate(validContacts);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingContacts(contacts);
    setIsEditing(false);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Emergency Contacts
        </CardTitle>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {editingContacts.map((contact) => (
              <div
                key={contact.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={contact.name}
                    onChange={(e) =>
                      updateContact(contact.id, "name", e.target.value)
                    }
                    placeholder="Contact name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={contact.phone}
                    onChange={(e) =>
                      updateContact(contact.id, "phone", e.target.value)
                    }
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Relationship</Label>
                  <Input
                    value={contact.relationship}
                    onChange={(e) =>
                      updateContact(contact.id, "relationship", e.target.value)
                    }
                    placeholder="e.g., Parent, Spouse"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Priority</Label>
                  <div className="flex gap-2">
                    <Select
                      value={contact.priority}
                      onValueChange={(value: "primary" | "secondary") =>
                        updateContact(contact.id, "priority", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={addContact}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No emergency contacts added yet.
              </p>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        contact.priority === "primary"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.relationship}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {contact.phone}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
