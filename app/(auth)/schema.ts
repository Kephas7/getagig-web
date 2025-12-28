import z from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Enter vaild email." }),
  password: z
    .string()
    .min(6, { message: "Password must have minimum 6 charcters." }),
});

export type LoginData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Enter your name." }),
    email: z.email({ message: "Enter valid email." }),
    password: z
      .string()
      .min(6, { message: "Password must have minimum 6 charcters." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must have minimum 6 charcters." }),
  })
  .refine((p) => p.password === p.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupData = z.infer<typeof signupSchema>;
