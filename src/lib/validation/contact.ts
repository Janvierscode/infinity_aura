import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.email("Enter a valid email address.").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  organization: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more about your project.").max(5000),
  sourcePath: z.string().trim().max(300).default("/contact"),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
