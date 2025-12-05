import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const {
      data: { session },
      error,
    } = await supabaseAdmin.auth.getSession();

    if (error || !session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = session.user;

    // Check if user record exists, create if not
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('supabaseUserId', user.id)
      .single();

    if (!existingUser) {
      // Create user record for OAuth user
      const { error: createError } = await supabaseAdmin.from('users').insert({
        supabaseUserId: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || 'OAuth User',
        role: 'client',
        status: 'pending_kyc',
      });

      if (createError) {
        console.error('OAuth user creation error:', createError);
        // Continue anyway - user can still login
      }
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
