// jwt.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // get token from headers or cookie
    const token =
      req.headers?.['x-access-token'] ||
      req.headers?.['authorization'] ||
      req.cookies?.['token'];

    // if token exists, decode it and attach the user ID to the request object
    if (token) {
      try {
        const decoded = jwt.decode(token) as { id: string };

        // console.log('decoded:', decoded);
        req['user'] = { userId: decoded.id };
      } catch (err) {
        console.error('JWT decode error:', err);
      }
    }
    next();
  }
}
