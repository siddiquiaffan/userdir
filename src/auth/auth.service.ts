import { HttpException, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
class AuthService {
  constructor() {}

  login(
    user: {
      id: string;
    } & Record<string, any>,
  ): { token: string } {
    if (!user.id) {
      throw new HttpException('User ID not provided', 400);
    }

    return { token: jwt.sign(user, 'abc123') };
  }
}

export { AuthService };
