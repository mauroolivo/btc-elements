import { z } from 'zod';

export const FormAuthLoginSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters long',
  }),
});
export type FormAuthLoginType = z.infer<typeof FormAuthLoginSchema>;

export const FormAuthRegisterSchema = FormAuthLoginSchema.extend({
  confirmPassword: z.string().min(6, {
    message: 'Confirm password must be at least 6 characters long',
  }),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
export type FormAuthRegisterType = z.infer<typeof FormAuthRegisterSchema>;