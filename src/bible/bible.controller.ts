import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Patch,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BibleService } from './bible.service';
import { Bible } from '../interfaces/bible.interface';
// import { ValidationError } from 'joi';
import { JWTAuthGuard } from '../guards/jwt.auth.guard';

@Controller('bible')
@UseGuards(JWTAuthGuard)
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Post()
  async create(@Body() bibleData: Omit<Bible, 'id'>): Promise<Bible> {
    try {
      return await this.bibleService.create(bibleData);
    } catch (error) {
      if (error.isJoi) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Failed to create bible verse',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() bibleData: Partial<Omit<Bible, 'id'>>,
  ) {
    const updatedBible = await this.bibleService.update(id, bibleData);
    if (!updatedBible) {
      throw new NotFoundException(`Bible verse with ID ${id} not found`);
    }
    return updatedBible;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    const result = await this.bibleService.delete(id);
    if (!result) {
      throw new NotFoundException(`Bible verse with ID ${id} not found`);
    }
    return result;
  }

  @Get()
  async getAllBooks(): Promise<Bible[]> {
    return await this.bibleService.getAllBooks();
  }

  @Patch('borrow/:id')
  async borrowBook(@Param('id') id: string, @Request() req): Promise<boolean> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    const result = await this.bibleService.borrowbook(userId, id);
    if (!result) {
      throw new NotFoundException(`Bible verse with ID ${id} not found`);
    }
    return result;
  }
}
