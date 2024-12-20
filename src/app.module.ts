import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BibleModule } from './bible/bible.module';
import { DynamoDBModule } from './database/dynamodb.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DynamoDBModule,
    BibleModule,
  ],
})
export class AppModule {}
