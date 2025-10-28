// modal to show club posts and allow admins to add new ones
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { clubAPI } from "@/services/api";
import type { ClubPost } from "@/types";
import { X, Image as ImageIcon, PlayCircle, PlusCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  clubId: string | null;
  open: boolean;
  onClose: () => void;
  creatorId?: string; // to detect admin rights
}

export default function ClubEventsModal({ clubId, open, onClose, creatorId }: Props) {
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const { user } = useAuth();
  // base URL for media so images/videos load correctly
  const publicBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, ''), []);

  // only admins can add/delete posts
  const isAdmin = useMemo(() => {
    return user?.role === "admin" || (creatorId && user?.id === creatorId);
  }, [user, creatorId]);

  useEffect(() => {
    if (open && clubId) {
      loadPosts();
    } else {
      setPosts([]);
      setTitle("");
      setContent("");
      setLocalFiles([]);
      setMediaUrls([]);
    }
  }, [open, clubId]);

  // fetch posts for club
  const loadPosts = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const res = await clubAPI.getPosts(clubId);
      if (res.success && res.data?.posts) {
        setPosts(res.data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // when user uploads files, upload to backend and store URLs
  const handleFiles = async (files: FileList | null) => {
    if (!files || !clubId) return;
    const arr = Array.from(files);
    setLocalFiles(arr);
    try {
      const res = await clubAPI.uploadClubMedia(clubId, arr);
      if (res.success && res.data?.urls) {
        setMediaUrls(res.data.urls);
      } else {
        toast.error(res.message || "Failed to upload media");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload media");
    }
  };

  // create a new  post
  const publish = async () => {
    if (!clubId) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      setAdding(true);
      const payload: any = { title, content, media_urls: mediaUrls };
      const res = await clubAPI.createPost(clubId, payload);
      if (res.success && res.data?.post) {
        toast.success("Event posted");
        setTitle("");
        setContent("");
        setLocalFiles([]);
        setMediaUrls([]);
        await loadPosts();
      } else {
        toast.error(res.message || "Failed to create post");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setAdding(false);
    }
  };

  // delete a post (only if admin)
  const removePost = async (postId: string) => {
    if (!clubId) return;
    if (!confirm("Delete this post?")) return;
    try {
      const res = await clubAPI.deletePost(clubId, postId);
      if (res.success) {
        toast.success("Deleted");
        loadPosts();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  if (!open || !clubId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[85vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Club Events</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isAdmin && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Add Event</h3>
              <div className="space-y-3">
                <input
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="What happened?"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div>
                  <label className="inline-flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200">
                    <ImageIcon className="w-4 h-4 mr-2" /> Add Media
                    <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                  {localFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {localFiles.map((f, i) => (
                        <div key={i} className="relative h-24 w-full bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {f.type.startsWith('image') ? (
                            <img src={URL.createObjectURL(f)} className="object-cover w-full h-full" />
                          ) : (
                            // show playable preview for vids
                            <video src={URL.createObjectURL(f)} controls className="object-cover w-full h-full" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={publish}
                  disabled={adding}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> {adding ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {loading ? (
            <div>Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-gray-500">No events yet.</div>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => {
                const lines = (p.content || '').split(/\r?\n/);
                const bodyLines: string[] = [];
                const mediaTokens: string[] = [];
                let inMedia = false;
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (/^Media:$/i.test(trimmed)) { inMedia = true; continue; }
                  const hasUpload = trimmed.includes('/uploads/club-events/');
                  if (inMedia && hasUpload) { mediaTokens.push(trimmed); continue; }
                  if (!inMedia && hasUpload) { mediaTokens.push(trimmed); continue; }
                  bodyLines.push(line);
                }
                const bodyText = bodyLines.join('\n').trim();
                const mediaUrls = mediaTokens
                  .flatMap((t) => t.split(/\s+/))
                  .filter((t) => t.includes('/uploads/club-events/'));

                return (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{p.title}</h4>
                      {isAdmin && (
                        <button onClick={() => removePost(p.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {bodyText && (
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{bodyText}</p>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {mediaUrls.map((url) => {
                        // make  URLs absolute for the browser
                        const src = url.startsWith('http') ? url : `${publicBase}${url}`;
                        // quick check by extension to find if it is a vid or picture
                        const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(src);
                        return isVideo ? (
                          // render videos with controls
                          <video key={url} src={src} controls className="rounded object-cover w-full h-40" />
                        ) : (
                          <img key={url} src={src} className="rounded object-cover w-full h-40" />
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Posted on {new Date(p.created_at).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
