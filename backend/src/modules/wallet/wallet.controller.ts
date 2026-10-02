import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DeductDto } from './dto/deduct.dto';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet - Ví tiền & Giao dịch an toàn (Optimistic Locking)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @ApiOperation({ summary: 'Xem thông tin ví và số dư Vàng của tôi' })
  @ApiResponse({ status: 200, description: 'Thông tin ví và phiên bản version hiện tại' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async getMyWallet(@CurrentUser('id') userId: string) {
    const wallet = await this.walletService.getWallet(userId);
    return { wallet };
  }

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nạp Vàng vào ví (An toàn Concurrency với Optimistic Lock)' })
  @ApiResponse({ status: 200, description: 'Nạp Vàng thành công' })
  @ApiResponse({ status: 409, description: 'Xung đột phiên bản ví (Optimistic Lock Conflict)' })
  async deposit(
    @CurrentUser('id') userId: string,
    @Body() dto: DepositDto,
  ) {
    const wallet = await this.walletService.depositBalance(
      userId,
      dto.amount,
      dto.version,
    );
    return {
      message: `Nạp thành công ${dto.amount} Vàng`,
      wallet,
    };
  }

  @Post('deduct')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trừ Vàng khỏi ví (Kiểm tra điều kiện atomic và version lock)' })
  @ApiResponse({ status: 200, description: 'Trừ Vàng thành công' })
  @ApiResponse({ status: 400, description: 'Số dư không đủ' })
  @ApiResponse({ status: 409, description: 'Xung đột phiên bản hoặc Lost Update' })
  async deduct(
    @CurrentUser('id') userId: string,
    @Body() dto: DeductDto,
  ) {
    const wallet = await this.walletService.deductBalance(
      userId,
      dto.amount,
      dto.version,
    );
    return {
      message: `Trừ thành công ${dto.amount} Vàng`,
      wallet,
    };
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chuyển Vàng cho người chơi khác (ACID Transaction)' })
  @ApiResponse({ status: 200, description: 'Chuyển Vàng thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc số dư không đủ' })
  @ApiResponse({ status: 409, description: 'Xung đột phiên bản ví khi chuyển tiền' })
  async transfer(
    @CurrentUser('id') userId: string,
    @Body() dto: TransferDto,
  ) {
    const result = await this.walletService.transferGold(
      userId,
      dto.toUserId,
      dto.amount,
    );
    return result;
  }
}
