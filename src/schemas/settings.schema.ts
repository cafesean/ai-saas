import { z } from 'zod';

// Session timeout options in minutes (EPIC-6)
export const sessionTimeoutOptions = [
  { value: 30, label: 'Sign out after 30 minutes of inactivity' },
  { value: 240, label: 'Sign out after 4 hours of inactivity' },
  { value: 1440, label: 'Keep me signed in for 1 day' },
  { value: 10080, label: 'Keep me signed in for 7 days' },
] as const;

export const sessionPreferenceSchema = z.object({
  sessionTimeoutMinutes: z.number().refine(
    (val) => [30, 240, 1440, 10080].includes(val),
    {
      message: "Invalid session timeout option"
    }
  )
});

export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export type SessionPreferenceFormData = z.infer<typeof sessionPreferenceSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;