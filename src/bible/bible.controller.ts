import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { BibleService } from './bible.service';
import { Bible } from '../interfaces/bible.interface';

@Controller('bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Post()
  async create(@Body() bibleData: Omit<Bible, 'id'>): Promise<Bible> {
    try {
      return await this.bibleService.create(bibleData);
    } catch (error) {
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
  async remove(@Param('id') id: string) {
    const deleted = await this.bibleService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Bible verse with ID ${id} not found`);
    }
    return { message: 'Bible verse deleted successfully' };
  }

  @Get()
  async findAll() {
    return await this.bibleService.getAllBooks();
  }
}
