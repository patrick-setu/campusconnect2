"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogActions } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { UpdateProfileForm, UserProfile } from "@/types";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: UserProfile | null;
  onSave: (form: UpdateProfileForm) => Promise<void> | void;
}

// modal popup for editing profile 
export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onClose, initial, onSave }) => {
  const [form, setForm] = useState<UpdateProfileForm>({
    display_name: "",
    profile_image_url: "",
    about: "",
    interests: "",
    current_courses: "",
    is_public: true,
  });
  const [saving, setSaving] = useState(false);

  // fill in form with existing data when pop up opens
  useEffect(() => {
    if (initial) {
      setForm({
        display_name: initial.display_name ?? "",
        profile_image_url: initial.profile_image_url ?? "",
        about: initial.about ?? "",
        interests: initial.interests?.join(", ") ?? "",
        current_courses: initial.current_courses?.join(", ") ?? "",
        is_public: initial.is_public ?? true,
      });
    }
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle>Edit Profile</DialogTitle>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm mb-1">Display Name</label>
            <Input name="display_name" value={form.display_name || ""} onChange={handleChange} placeholder="e.g., john smith" />
          </div>
          <div>
            <label className="block text-sm mb-1">Profile Image URL</label>
            <Input name="profile_image_url" value={form.profile_image_url || ""} onChange={handleChange} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm mb-1">About</label>
            <textarea name="about" value={form.about || ""} onChange={handleChange} rows={4} placeholder="Tell others about yourself" className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm mb-1">Current Courses (comma-separated)</label>
            <Input name="current_courses" value={(form.current_courses as string) || ""} onChange={handleChange} placeholder="COMP504, COMP602" />
          </div>
          <div>
            <label className="block text-sm mb-1">Interests (comma-separated)</label>
            <Input name="interests" value={(form.interests as string) || ""} onChange={handleChange} placeholder="AI, Web Dev, Design" />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={form.is_public}
              onChange={(e) => setForm(prev => ({ ...prev, is_public: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="is_public" className="text-sm">
              Make profile visible to others
            </label>
          </div>
        </div>
        <DialogActions>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
