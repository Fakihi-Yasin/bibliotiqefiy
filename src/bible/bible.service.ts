import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBService } from '../database/dynamoService.service';

import { Bible } from '../interfaces/bible.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BibleService {
  private readonly tableName = 'bible';
  private readonly logger = new Logger(BibleService.name);
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(bibleData: Omit<Bible, 'id'>): Promise<Bible> {
    const id = uuidv4();
    const item = {
      id,
      ...bibleData,
    };

    await this.dynamoDBService.put(this.tableName, item);
    return item;
  }

  async update(
    id: string,
    bibleData: Partial<Omit<Bible, 'id'>>,
  ): Promise<Bible | null> {
    const existingItem = await this.dynamoDBService.get(this.tableName, { id });

    if (!existingItem) {
      return null;
    }
    const updateitem = await this.dynamoDBService.update(
      this.tableName,
      { id },
      bibleData,
    );

    return updateitem as Bible;
  }
  async delete(id: string): Promise<boolean> {
    const existingItem = await this.dynamoDBService.get(this.tableName, { id });
    if (!existingItem) {
      return false;
    }
    return await this.dynamoDBService.delete(this.tableName, { id });
  }

  async getAllBooks(): Promise<Bible[]> {
    try {
      const items = await this.dynamoDBService.scan(this.tableName);
      return items as Bible[];
    } catch (error) {
      this.logger.error('Error fetching all books:', error);
      throw error;
    }
  }
}
