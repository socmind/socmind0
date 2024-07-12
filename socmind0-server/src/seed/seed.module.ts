// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { PrismaModule } from 'src/chat/infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
