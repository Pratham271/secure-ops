import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';

/**
 * NextAuth configuration
 * Using only for session management
 * GitHub App installation is handled separately via /api/auth/github/install
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter: DrizzleAdapter(db),
  providers: [
    // No OAuth providers - using GitHub App installation flow
  ],
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/signin-new',
  },
});
