import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Service quản lý kết nối Redis (Cache, Whitelist/Blacklist Tokens, Distributed Locks).
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6380,
      lazyConnect: false,
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * Lưu refresh token hash vào Redis Hash Set: user_tokens:<userId>
   */
  async saveRefreshToken(userId: string, tokenId: string, tokenHash: string, ttlSeconds: number = 7 * 24 * 3600): Promise<void> {
    const key = `user_tokens:${userId}`;
    await this.client.hset(key, tokenId, tokenHash);
    await this.client.expire(key, ttlSeconds);
  }

  /**
   * Lấy hash của một tokenId cụ thể
   */
  async getRefreshTokenHash(userId: string, tokenId: string): Promise<string | null> {
    return this.client.hget(`user_tokens:${userId}`, tokenId);
  }

  /**
   * Thu hồi 1 token cụ thể khi refresh hoặc logout
   */
  async removeRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.client.hdel(`user_tokens:${userId}`, tokenId);
  }

  /**
   * Xóa sạch toàn bộ token của user (khi phát hiện token bị đánh cắp - Reuse Detection)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.client.del(`user_tokens:${userId}`);
  }
}
