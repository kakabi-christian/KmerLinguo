//Backend/src/crypto/crypto.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private algorithm: string;
  private key: Buffer;
  private iv: Buffer;

  constructor(private configService: ConfigService) {
    this.algorithm = 'aes-256-cbc';
    const secretKey = this.configService.get<string>('CRYPTO_SECRET');
    const secretIv = this.configService.get<string>('CRYPTO_IV');

    if (!secretKey || !secretIv) {
      throw new InternalServerErrorException('CRYPTO_SECRET and CRYPTO_IV must be defined in the environment variables.');
    }

    this.key = Buffer.from(secretKey, 'hex');
    this.iv = Buffer.from(secretIv, 'hex');
  }

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
