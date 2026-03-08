import type { Notification } from "@/lib/api/notification";

type UserRole = "musician" | "organizer" | "admin";

const RESTRICTED_TYPES: Partial<Record<Notification["type"], UserRole[]>> = {
  new_application: ["organizer"],
  application_accepted: ["musician"],
  application_rejected: ["musician"],
  verification_request: ["admin"],
};

const ORGANIZER_VERIFICATION_PATTERN =
  /\borganizer verification\b|\byour organizer profile\b|\byour organizer verification request\b/i;
const MUSICIAN_VERIFICATION_PATTERN =
  /\bmusician verification\b|\byour musician profile\b|\byour musician verification request\b/i;

const getNotificationText = (notification: Notification) =>
  `${notification.title || ""} ${notification.content || ""}`;

const normalizeId = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    if (
      typeof objectValue._id === "string" ||
      typeof objectValue._id === "number"
    ) {
      return String(objectValue._id);
    }

    if (
      typeof objectValue.id === "string" ||
      typeof objectValue.id === "number"
    ) {
      return String(objectValue.id);
    }

    if (typeof objectValue.toString === "function") {
      const converted = objectValue.toString();
      if (converted && converted !== "[object Object]") {
        return converted;
      }
    }
  }

  return "";
};

const getKnownRole = (role?: string | null): UserRole | null => {
  if (role === "musician" || role === "organizer" || role === "admin") {
    return role;
  }
  return null;
};

export const isNotificationVisibleForRole = (
  notification: Notification,
  role?: string | null,
): boolean => {
  const knownRole = getKnownRole(role);
  if (!knownRole) {
    return true;
  }

  const allowedRoles = RESTRICTED_TYPES[notification.type];
  if (allowedRoles && !allowedRoles.includes(knownRole)) {
    return false;
  }

  const text = getNotificationText(notification);
  if (knownRole === "musician" && ORGANIZER_VERIFICATION_PATTERN.test(text)) {
    return false;
  }

  if (knownRole === "organizer" && MUSICIAN_VERIFICATION_PATTERN.test(text)) {
    return false;
  }

  return true;
};

export const isNotificationVisibleForUser = (
  notification: Notification,
  role?: string | null,
  currentUserId?: string | null,
): boolean => {
  const normalizedCurrentUserId = normalizeId(currentUserId);
  const normalizedNotificationUserId = normalizeId(notification.userId);

  if (
    normalizedCurrentUserId &&
    normalizedNotificationUserId &&
    normalizedCurrentUserId !== normalizedNotificationUserId
  ) {
    return false;
  }

  return isNotificationVisibleForRole(notification, role);
};

export const filterNotificationsForRole = (
  notifications: Notification[],
  role?: string | null,
) =>
  notifications.filter((notification) =>
    isNotificationVisibleForRole(notification, role),
  );

export const filterNotificationsForUser = (
  notifications: Notification[],
  role?: string | null,
  currentUserId?: string | null,
) =>
  notifications.filter((notification) =>
    isNotificationVisibleForUser(notification, role, currentUserId),
  );
