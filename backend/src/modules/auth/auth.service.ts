import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký tài khoản mới & tự động khởi tạo Ví tiền với 1.000 Vàng
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existingUser) {
      throw new ConflictException('Email hoặc tên tài khoản đã tồn tại');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Dùng transaction tạo đồng thời User và Wallet cấp 1000 vàng
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          passwordHash,
        },
      });

      await tx.wallet.create({
        data: {
          userId: newUser.id,
          goldBalance: 1000,
          version: 0,
        },
      });

      return newUser;
    });

    return this.generateTokens(user);
  }

  /**
   * Đăng nhập xác thực mật khẩu
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { username: dto.identifier }] },
    });

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Tài khoản này được đăng ký qua Google. Vui lòng chọn Đăng nhập bằng Google');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    return this.generateTokens(user);
  }

  /**
   * Xác thực hoặc tự động tạo tài khoản khi đăng nhập qua Google OAuth
   */
  async validateOrCreateGoogleUser(profile: { googleId: string; email: string; displayName: string; avatar?: string }) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.googleId }, { email: profile.email }] },
    });

    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId, avatar: user.avatar || profile.avatar },
        });
      }
      return user;
    }

    // Xử lý tạo username duy nhất từ displayName
    let username = profile.displayName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (username.length < 3) username = `player_${Math.floor(1000 + Math.random() * 9000)}`;
    const existingUsername = await this.prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Tạo đồng thời User và cấp sẵn 1.000 Vàng trong Wallet
    return this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email: profile.email,
          googleId: profile.googleId,
          avatar: profile.avatar,
        },
      });

      await tx.wallet.create({
        data: {
          userId: newUser.id,
          goldBalance: 1000,
          version: 0,
        },
      });

      return newUser;
    });
  }

  /**
   * Tạo token sau khi Google OAuth callback thành công
   */
  async handleGoogleLogin(user: any) {
    return this.generateTokens(user);
  }

  /**
   * Cơ chế Refresh Token Rotation & Chống Reuse Detection (RFC 6749)
   */
  async refreshTokens(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-ber-arena-2026',
      });
    } catch {
      throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
    }

    const { sub: userId, tokenId } = payload;
    const storedHash = await this.redis.getRefreshTokenHash(userId, tokenId);

    // PHÁT HIỆN GIAN LẬN: Nếu token hợp lệ về mặt chữ ký nhưng KHÔNG có trong Redis
    // Nghĩa là token này đã từng được dùng trước đó và bị xóa (dấu hiệu Token Theft)
    if (!storedHash) {
      await this.redis.revokeAllUserTokens(userId);
      throw new UnauthorizedException('Phát hiện token đã bị thu hồi hoặc đánh cắp! Đã hủy toàn bộ phiên đăng nhập.');
    }

    const incomingHash = this.hashToken(refreshToken);
    if (storedHash !== incomingHash) {
      await this.redis.revokeAllUserTokens(userId);
      throw new UnauthorizedException('Token không hợp lệ!');
    }

    // Thu hồi tokenId cũ
    await this.redis.removeRefreshToken(userId, tokenId);

    // Lấy thông tin user mới nhất và cấp cặp token mới (Rotation)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Người dùng không còn tồn tại');
    }

    return this.generateTokens(user);
  }

  /**
   * Đăng xuất: Xóa tokenId khỏi Redis
   */
  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const payload: any = this.jwtService.decode(refreshToken);
      if (payload?.sub && payload?.tokenId) {
        await this.redis.removeRefreshToken(payload.sub, payload.tokenId);
      }
    } catch {
      // Bỏ qua nếu token không giải mã được
    }
  }

  /**
   * Sinh cặp token { accessToken (15m), refreshToken (7d) } và lưu Hash vào Redis
   */
  private async generateTokens(user: { id: string; username: string; email: string; role: string; guildId: string | null }) {
    const tokenId = crypto.randomUUID();

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        guildId: user.guildId,
      },
      {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key-ber-arena-2026',
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        tokenId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-ber-arena-2026',
        expiresIn: '7d',
      },
    );

    // Lưu hash token vào Redis
    const tokenHash = this.hashToken(refreshToken);
    await this.redis.saveRefreshToken(user.id, tokenId, tokenHash);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        guildId: user.guildId,
      },
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
