import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Controller('job-offers')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @Post()
  async create(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobOfferService.create(createJobOfferDto);
  }

  @Get()
  async findAll() {
    return this.jobOfferService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobOfferService.remove(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateJobOfferDto: UpdateJobOfferDto) {
    return this.jobOfferService.update(+id, updateJobOfferDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobOfferService.findOne(+id);
  }

  @Get(':id/cvs')
  async getCvsByJobOffer(@Param('id') id: string) {
    return this.jobOfferService.findCvsByJobOffer(+id);
  }
}