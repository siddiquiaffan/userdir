import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @Get('/login')
  login(@Query() searchQuery: any, @Res({ passthrough: true }) res: Response) {
    const result = this.authService.login({ id: searchQuery.userId });

    // @ts-expect-error cookie
    res.cookie('token', result.token);

    // save token in cookie
    return {
      token: result.token,
      message:
        'The token has been saved in the cookie. Use the token in the Authorization header to access protected routes',
    };
  }
}

export { AuthController };
