import { Module } from '@nestjs/common';
import { BibleController } from './bible.controller';
import { BibleService } from './bible.service';
import { DynamoDBModule } from '../database/dynamodb.module';

@Module({
  imports: [DynamoDBModule],
  controllers: [BibleController],
  providers: [BibleService],
})
export class BibleModule {}
