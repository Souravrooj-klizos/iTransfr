import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/db';
import { User, UserRole, UserStatus } from '@prisma/client';

export interface AppUser {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string;
  companyName?: string | null;
  role: UserRole;
  status: UserStatus;
}

export async function getUserFromRequest(): Promise<AppUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return null;
    }

    // Get or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      // Create user record if it doesn't exist
      dbUser = await prisma.user.create({
        data: {
          supabaseUserId: supabaseUser.id,
          email: supabaseUser.email!,
          fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email!,
          companyName: supabaseUser.user_metadata?.company_name,
          role: 'client' as UserRole,
          status: 'pending_kyc' as UserStatus,
        },
      });
    }

    return {
      id: dbUser.id,
      supabaseUserId: dbUser.supabaseUserId,
      email: dbUser.email,
      fullName: dbUser.fullName,
      companyName: dbUser.companyName,
      role: dbUser.role,
      status: dbUser.status,
    };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
