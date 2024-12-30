import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBService } from '../database/dynamoService.service';
import { Bible } from '../interfaces/bible.interface';
import { v4 as uuidv4 } from 'uuid';
import { BibleSchema } from './bible.schema';
import { ValidationError } from 'joi';

@Injectable()
export class BibleService {
  private readonly tableName = 'bible';
  private readonly logger = new Logger(BibleService.name);

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(bibleData: Omit<Bible, 'id'>): Promise<Bible> {
    const { error } = BibleSchema.validate(bibleData);
    if (error) {
      throw new ValidationError(
        error.details[0].message,
        error.details,
        'bibleData',
      );
    }

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

    const { error } = BibleSchema.validate({ ...existingItem, ...bibleData }); // Validate updated data
    if (error) {
      throw new ValidationError(
        error.details[0].message,
        error.details,
        'bibleData',
      ); // Provide the required arguments
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

  async borrowbook(userId: string, id: string): Promise<boolean> {
    const existitem = await this.dynamoDBService.get(this.tableName, { id });
    if (!existitem) {
      return false;
    }

    if (existitem.quantity <= 0) {
      await this.dynamoDBService.update(
        this.tableName,
        { id },
        {
          status: 'unavailable',
        },
      );
      return false;
    }

    // Check if the user already has this book borrowed
    // const existingReservation = await this.dynamoDBService.get('reservations', {
    //   userId: userId, // Include userId as the partition key
    //   bookId: id, // Include bookId as the sort key if applicable
    // });

    // if (existingReservation) {
    //   throw new Error('User has already borrowed this book.'); // Prevent borrowing the same book
    // }

    // Update the item to mark it as borrowed and decrement the quantity
    await this.dynamoDBService.update(
      this.tableName,
      { id },
      {
        borrowed: true,
        quantity: existitem.quantity - 1,
        status: existitem.quantity - 1 === 0 ? 'unavailable' : existitem.status, // Update status if quantity becomes 0
      },
    );

    const reservationId = uuidv4();
    const reservationItem = {
      id: reservationId,
      userId: userId,
      bookId: id,
      borrowedAt: new Date().toISOString(),
    };

    try {
      await this.dynamoDBService.put('reservations', reservationItem);
    } catch (error) {
      console.error('Error saving reservation:', error);
      throw new Error('Could not save reservation');
    }

    return true;
  }
}
