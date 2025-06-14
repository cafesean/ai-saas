import { registerSchema } from '@/schemas/auth.schema';
import { users } from '@/db/schema';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        // If user exists and already has a password, throw conflict
        if (existingUser.password) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An account with this email already exists.',
          });
        }
        // If user exists but doesn't have a password (magic link user), we can proceed to set one
      }

      const hashedPassword = await bcrypt.hash(password, 12); // Salt rounds = 12

      try {
        if (existingUser && !existingUser.password) {
          // Update existing magic-link user with password
          await ctx.db.update(users)
            .set({ 
              password: hashedPassword,
              name: name || existingUser.name,
            })
            .where(eq(users.id, existingUser.id));
          
          console.log(`Password set for existing user: ${email}`);
        } else {
          // Create new user
          await ctx.db.insert(users).values({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0], // Use email prefix as default name
          });
          
          console.log(`New user registered: ${email}`);
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error during registration/password setup:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user.',
          cause: error,
        });
      }
    }),
}); 