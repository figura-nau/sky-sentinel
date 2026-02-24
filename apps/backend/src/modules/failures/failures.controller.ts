import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FailuresService } from './failures.service';
import { CreateFailureDto } from './dto/create-failure.dto';
import { UpdateFailureDto } from './dto/update-failure.dto';

@Controller('failures')
export class FailuresController {
  constructor(private readonly failuresService: FailuresService) {}

  @Post()
  create(@Body() createFailureDto: CreateFailureDto) {
    return this.failuresService.create(createFailureDto);
  }

  @Get()
  findAll() {
    return this.failuresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.failuresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFailureDto: UpdateFailureDto) {
    return this.failuresService.update(+id, updateFailureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.failuresService.remove(+id);
  }
}
