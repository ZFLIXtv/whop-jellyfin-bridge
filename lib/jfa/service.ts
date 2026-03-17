import { jfaRequest } from "@/lib/jfa/client";

export type JfaUser = {
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
  const response = await jfaRequest<JfaUsersResponse>({
    method: "GET",
    url: "/users",
  });

  return response.data.users ?? [];
}

export async function findUserByIdentity(identity: string): Promise<JfaUser | null> {
  const users = await getAllUsers();
  const normalized = identity.trim().toLowerCase();

  const user = users.find((u) => {
    const name = (u.name || "").trim().toLowerCase();
    const email = (u.email || "").trim().toLowerCase();

    return name === normalized || email === normalized;
  });

  return user ?? null;
}

export async function findUserByName(name: string): Promise<JfaUser | null> {
  const users = await getAllUsers();
  const normalized = name.trim().toLowerCase();

  const user = users.find(
    (u) => (u.name || "").trim().toLowerCase() === normalized
  );

  return user ?? null;
}

type JfaInvite = {
  code?: string;
  send_to?: string;
  sent_to?: {
    success?: string[];
    failed?: { address?: string; reason?: string }[];
  };
  valid_till?: number;
  used_by?: Record<string, number>;
};

type JfaInvitesResponse = {
  invites: JfaInvite[];
};

export async function getAllInvites(): Promise<JfaInvite[]> {
  const response = await jfaRequest<JfaInvitesResponse>({
    method: "GET",
    url: "/invites",
  });

  return response.data.invites ?? [];
}

export async function findActiveInviteByEmail(email: string): Promise<JfaInvite | null> {
  const invites = await getAllInvites();
  const normalized = email.trim().toLowerCase();
  const now = Date.now();

  const invite = invites.find((inv) => {
    const deprecatedSendTo = (inv.send_to || "").trim().toLowerCase();

    const sentToSuccess = (inv.sent_to?.success || []).map((x) =>
      (x || "").trim().toLowerCase()
    );

    const matchesEmail =
      deprecatedSendTo === normalized || sentToSuccess.includes(normalized);

    const stillValid =
      typeof inv.valid_till !== "number" || inv.valid_till === 0 || inv.valid_till > now;

    const unused = !inv.used_by || Object.keys(inv.used_by).length === 0;

    return matchesEmail && stillValid && unused;
  });

  return invite ?? null;
}

export async function createInvite30Days(email: string) {
  const payload = {
    days: 7,
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

  const response = await jfaRequest({
    method: "POST",
    url: "/invites",
    data: payload,
  });

  return response.data;
}

export async function createInvite5Days(email: string) {
  const payload = {
    days: 7,
    hours: 0,
    minutes: 0,
    months: 0,
    "multiple-uses": false,
    "no-limit": false,
    profile: "DefaultProfile",
    "remaining-uses": 1,
    "send-to": email,
    "user-days": 5,
    "user-expiry": true,
    "user-hours": 0,
    "user-minutes": 0,
    "user-months": 0,
    user_label: "Whop Trial",
    label: "Whop Trial Invite",
  };

  const response = await jfaRequest({
    method: "POST",
    url: "/invites",
    data: payload,
  });

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

  const response = await jfaRequest({
    method: "POST",
    url: "/users/extend",
    data: payload,
  });

  return response.data;
}

export async function extendUser5Days(userId: string) {
  const payload = {
    days: 5,
    hours: 0,
    minutes: 0,
    months: 0,
    notify: true,
    reason: "Whop free trial",
    timestamp: 0,
    try_extend_from_previous_expiry: true,
    users: [userId],
  };

  const response = await jfaRequest({
    method: "POST",
    url: "/users/extend",
    data: payload,
  });

  return response.data;
}

export async function enableUser(userId: string) {
  const payload = {
    enabled: true,
    notify: true,
    reason: "Whop payment reactivation",
    users: [userId],
  };

  const response = await jfaRequest({
    method: "POST",
    url: "/users/enable",
    data: payload,
  });

  return response.data;
}