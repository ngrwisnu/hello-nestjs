import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    const token = req.headers.authorization as string;

    if (token) {
      const user = await this.prisma.user.findFirst({
        where: {
          token: token,
        },
        select: {
          username: true,
          name: true,
          token: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  }
}
