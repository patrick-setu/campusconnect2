// component for displaying club members list in modal
import React, { useEffect, useState } from "react";
import { clubAPI } from "@/services/api";
import { useRouter } from "next/navigation";
import { User, X } from "lucide-react";
import toast from "react-hot-toast";

interface ClubMembersModalProps {
  clubId: string | null;
  open: boolean;
  onClose: () => void;
}

interface ClubMember {
  membership_id: string;
  user_id: string;
  role: string;
  join_date: string;
  name: string;
  email: string;
  display_name?: string;
  profile_image_url?: string;
  about?: string;
  interests?: string[];
  current_courses?: string[];
  is_public?: boolean;
}

export function ClubMembersModal({ clubId, open, onClose }: ClubMembersModalProps) {
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // when opened with a valid id load members
    if (open && clubId) {
      loadMembers();
    } else {
      setMembers([]);
    }
  }, [open, clubId]);

  // load the list of members for this club
  const loadMembers = async () => {
    if (!clubId) return;
    
    setLoading(true);
    try {
      const response = await clubAPI.getClubMembers(clubId);
      if (response.success && response.data?.members) {
        setMembers(response.data.members);
      } else {
        toast.error(response.message || "Failed to load members");
      }
    } catch (error: any) {
      console.error("Failed to load members:", error);
      toast.error(error.response?.data?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  // close modal and go to the user's profile page
  const handleViewProfile = (userId: string) => {
    onClose();
    router.push(`/profile/${userId}`);
  };

  if (!open || !clubId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col relative">
        {/* header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Club Members</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* members List  */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.membership_id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  {/* member info */}
                  <div className="flex items-center space-x-4">
                    {/* profile photo */}
                    <div className="flex-shrink-0">
                      {member.profile_image_url ? (
                        <img
                          src={member.profile_image_url}
                          alt={member.display_name || member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* name and role in club */}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.display_name || member.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {member.role}
                      </p>
                      {member.about && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {member.about}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* view profile button */}
                  <button
                    onClick={() => handleViewProfile(member.user_id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer with num of members */}
        {!loading && members.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-600">
            {members.length} {members.length === 1 ? 'member' : 'members'} in this club
          </div>
        )}
      </div>
    </div>
  );
}
