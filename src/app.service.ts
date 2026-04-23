import { Injectable } from '@nestjs/common';
import { AppConfig } from './configs/app.config';
import { TypedConfigService } from './configs/typed-config.service';

@Injectable()
export class AppService {
  constructor(private readonly configService: TypedConfigService) {}

  getHello(): string {
    return `${this.configService.get<AppConfig>('app')?.messagePrefix} World!`;
  }
}
