"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI, badgeAPI } from "@/services/api";
import type { UserProfile, UserBadge } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Layout } from "@/components/layout/Layout";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import BadgeIcon from "@/components/ui/BadgeIcon";
import BadgeModal from "@/components/ui/BadgeModal";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Award } from "lucide-react";

// users profile page
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [open, setOpen] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);

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
        
        // fetch user badges
        badgeAPI.getUserBadges(user.id).then((res) => {
          if (res.success && res.data) {
            setUserBadges(res.data.badges);
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
                {/* display profile visibility status */}
                <div className="mt-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded ${profile?.is_public ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {profile?.is_public ? 'Public Profile' : 'Private Profile'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Button onClick={() => setOpen(true)}>Edit Profile</Button>
            </div>
          </div>
        </Card>

        {/* badges section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Badges</h2>
            </div>
            <Button 
              onClick={() => setBadgeModalOpen(true)}>View All </Button>
          </div>
          
          {userBadges.length > 0 ? (
            <div className="flex items-center gap-4">
              {/* Displays highest tier badge on the profile */}
              {['clubs', 'notes', 'marketplace'].map(category => {
                const categoryBadges = userBadges.filter(ub => ub.badge?.category === category);
                // if the user has no badges yet in each catagory it gives a placeholder
                if (categoryBadges.length === 0) return (
                  <div key={category} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center opacity-50">
                      <span className="text-gray-400">
                        {category === 'clubs' && '👥'}
                        {category === 'notes' && '📝'}
                        {category === 'marketplace' && '🛒'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 capitalize">{category}</span>
                  </div>
                );

                // Get the tier order (gold > silver > bronze) for when displaying it knows what badge to show
                const tierOrder = { gold: 3, silver: 2, bronze: 1 };
                const highestBadge = categoryBadges.reduce((highest, current) => 
                  tierOrder[current.badge!.tier] > tierOrder[highest.badge!.tier] ? current : highest
                );
                
                return (
                  //displays the highest tier earned badge for each category
                  <div key={category} className="flex flex-col items-center">
                    <BadgeIcon
                      badge={highestBadge.badge!}
                      earned={true}
                      earnedAt={highestBadge.earned_at}
                    />
                    <span className="text-xs text-gray-600 mt-1 capitalize">{category}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <span className="text-gray-500">No badges earned yet. Join clubs, upload notes, or post to marketplace to start earning badges!</span>
            </div>
          )}
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
            is_public: form.is_public,
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

      <BadgeModal
        open={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        userId={user.id}
      />
    </Layout>
  );
}
