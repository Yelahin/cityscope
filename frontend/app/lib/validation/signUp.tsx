import * as z from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username should be at least 3 characters long!")
    .max(30, "Username can't be longer than 30 characters long!"),
  email: z.email("Enter valid email address!"),
  password: z
    .string()
    .min(6, "Password should be at least 6 characters long!")
    .max(50, "Password can't be longer than 50 characters long!")
    .regex(/[a-z]/, "Password should contain lower case letter!")
    .regex(/[A-Z]/, "Password should contain upper case letter!")
    .regex(/[0-9]/, "Password should contain number!"),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignUpErrors = Partial<Record<keyof SignUpData, string[]>>;
