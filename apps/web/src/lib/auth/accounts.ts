import { USER_ADMIN, USER_MANAGER, USER_MEMBER } from "@/lib/data/dataset";

/**
 * Demo accounts for the Stage-A mock auth. Passwords are deliberately simple and
 * shown on the login screen, this is a synthetic demo, not a real credential store.
 * Replaced by Supabase Auth in a later stage.
 */
export interface DemoAccount {
  userId: string;
  email: string;
  password: string;
  roleLabel: string;
}

export const DEMO_PASSWORD = "Compass#2026";

export const demoAccounts: DemoAccount[] = [
  { userId: USER_MEMBER, email: "noah.bennett@accenture.com", password: DEMO_PASSWORD, roleLabel: "New joiner (Member)" },
  { userId: USER_MANAGER, email: "maria.osei@accenture.com", password: DEMO_PASSWORD, roleLabel: "Project Lead (Manager)" },
  { userId: USER_ADMIN, email: "tom.whitfield@accenture.com", password: DEMO_PASSWORD, roleLabel: "Engagement Partner (Admin)" },
];

export function findAccount(email: string, password: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase();
  return (
    demoAccounts.find(
      (a) => a.email === normalized && a.password === password,
    ) ?? null
  );
}
