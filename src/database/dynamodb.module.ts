import { Module } from '@nestjs/common';
import { DynamoDBService } from './dynamoService.service';

@Module({
  providers: [DynamoDBService],
  exports: [DynamoDBService],
})
export class DynamoDBModule {}
