import { jfaClient } from "@/lib/jfa/client";

type JfaUser = {
  id: string;
  email?: string;
  name?: string;
  disabled?: boolean;
  expiry?: number;
};

type JfaUsersResponse = {
  last_page: boolean;
  users: JfaUser[];
};

export async function getAllUsers(): Promise<JfaUser[]> {
  const response = await jfaClient.get<JfaUsersResponse>("/users");
  return response.data.users ?? [];
}

export async function findUserByEmail(email: string): Promise<JfaUser | null> {
  const users = await getAllUsers();
  const normalized = email.trim().toLowerCase();

  const user = users.find(
    (u) => (u.email || "").trim().toLowerCase() === normalized
  );

  return user ?? null;
}

export async function createInvite30Days(email: string) {
  const payload = {
    days: 0,
    hours: 0,
    minutes: 0,
    months: 0,
    "multiple-uses": false,
    "no-limit": false,
    profile: "DefaultProfile",
    "remaining-uses": 1,
    "send-to": email,
    "user-days": 30,
    "user-expiry": true,
    "user-hours": 0,
    "user-minutes": 0,
    "user-months": 0,
    user_label: "Whop Customer",
    label: "Whop Invite",
  };

  const response = await jfaClient.post("/invites", payload);
  return response.data;
}

export async function extendUser30Days(userId: string) {
  const payload = {
    days: 30,
    hours: 0,
    minutes: 0,
    months: 0,
    notify: true,
    reason: "Whop payment renewal",
    timestamp: 0,
    try_extend_from_previous_expiry: true,
    users: [userId],
  };

  const response = await jfaClient.post("/users/extend", payload);
  return response.data;
}

export async function enableUser(userId: string) {
  const payload = {
    enabled: true,
    notify: true,
    reason: "Whop payment reactivation",
    users: [userId],
  };

  const response = await jfaClient.post("/users/enable", payload);
  return response.data;
}