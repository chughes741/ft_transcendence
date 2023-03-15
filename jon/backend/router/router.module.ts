import { Module } from '@nestjs/common';
import { RouterGateway } from './router.gateway';

@Module({
  providers: [RouterGateway],
})
export class RouterModule {}