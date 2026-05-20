import nodemailer from 'nodemailer';
import { env } from '../config.js'; // Ensure env has these variables added

// Initialize transporter
let transporter: nodemailer.Transporter | null = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn("SMTP configuration is missing. Emails will be logged to console instead of being sent.");
}

/**
 * Sends an account activation email to the newly approved agent.
 */
export async function sendAccountActivationEmail(toEmail: string, nom: string, prenom: string) {
  const fromEmail = process.env.SMTP_FROM || '"SAD-ALERTE" <noreply@sadalerte.bf>';
  const subject = "Votre compte SAD-ALERTE a été activé !";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SAD-ALERTE</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #0f172a; font-size: 20px;">Bonjour ${prenom} ${nom},</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #475569;">
          Nous avons le plaisir de vous informer que votre demande d'accès au <strong>Système d'Aide à la Décision pour l'Alerte Précoce (SAD-ALERTE)</strong> a été validée par un administrateur.
        </p>
        <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0f172a;">Votre compte est désormais actif.</p>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #475569;">
          Vous pouvez dès à présent vous connecter à l'application mobile ou au tableau de bord Web avec l'adresse email et le mot de passe que vous avez fournis lors de votre inscription.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #475569;">
          Merci pour votre engagement,<br>
          <em>L'équipe SAD-ALERTE</em>
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Cet email est généré automatiquement. Merci de ne pas y répondre.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });
      // eslint-disable-next-line no-console
      console.log(`[MAILER] Activation email sent to ${toEmail}. MessageId: ${info.messageId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[MAILER] Failed to send activation email to ${toEmail}:`, error);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(`\n--- MOCK EMAIL START ---\nTo: ${toEmail}\nSubject: ${subject}\n\n${htmlContent.replace(/<[^>]*>?/gm, '')}\n--- MOCK EMAIL END ---\n`);
  }
}

/**
 * Sends a password reset email with a secure token link.
 */
export async function sendPasswordResetEmail(toEmail: string, nom: string, prenom: string, resetLink: string) {
  const fromEmail = process.env.SMTP_FROM || '"SAD-ALERTE" <noreply@sadalerte.bf>';
  const subject = "SAD-ALERTE - Réinitialisation de votre mot de passe";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SAD-ALERTE</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #0f172a; font-size: 20px;">Bonjour ${prenom} ${nom},</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #475569;">
          Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>SAD-ALERTE</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #d30000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #64748b;">
          Ce lien est valide pendant 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email. Votre mot de passe actuel restera inchangé.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #475569; margin-top: 30px;">
          <em>L'équipe SAD-ALERTE</em>
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Cet email est généré automatiquement. Merci de ne pas y répondre.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });
      // eslint-disable-next-line no-console
      console.log(`[MAILER] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[MAILER] Failed to send password reset email to ${toEmail}:`, error);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(`\n--- MOCK EMAIL START ---\nTo: ${toEmail}\nSubject: ${subject}\n\n${htmlContent.replace(/<[^>]*>?/gm, '')}\nReset Link: ${resetLink}\n--- MOCK EMAIL END ---\n`);
  }
}
