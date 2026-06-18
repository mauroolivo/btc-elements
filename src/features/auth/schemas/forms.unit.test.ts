import { FormAuthLoginSchema, FormAuthRegisterSchema } from './forms';

describe('auth schemas', () => {
  describe('FormAuthLoginSchema', () => {
    it('accepts a valid payload', () => {
      const result = FormAuthLoginSchema.safeParse({
        email: 'user@example.com',
        password: 'secret123',
      });

      expect(result.success).toBe(true);
    });

    it('rejects an invalid email', () => {
      const result = FormAuthLoginSchema.safeParse({
        email: 'invalid-email',
        password: 'secret123',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Enter a valid email address'
      );
    });

    it('rejects a short password', () => {
      const result = FormAuthLoginSchema.safeParse({
        email: 'user@example.com',
        password: '12345',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Password must be at least 6 characters long'
      );
    });
  });

  describe('FormAuthRegisterSchema', () => {
    it('accepts matching password and confirmPassword', () => {
      const result = FormAuthRegisterSchema.safeParse({
        email: 'user@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      });

      expect(result.success).toBe(true);
    });

    it('rejects when confirmPassword is too short', () => {
      const result = FormAuthRegisterSchema.safeParse({
        email: 'user@example.com',
        password: 'secret123',
        confirmPassword: '123',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Confirm password must be at least 6 characters long'
      );
    });

    it('rejects when passwords do not match', () => {
      const result = FormAuthRegisterSchema.safeParse({
        email: 'user@example.com',
        password: 'secret123',
        confirmPassword: 'other456',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
      expect(result.error?.issues[0]?.message).toBe('Passwords do not match');
    });
  });
});
