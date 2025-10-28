import React from "react";
import { cookies } from "next/headers";
import type { UserProfile } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { User, Calendar, BookOpen, Heart } from "lucide-react";

interface Props {
  params: { id: string };
}

// public profile view, shows someone else's profile
export default async function PublicProfilePage({ params }: Props) {
  // fetch user data from backend
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  // pass auth token so backend (which requires auth) allows access to public profiles
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const res = await fetch(`${base}/api/users/${params.id}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  
  // handle if profile is private or does not exist
  if (!data?.success || !data.data.profile) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Available</h2>
            <p className="text-gray-600">This profile is either private or does not exist.</p>
          </Card>
        </div>
      </Layout>
    );
  }
  const user = data.data.user as { id: string; name: string; created_at: string };
  const profile = (data.data.profile || null) as UserProfile | null;

  // display the user's public profile
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <img
              src={profile?.profile_image_url || "/images/profiles/.gitkeep"}
              alt={profile?.display_name || user.name}
              className="w-20 h-20 rounded-full object-cover bg-gray-100"
            />
            <div>
              <h1 className="text-2xl font-semibold">{profile?.display_name || user.name}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <Calendar size={16} />
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
            <User size={20} />
            About
          </h2>
          <p className="text-gray-700 whitespace-pre-line">{profile?.about || "No information yet."}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
            <BookOpen size={20} />
            Current Courses
          </h2>
          <div className="flex flex-wrap gap-2">
            {(profile?.current_courses || []).map((c) => (
              <span key={c} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">{c}</span>
            ))}
            {!profile?.current_courses?.length && <span className="text-gray-500">No courses listed.</span>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Heart size={20} />
            Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {(profile?.interests || []).map((i) => (
              <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">{i}</span>
            ))}
            {!profile?.interests?.length && <span className="text-gray-500">No interests listed.</span>}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
