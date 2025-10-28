import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { clubAPI } from "@/services/api";
import type { ClubApplication } from "@/types";

interface Props {
  clubId: string | null;
  open: boolean;
  onClose: () => void;
}
//modal for club admins to view and manage club join applications
export default function ClubApplicationsModal({ clubId, open, onClose }: Props) {
  const [applications, setApplications] = useState<ClubApplication[]>([]);
  const [loading, setLoading] = useState(false);
//loads applications 
  const loadApplications = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const res = await clubAPI.getClubApplications(clubId);
      if (res.success) setApplications(res.applications);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadApplications();
  }, [open]);
// handels accept / deny for club applications
// updated backend and removes applicatoin from list on success
  const handleAction = async (appId: string, action: "accept" | "deny") => {
    if (!clubId) return;
    try {
      await clubAPI.handleClubApplication(clubId, appId, action);
      toast.success(`Application ${action === "accept" ? "accepted" : "denied"}`);
      setApplications(applications.filter(app => app.id !== appId));
    } catch {
      toast.error("Failed to process application");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Club Applications</DialogTitle>
      <DialogContent>
        {loading ? (
          <div>Loading...</div>
        ) : applications.length === 0 ? (
          <div>No pending applications.</div>
        ) : (
          <ul className="space-y-4">
            {applications.map(app => (
              <li key={app.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{app.name} ({app.student_id})</div>
                  <div className="text-sm text-gray-500">{app.reason}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAction(app.id, "accept")}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(app.id, "deny")}>Deny</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}