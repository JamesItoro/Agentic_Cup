"use client";
import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function InviteDialog() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function invite() {
    if (!email) return;
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setOpen(false);
      toast({
        tone: "success",
        title: "Invitation sent (simulated)",
        description: `${email} would be invited as ${role}. Real invites use Supabase Auth later.`,
      });
      setEmail("");
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" /> Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Send an invitation scoped to this project. Access is granted per project and per role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Work email</Label>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@accenture.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Project role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface-card px-3 text-sm text-ink-strong focus-visible:outline-none focus-visible:border-brand"
            >
              <option value="member">Member (new joiner)</option>
              <option value="manager">Manager (project lead / buddy)</option>
              <option value="admin">Admin (project administrator)</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={invite} disabled={!email || pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
