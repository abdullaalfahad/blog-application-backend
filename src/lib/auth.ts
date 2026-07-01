import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import nodemailer from 'nodemailer';
import { prisma } from './prisma';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  trustedOrigins: [process.env.APP_URL!],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        defaultValue: 'ACTIVE',
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: 'offline',
      prompt: 'select_account consent',
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        await transporter.sendMail({
          from: '"InkFlow Blog" <aafahad02@gmail.com>',
          to: user.email,
          subject: '📧 Verify your email address',
          text: `
Welcome to InkFlow!

Hi ${user.name || 'there'},

Thanks for creating your account.

Verify your email by visiting the link below:
${url}

If you didn't create this account, you can safely ignore this email.
      `,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="padding:40px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;"
            >
              <div style="font-size:42px;">✍️</div>
              <h1 style="margin:12px 0 0;font-size:30px;">
                Welcome to InkFlow
              </h1>
              <p style="margin:10px 0 0;font-size:16px;opacity:.9;">
                Where stories come to life.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <h2 style="margin-top:0;color:#111827;">
                Hi ${user.name || 'there'} 👋
              </h2>

              <p style="font-size:16px;line-height:28px;color:#4b5563;">
                Thank you for joining <strong>InkFlow</strong>.
                You're just one click away from publishing articles,
                discovering amazing stories, and connecting with readers.
              </p>

              <p style="font-size:16px;line-height:28px;color:#4b5563;">
                Please verify your email address to activate your account.
              </p>

              <div style="text-align:center;margin:40px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    display:inline-block;
                    padding:16px 36px;
                    background:#2563eb;
                    color:#fff;
                    text-decoration:none;
                    font-size:16px;
                    font-weight:bold;
                    border-radius:10px;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p style="font-size:15px;color:#6b7280;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="word-break:break-all;">
                <a href="${verificationUrl}" style="color:#2563eb;">
                  ${verificationUrl}
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="padding:30px;background:#f9fafb;border-top:1px solid #e5e7eb;"
            >
              <p style="margin:0;color:#6b7280;font-size:14px;">
                If you didn't create an InkFlow account, you can safely ignore this email.
              </p>

              <p style="margin-top:18px;font-size:13px;color:#9ca3af;">
                © ${new Date().getFullYear()} InkFlow Blog. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
      `,
        });

        console.log('Verification email sent to:', user.email);
      } catch (err) {
        console.error(err);
      }
    },
  },
});
