import { Controller, Post, Param, Delete, Req } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('block')
export class BlockController {
  constructor(private readonly usersService: UsersService) {}

  // block user
  @Post(':targetUserId')
  block(@Req() req: Request, @Param('targetUserId') targetUserId: string) {
    const userId = req['user']?.['userId']; // Get current user ID from the request
    return this.usersService.blockUser(userId, targetUserId);
  }

  // unblock user
  @Delete(':targetUserId')
  unblock(@Req() req: Request, @Param('targetUserId') targetUserId: string) {
    const userId = req['user']?.['userId']; // Get current user ID from the request
    return this.usersService.unblockUser(userId, targetUserId);
  }
}
