import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy thông tin ví và số dư của người chơi theo userId
   */
  async getWallet(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    const wallet = await client.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        goldBalance: true,
        version: true,
        updatedAt: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Không tìm thấy ví của người chơi (userId: ${userId})`);
    }

    return wallet;
  }

  /**
   * Nạp tiền an toàn với Optimistic Locking
   */
  async depositBalance(
    userId: string,
    amount: number,
    expectedVersion?: number,
    tx?: Prisma.TransactionClient,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Số lượng Vàng nạp phải lớn hơn 0');
    }

    const client = tx || this.prisma;
    const currentWallet = await this.getWallet(userId, client);
    const targetVersion = expectedVersion !== undefined ? expectedVersion : currentWallet.version;

    // UPDATE có điều kiện: chỉ update khi version khớp
    const updateResult = await client.wallet.updateMany({
      where: {
        userId,
        version: targetVersion,
      },
      data: {
        goldBalance: { increment: amount },
        version: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      throw new ConflictException(
        'Xung đột phiên bản ví (Optimistic Lock Conflict). Số dư đã bị sửa đổi bởi thao tác khác. Vui lòng thử lại!',
      );
    }

    return this.getWallet(userId, client);
  }

  /**
   * Trừ tiền an toàn với Optimistic Locking & Atomic WHERE constraint
   * Đảm bảo không bao giờ bị âm tiền hoặc Lost Update
   */
  async deductBalance(
    userId: string,
    amount: number,
    expectedVersion?: number,
    tx?: Prisma.TransactionClient,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Số lượng Vàng trừ phải lớn hơn 0');
    }

    const client = tx || this.prisma;
    const currentWallet = await this.getWallet(userId, client);

    if (currentWallet.goldBalance < amount) {
      throw new BadRequestException(
        `Số dư không đủ. Cần ${amount} Vàng nhưng hiện chỉ có ${currentWallet.goldBalance} Vàng.`,
      );
    }

    const targetVersion = expectedVersion !== undefined ? expectedVersion : currentWallet.version;

    // UPDATE có điều kiện: chỉ update khi version = targetVersion VÀ goldBalance >= amount
    const updateResult = await client.wallet.updateMany({
      where: {
        userId,
        version: targetVersion,
        goldBalance: { gte: amount },
      },
      data: {
        goldBalance: { decrement: amount },
        version: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      throw new ConflictException(
        'Thao tác thất bại do xung đột phiên bản hoặc số dư đã thay đổi (Optimistic Lock Conflict). Vui lòng thử lại!',
      );
    }

    return this.getWallet(userId, client);
  }

  /**
   * Chuyển tiền nguyên tử giữa 2 người chơi qua Prisma Transaction (ACID)
   * Đảm bảo Định luật bảo toàn dòng tiền (Conservation of Money Invariant)
   */
  async transferGold(fromUserId: string, toUserId: string, amount: number) {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Không thể tự chuyển Vàng cho chính mình');
    }

    if (amount <= 0) {
      throw new BadRequestException('Số lượng Vàng chuyển phải lớn hơn 0');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Trừ tiền người gửi
      const senderWallet = await this.deductBalance(fromUserId, amount, undefined, tx);

      // 2. Cộng tiền người nhận
      const receiverWallet = await this.depositBalance(toUserId, amount, undefined, tx);

      return {
        message: `Chuyển thành công ${amount} Vàng`,
        sender: senderWallet,
        receiver: receiverWallet,
      };
    });
  }
}
