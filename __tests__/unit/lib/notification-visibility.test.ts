import {
  filterNotificationsForUser,
  filterNotificationsForRole,
  isNotificationVisibleForUser,
  isNotificationVisibleForRole,
} from "@/lib/notification-visibility";
import type { Notification } from "@/lib/api/notification";

const makeNotification = (
  overrides: Partial<Notification> = {},
): Notification => ({
  _id: "notif-1",
  userId: "user-1",
  type: "system",
  title: "System update",
  content: "A generic notification.",
  relatedId: undefined,
  isRead: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("notification visibility by role", () => {
  it("hides organizer-only application notifications from musicians", () => {
    const notif = makeNotification({ type: "new_application" });

    expect(isNotificationVisibleForRole(notif, "musician")).toBe(false);
    expect(isNotificationVisibleForRole(notif, "organizer")).toBe(true);
  });

  it("hides musician-only status notifications from organizers", () => {
    const notif = makeNotification({ type: "application_accepted" });

    expect(isNotificationVisibleForRole(notif, "organizer")).toBe(false);
    expect(isNotificationVisibleForRole(notif, "musician")).toBe(true);
  });

  it("hides admin-only verification requests from non-admin roles", () => {
    const notif = makeNotification({ type: "verification_request" });

    expect(isNotificationVisibleForRole(notif, "musician")).toBe(false);
    expect(isNotificationVisibleForRole(notif, "organizer")).toBe(false);
    expect(isNotificationVisibleForRole(notif, "admin")).toBe(true);
  });

  it("hides organizer verification messages from musicians", () => {
    const notif = makeNotification({
      type: "verification_approved",
      title: "Organizer verification approved",
      content: "Your organizer profile has been verified by admin.",
    });

    expect(isNotificationVisibleForRole(notif, "musician")).toBe(false);
    expect(isNotificationVisibleForRole(notif, "organizer")).toBe(true);
  });

  it("hides musician verification messages from organizers", () => {
    const notif = makeNotification({
      type: "verification_rejected",
      title: "Musician verification rejected",
      content:
        "Your musician verification request was not approved. Please review your profile and try again.",
    });

    expect(isNotificationVisibleForRole(notif, "organizer")).toBe(false);
    expect(isNotificationVisibleForRole(notif, "musician")).toBe(true);
  });

  it("filters a mixed list for musician role", () => {
    const notifications = [
      makeNotification({ _id: "1", type: "new_application" }),
      makeNotification({ _id: "2", type: "application_accepted" }),
      makeNotification({
        _id: "3",
        type: "verification_approved",
        title: "Organizer verification approved",
        content: "Your organizer profile has been verified by admin.",
      }),
      makeNotification({ _id: "4", type: "new_message" }),
    ];

    const visible = filterNotificationsForRole(notifications, "musician");

    expect(visible.map((n) => n._id)).toEqual(["2", "4"]);
  });

  it("hides notifications that belong to another user", () => {
    const notif = makeNotification({
      _id: "foreign-notif",
      userId: "organizer-user-id",
      type: "new_message",
      title: "New message from musician",
    });

    expect(
      isNotificationVisibleForUser(notif, "musician", "musician-user-id"),
    ).toBe(false);
  });

  it("shows notifications when notification userId matches current user", () => {
    const notif = makeNotification({
      _id: "my-notif",
      userId: "musician-user-id",
      type: "new_message",
      title: "New message from organizer",
    });

    expect(
      isNotificationVisibleForUser(notif, "musician", "musician-user-id"),
    ).toBe(true);
  });

  it("filters by both role and user ownership", () => {
    const notifications = [
      makeNotification({
        _id: "1",
        userId: "musician-user-id",
        type: "application_accepted",
      }),
      makeNotification({
        _id: "2",
        userId: "organizer-user-id",
        type: "new_message",
      }),
      makeNotification({
        _id: "3",
        userId: "musician-user-id",
        type: "new_application",
      }),
      makeNotification({
        _id: "4",
        userId: "musician-user-id",
        type: "new_message",
      }),
    ];

    const visible = filterNotificationsForUser(
      notifications,
      "musician",
      "musician-user-id",
    );

    expect(visible.map((n) => n._id)).toEqual(["1", "4"]);
  });
});
