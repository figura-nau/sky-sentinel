import { Injectable } from '@nestjs/common';

@Injectable()
export class FailuresService {
  create() {
    return 'This action adds a new failure';
  }

  findAll() {
    return `This action returns all failures`;
  }

  findOne(id: number) {
    return `This action returns a #${id} failure`;
  }

  update(id: number) {
    return `This action updates a #${id} failure`;
  }

  remove(id: number) {
    return `This action removes a #${id} failure`;
  }
}
