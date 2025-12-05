import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendEmail } from '@/lib/aws-ses';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    console.log(`[OTP] Generated for ${email}: ${otp}`);

    // Check if service role key is configured
    console.log(`[OTP] supabaseAdmin available: ${supabaseAdmin !== null}`);

    // Store in Database
    if (supabaseAdmin) {
      try {
        // First, delete any existing OTPs for this email
        await supabaseAdmin.from('email_verifications').delete().eq('email', email);

        // Insert new OTP
        const { error: dbError } = await supabaseAdmin.from('email_verifications').insert({
          email,
          otp,
          expiresAt: expiresAt.toISOString(),
        });

        if (dbError) {
          console.error('[OTP] Database error:', dbError);
        } else {
          console.log('[OTP] ✅ Successfully stored in database (via Admin client)');
        }
      } catch (dbErr) {
        console.error('[OTP] Database exception:', dbErr);
      }
    } else {
      console.error(
        '[OTP] ❌ supabaseAdmin is NULL - Check SUPABASE_SERVICE_ROLE_KEY in .env.local'
      );
    }

    // Send OTP via email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>iTransfr Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up with iTransfr. To complete your registration, please use the following verification code:</p>
              <div class="otp-box">${otp}</div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <div class="footer">
                <p>© 2025 iTransfr. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail(email, 'Your iTransfr Verification Code', emailHtml);
      console.log('[OTP] Email sent successfully');
    } catch (emailError) {
      console.error('[OTP] Email send error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('[OTP] Error in OTP send:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
