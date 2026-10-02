import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ber_warrior', description: 'Tên tài khoản (tối thiểu 3 ký tự)' })
  @IsString()
  @IsNotEmpty({ message: 'Tên tài khoản không được để trống' })
  @MinLength(3, { message: 'Tên tài khoản phải từ 3 ký tự trở lên' })
  username: string;

  @ApiProperty({ example: 'warrior@berarena.com', description: 'Email người chơi' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu đăng nhập (tối thiểu 6 ký tự)' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;
}
