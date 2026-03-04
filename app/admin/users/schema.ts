import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["musician", "organizer", "admin"]),
  profilePicture: z.any().optional(),
});

export const UpdateUserSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(["musician", "organizer", "admin"]),
  profilePicture: z.any().optional(),
});

export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;
export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;

export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  role: "musician" | "organizer" | "admin";
  isVerified?: boolean;
  verificationRequested?: boolean;
  profileId?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}
