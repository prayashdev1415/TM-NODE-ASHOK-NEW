import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config({path: './.env'});

const clientUrl = process.env.CLIENT_URL;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const otpVerification = async ({email, subject, companyName, otp}: any) => {
  const mailOption = {
    from: `Team Monitor <${process.env.SMTP_MAIL}>`,
    to: email,
    subject,
    html: `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #f3f3f3;">
      <tr>
        <td align="center" style="padding: 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
            <tr>
              <td align="center" style="padding: 40px;">
                <h1 style="color: #333333; margin: 0;">Verify Your OTP</h1>
                <p style="color: #777777; margin: 20px 0;">Hi, ${companyName},</p>
                <p style="color: #777777; margin: 20px 0;">In order to complete your registration, please click the button below to verify your email:</p>
              ${otp}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
  };
  await transporter.sendMail(mailOption);
};

export const forgetPwOTP = async ({email, subject, otp, companyName}: any) => {
  const pwMail = {
    from: `Team Monitor <${process.env.SMTP_MAIL}>`,
    to: email,
    subject,
    html: `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #f3f3f3;">
      <tr>
        <td align="center" style="padding: 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
            <tr>
              <td align="center" style="padding: 40px;">
                <h1 style="color: #333333; margin: 0;">Verify Your OTP</h1>
                <p style="color: #777777; margin: 20px 0;">Hi, ${companyName},</p>
                <p style="color: #777777; margin: 20px 0;"> Here is ypur OTP to reset your password. </p>
                ${otp}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
  };
  await transporter.sendMail(pwMail);
};
