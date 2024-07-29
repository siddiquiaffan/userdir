import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../entities/user.entity';
import UserResponseDto from '../dto/user.response.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { SearchUserDto } from '../dto/search-user.dto';
// import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.userModel.create(createUserDto);
      return UserResponseDto.from(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.userModel.find();
      return users.map(UserResponseDto.from);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findOne(
    id: string,
    { errMsg, statusCode }: { errMsg?: string; statusCode?: number } = {
      errMsg: 'User not found',
      statusCode: 404,
    },
  ): Promise<UserResponseDto> {
    try {
      const cachedUser = await this.cacheManager.get<UserResponseDto>(
        `user:${id}`,
      );
      if (cachedUser) {
        return cachedUser;
      }

      const user = await this.userModel.findById(id);
      if (!user) {
        throw new HttpException(errMsg, statusCode);
      }

      await this.cacheManager.set(
        `user:${id}`,
        UserResponseDto.from(user),
        300,
      );

      return UserResponseDto.from(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      if (!id) throw new HttpException('User ID is required', 400);

      const updated = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        throw new HttpException('User not found', 404);
      }

      await this.cacheManager.set(
        `user:${id}`,
        UserResponseDto.from(updated),
        300,
      );

      return UserResponseDto.from(updated);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    try {
      const deleted = await this.userModel.findByIdAndDelete(id);

      await this.cacheManager.del(`user:${id}`);
      return { success: !!deleted };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async blockUser(
    userId: string,
    targetUserId: string,
  ): Promise<UserResponseDto> {
    try {
      if (userId === targetUserId) {
        throw new HttpException(
          'You cannot block yourself',
          HttpStatus.BAD_REQUEST,
        );
      }

      // console.log({ userId, targetUserId });

      const [user, targetUser] = await Promise.all([
        this.userModel.findById(userId),
        this.userModel.findById(targetUserId).lean() as Promise<UserDocument>,
      ]);

      console.log({ user, targetUser });

      if (!user || !targetUser) {
        throw new HttpException('User not found', 404);
      }

      user.blockedUsers.push(targetUser._id?.toString());
      user.markModified('blockedUsers');
      await user.save();

      await this.cacheManager.set(
        `user:${userId}`,
        UserResponseDto.from(user),
        300,
      );

      return UserResponseDto.from(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async unblockUser(
    userId: string,
    targetUserId: string,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userModel
        .findOneAndUpdate(
          { _id: userId },
          { $pull: { blockedUsers: targetUserId } },
          { new: true },
        )
        .exec();

      await this.cacheManager.set(
        `user:${userId}`,
        UserResponseDto.from(user),
        300,
      );

      return UserResponseDto.from(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  // search by name and/or age (auto-calculated from birthdate)
  async search(query: SearchUserDto): Promise<UserResponseDto[]> {
    const cacheKey = `search:${JSON.stringify(query)}`;
    const cachedUsers =
      await this.cacheManager.get<UserResponseDto[]>(cacheKey);

    if (cachedUsers) {
      return cachedUsers;
    }

    const { userId, username, minAge, maxAge } = query;
    console.log({ userId });
    await this.findAll().then(console.log);

    const currUser = await this.userModel.findOne({ _id: userId });

    // if (!currUser) {
    //   throw new HttpException('User not found!', 404);
    // }

    // Calculate birthdate range if age range is provided
    const birthdateRange = {};
    if (minAge || maxAge) {
      const currentYear = new Date().getFullYear();
      if (minAge) {
        birthdateRange['$lte'] = new Date(currentYear - minAge, 0, 1);
      }
      if (maxAge) {
        birthdateRange['$gte'] = new Date(currentYear - maxAge, 0, 1);
      }
    }

    // Find users that match the criteria and are not blocked by the current user
    const users = await this.userModel.find({
      $and: [
        username ? { username: new RegExp(username, 'i') } : {},
        birthdateRange,
        { _id: { $nin: currUser?.blockedUsers ?? [] } },
      ],
    });
    // .exec();

    const dtoUsers = users
      .filter((u) => u.id != userId)
      .map(UserResponseDto.from);

    await this.cacheManager.set(cacheKey, dtoUsers, 300);

    return dtoUsers;
  }
}
