import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(1, "Enter your name.").max(120),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
