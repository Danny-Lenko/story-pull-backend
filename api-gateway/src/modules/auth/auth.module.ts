import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/shared/guards/jwt.auth.guard';
import { SupabaseStrategy } from 'src/shared/strategies/supabase.strategy';

// supabase logic description =======: https://chatgpt.com/share/67b0cb90-2840-8013-8af6-17d1a8b1648a | devdanny.14
// supabase db ER-diagram ===========: https://claude.site/artifacts/de1d55f7-46f0-4ca6-b437-a93d6b083d36 | danylenko.14
// the TEAM essense db infrustructure: https://chatgpt.com/share/67b8749c-f3fc-800a-ac36-541eae4d24c6 || danylenko.1407

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('SUPABASE_JWT_SECRET'),
          signOptions: { expiresIn: 40000 },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthGuard, SupabaseStrategy],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
