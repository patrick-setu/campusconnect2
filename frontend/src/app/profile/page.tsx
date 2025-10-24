"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/services/api";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Layout } from "@/components/layout/Layout";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar } from "lucide-react";

// users profile page
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(false);

  // load profile when page loads
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login"); // redirect to login page if user not logged in
      } else {
        // fetch profile data
        userAPI.getMyProfile().then((res) => {
          if (res.success && res.data) {
            setProfile(res.data.profile);
          }
        });
      }
    }
  }, [loading, user, router]);


  if (loading || !user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* header card */}
        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{profile?.display_name || user.name}</h1>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <Button onClick={() => setOpen(true)}>Edit Profile</Button>
            </div>
          </div>
        </Card>

        {/* about section */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {profile?.about || "No information yet. Click 'Edit Profile' to add details about yourself."}
          </p>
        </Card>

        {/* current courses section */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Courses</h2>
          <div className="flex flex-wrap gap-2">
            {(profile?.current_courses || []).map((c) => (
              <span key={c} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                {c}
              </span>
            ))}
            {!profile?.current_courses?.length && (
              <p className="text-gray-500">No courses listed yet.</p>
            )}
          </div>
        </Card>

        {/* interests section */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {(profile?.interests || []).map((i) => (
              <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                {i}
              </span>
            ))}
            {!profile?.interests?.length && (
              <p className="text-gray-500">No interests listed yet.</p>
            )}
          </div>
        </Card>
      </div>

      <EditProfileDialog
        open={open}
        onClose={() => setOpen(false)}
        initial={profile}
        onSave={async (form) => {
          // turn comma separated strings into arrays
          const payload = {
            display_name: form.display_name,
            profile_image_url: form.profile_image_url,
            about: form.about,
            interests:
              typeof form.interests === "string"
                ? form.interests.split(",").map((s) => s.trim()).filter(Boolean)
                : form.interests,
            current_courses:
              typeof form.current_courses === "string"
                ? form.current_courses.split(",").map((s) => s.trim()).filter(Boolean)
                : form.current_courses,
          } as any;
          const res = await userAPI.updateMyProfile(payload);
          if (res.success && res.data) {
            setProfile(res.data.profile);
          }
        }}
      />
    </Layout>
  );
}
