import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { CryptoService } from '../crypto/crypto.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private otpCache = new Map<string, { otp: string; expiration: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly cryptoService: CryptoService,
  ) {}

  // ✅ Génère un OTP à 6 chiffres
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ✅ Hash du mot de passe
  private async hashCredentials(credentials: string): Promise<string> {
    return bcrypt.hash(credentials, 10);
  }

  // ✅ Enregistrement d’un utilisateur + création wallet chiffré
  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, phone, password } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Email already exists.');

    // Hash du mot de passe
    const hashedPassword = await this.hashCredentials(password);

    // Génération de l’OTP
    const otp = this.generateOtp();
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 10);
    this.otpCache.set(email, { otp, expiration });

    // ✅ Envoi de l’email de vérification
    await this.emailService.sendVerificationEmail(email, otp);

    // ✅ Création de l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        passwordHash: hashedPassword,
        isVerified: false,
      },
    });

    // ✅ Création du wallet avec solde chiffré à 0
    const encryptedBalance = this.cryptoService.encrypt('0');
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
        balance: encryptedBalance,
      },
    });

    return { message: 'User created successfully. Check your email for the OTP.' };
  }

  // ✅ Vérification de l’OTP
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { email, otp } = verifyOtpDto;

    const storedOtp = this.otpCache.get(email);
    if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiration < new Date()) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    await this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    this.otpCache.delete(email);

    return { message: 'Account verified successfully!' };
  }

  // ✅ Réenvoi d’un OTP
  async resendOtp(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found.');

    const otp = this.generateOtp();
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 10);
    this.otpCache.set(email, { otp, expiration });

    await this.emailService.resendVerificationEmail(email, otp);
    return { message: 'OTP resent successfully.' };
  }

  // ✅ Connexion de l'utilisateur
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials.');

    if (!user.isVerified)
      throw new BadRequestException('Please verify your account first.');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        Role:user.role,
      },
    };
  }
}
