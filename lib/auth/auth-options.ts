import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import AzureADProvider from 'next-auth/providers/azure-ad';
import {
  findUserByEmail,
  verifyPassword,
  updateUserLastLogin,
  upsertGoogleUser,
  upsertMicrosoftUser,
  upsertGitHubUser,
  ensureMongoIndexes,
  normalizeEmail,
} from './user-service';

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'risk-radar-production-secret-auth-key-2025',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'risk-radar-production-secret-auth-key-2025',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET && process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER
      ? [
          AzureADProvider({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
            tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER.replace('https://login.microsoftonline.com/', '').replace('/v2.0', ''),
          }),
        ]
      : []),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Risk_Radar Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        // Lazy non-blocking index ensure
        void ensureMongoIndexes().catch(() => {});

        const normalized = normalizeEmail(credentials.email);
        const user = await findUserByEmail(normalized);

        if (!user) {
          throw new Error('No user found with this email.');
        }

        if (!user.passwordHash) {
          throw new Error('This account uses Google Sign-In. Please click "Continue with Google".');
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid email or password.');
        }

        const userId = user._id ? user._id.toString() : '';
        // Non-blocking lastLogin update
        void updateUserLastLogin(userId).catch(() => {});

        return {
          id: userId,
          name: user.name,
          email: user.email,
          image: user.image || null,
          role: user.role || 'USER',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      void ensureMongoIndexes().catch(() => {});
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await upsertGoogleUser({
            name: user.name || user.email.split('@')[0],
            email: user.email,
            image: user.image || null,
          });
          user.id = dbUser._id ? dbUser._id.toString() : '';
          (user as unknown as Record<string, unknown>).role = dbUser.role || 'USER';
        } catch (e) {
          console.error('[Auth/Google] Upsert error:', (e as Error).message);
          return false;
        }
      }
      if (account?.provider === 'azure-ad' && user.email) {
        try {
          const dbUser = await upsertMicrosoftUser({
            name: user.name || user.email.split('@')[0],
            email: user.email,
            image: user.image || null,
          });
          user.id = dbUser._id ? dbUser._id.toString() : '';
          (user as unknown as Record<string, unknown>).role = dbUser.role || 'USER';
        } catch (e) {
          console.error('[Auth/Microsoft] Upsert error:', (e as Error).message);
          return false;
        }
      }
      if (account?.provider === 'github' && user.email) {
        try {
          const dbUser = await upsertGitHubUser({
            name: user.name || user.email.split('@')[0],
            email: user.email,
            image: user.image || null,
          });
          user.id = dbUser._id ? dbUser._id.toString() : '';
          (user as unknown as Record<string, unknown>).role = dbUser.role || 'USER';
        } catch (e) {
          console.error('[Auth/GitHub] Upsert error:', (e as Error).message);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as unknown as Record<string, unknown>).role as 'USER' | 'ADMIN') || 'USER';
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'USER' | 'ADMIN') || 'USER';
      }
      return session;
    },
  },
};

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getServerAuthSession();
  return session?.user || null;
}
