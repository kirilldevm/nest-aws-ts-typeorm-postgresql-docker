import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationParams } from 'src/common/pagination.params';
import { PaginationResponse } from 'src/common/pagination.response';
import { CurrentUserId } from 'src/users/decorators/current-user-id.decorator';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParamsDto } from './find-one.params.dto';
import { FindTaskParams } from './find-task.params.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { UpdateTaskStatusDto } from './update-task-status.dto';
import { UpdateTaskDto } from './update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public async findAll(
    @Query() params: FindTaskParams & PaginationParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginationResponse<Task>> {
    return this.tasksService.findAll(params, userId);
  }

  @Get('/:id')
  public async findOne(
    @Param() params: FindOneParamsDto,
    @CurrentUserId() userId: string,
  ): Promise<Task | NotFoundException> {
    const task = await this.tasksService.findOne(params.id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    this.checkTaskOwner(task, userId);
    return task;
  }

  @Post()
  public async create(
    @Body() body: CreateTaskDto,
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    return this.tasksService.create({ ...body, user_id: userId });
  }

  @Patch('/:id/status')
  public async updateStatus(
    @Param() params: FindOneParamsDto,
    @Body() body: UpdateTaskStatusDto,
    @CurrentUserId() userId: string,
  ): Promise<Task | NotFoundException> {
    const task = await this.tasksService.findOne(params.id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    this.checkTaskOwner(task, userId);
    return this.tasksService.updateStatus(params.id, body.status);
  }

  @Patch('/:id')
  public async update(
    @Param() params: FindOneParamsDto,
    @Body() body: UpdateTaskDto,
    @CurrentUserId() userId: string,
  ): Promise<Task | NotFoundException> {
    const task = await this.tasksService.findOne(params.id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    this.checkTaskOwner(task, userId);
    return this.tasksService.update(params.id, { ...body, user_id: userId });
  }

  @Patch('/:id/labels')
  public async addLabels(
    @Param() { id }: FindOneParamsDto,
    @Body() body: CreateTaskLabelDto[],
    @CurrentUserId() userId: string,
  ): Promise<Task | NotFoundException> {
    const task = await this.tasksService.findOne(id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    this.checkTaskOwner(task, userId);
    return this.tasksService.addLabels(id, body);
  }

  @Delete('/:id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeLabels(
    @Param() { id }: FindOneParamsDto,
    @Body() labelNames: string[],
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const task = await this.tasksService.findOne(id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    this.checkTaskOwner(task, userId);
    await this.tasksService.removeLabels(id, labelNames);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @Param() params: FindOneParamsDto,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const task = await this.tasksService.findOne(params.id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    this.checkTaskOwner(task, userId);
    return this.tasksService.delete(params.id);
  }

  private checkTaskOwner(task: Task, userId: string): void {
    if (task.user_id !== userId) {
      throw new ForbiddenException('You are not the owner of this task');
    }
  }
}
