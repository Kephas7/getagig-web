import z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
  password: z
    .string()
    .min(6, { message: "Password must have at least 6 characters." }),
});

export type LoginData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email." }),
    username: z.string().min(3, { message: "Minimum 3 characters" }),

    password: z
      .string()
      .min(6, { message: "Password must have at least 6 characters." }),

    confirmPassword: z
      .string()
      .min(6, { message: "Password must have at least 6 characters." }),

    role: z.enum(["musician", "organizer"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((data) => !!data.role, {
    path: ["role"],
    message: "Please select a role",
  });

export type RegisterData = z.infer<typeof signupSchema>;
