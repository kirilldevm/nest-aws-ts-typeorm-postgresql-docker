import { ConfigService } from '@nestjs/config';
import { ConfigTypes } from './config.types';

export class TypedConfigService extends ConfigService<ConfigTypes> {
  // get<T extends keyof ConfigTypes>(key: T): ConfigTypes[T] {
  //   return super.get(key) as ConfigTypes[T];
  // }
}
