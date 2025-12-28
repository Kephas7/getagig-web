import z from "zod";

export const loginSchema = z.object({
    email: z.email({message:"Enter vaild email."}),
    password: z.string().min(6,{message: "Password must have minimum 6 charcters."})
});

export type LoginData = z.infer<typeof loginSchema>;

