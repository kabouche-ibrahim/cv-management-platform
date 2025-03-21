import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  @Get()
  async findAll() {
    return this.testService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testService.update(+id, updateTestDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.testService.remove(+id);
  }

  @Post('submit')
  async submitTest(@Body() submitTestDto: SubmitTestDto) {
    return this.testService.submitTest(submitTestDto);
  }

  @Get('take/:testLink')
  async getTestByLink(@Param('testLink') testLink: string) {
    return this.testService.getTestByLink(testLink);
}

@Get('cv/:cvId')
async findByCvId(@Param('cvId') cvId: string) {
    console.log("Received cvId:", cvId);
    return this.testService.findByCvId(cvId);
}

}