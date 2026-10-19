import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, KeyRound, LogOut, Moon, Bell } from "lucide-react";
import { getAppContext } from "@/lib/auth/session";
import { getProjectsForUser } from "@/lib/data";
import { logoutAction } from "@/lib/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export default async function SettingsPage() {
  const ctx = await getAppContext();
  if (!ctx) notFound();
  const { user, projectId } = ctx;
  const projects = await getProjectsForUser(user.userId);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Manage your profile, projects and preferences." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>How you appear across the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar name={user.fullName} className="size-14 text-lg" />
            <div>
              <p className="text-base font-semibold text-ink-strong">{user.fullName}</p>
              <p className="text-sm text-ink-muted">{user.jobTitle}</p>
              <p className="text-sm text-ink-muted">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your projects</CardTitle>
            <CardDescription>Engagements you&apos;re assigned to.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border-default p-3">
                <span className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-brand/10 text-brand">
                  <Building2 className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-strong">{p.name}</p>
                  <p className="truncate text-xs text-ink-muted">{p.client}</p>
                </div>
                {p.id === projectId ? <Badge variant="brand">Active</Badge> : <Badge variant="neutral">{p.status}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Display and notification options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Moon, label: "Dark mode", hint: "Planned for a later iteration" },
              { icon: Bell, label: "Email notifications", hint: "Planned for a later iteration" },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between rounded-[var(--radius-md)] border border-border-default p-3">
                <div className="flex items-center gap-3">
                  <pref.icon className="size-4 text-ink-muted" />
                  <div>
                    <p className="text-sm font-medium text-ink-strong">{pref.label}</p>
                    <p className="text-xs text-ink-muted">{pref.hint}</p>
                  </div>
                </div>
                <span className="h-6 w-10 rounded-full bg-border-default opacity-60" aria-hidden="true" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Password and session.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/reset-password">
                <KeyRound className="size-4" /> Change password
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                <LogOut className="size-4" /> Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
