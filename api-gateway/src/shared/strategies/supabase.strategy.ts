import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// supabase logic description =====: https://chatgpt.com/share/67b0cb90-2840-8013-8af6-17d1a8b1648a | devdanny.14
// supabase db ER-diagram =========: https://claude.site/artifacts/de1d55f7-46f0-4ca6-b437-a93d6b083d36 | danylenko.14

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET'),
    });
  }

  async validate(payload: unknown): Promise<unknown> {
    return payload;
  }

  authenticate(req) {
    super.authenticate(req);
  }
}
