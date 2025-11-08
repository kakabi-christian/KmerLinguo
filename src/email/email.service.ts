// backend/src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    // Créez le transporteur Nodemailer en utilisant les variables d'environnement
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, code: string) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: to,
      subject: 'Votre code de vérification',
      html: `<p>Bonjour,</p>
             <p>Voici votre code de vérification : <strong>${code}</strong></p>
             <p>Ce code expire dans 10 minutes.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de vérification envoyé à ${to}`);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
    }
  }

  async resendVerificationEmail(to: string, code: string) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject: 'Réenvoi du code de vérification',
      html: `<p>Bonjour,</p>
           <p>Voici votre nouveau code de vérification : <strong>${code}</strong></p>
           <p>Ce code expire dans 10 minutes.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Code de vérification renvoyé à ${to}`);
    } catch (error) {
      console.error("Erreur lors du renvoi de l'email:", error);
    }
  }

  async sendResetPasswordEmail(to: string, resetToken: string) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Bonjour,</p>
           <p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
           <a href="https://tonfrontend.com/reset-password?token=${resetToken}">Réinitialiser mon mot de passe</a>
           <p>Ce lien est valable pendant 30 minutes.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de réinitialisation envoyé à ${to}`);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'email de réinitialisation:",
        error,
      );
    }
  }
}
