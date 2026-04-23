import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationParams } from 'src/common/pagination.params';
import { PaginationResponse } from 'src/common/pagination.response';
import { Repository } from 'typeorm';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { CreateTaskDto } from './create-task.dto';
import { FindTaskParams } from './find-task.params.dto';
import { TaskLabel } from './task-label.entity';
import { Task } from './task.entity';
import { TaskStatus } from './task.model';
import { UpdateTaskDto } from './update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,

    @InjectRepository(TaskLabel)
    private taskLabelsRepository: Repository<TaskLabel>,
  ) {}

  public async findAll(
    filters: FindTaskParams & PaginationParams,
    userId: string,
  ): Promise<PaginationResponse<Task>> {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'labels')
      .where('task.user_id = :userId', { userId });

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.search?.trim()) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${filters.search.trim().toLowerCase()}%` },
      );
    }

    if (filters.labels?.length) {
      // Return all task ids that have at least one of the labels
      const subQuery = query
        .subQuery()
        .select('labels.task_id')
        .from('task_label', 'labels')
        .where('labels.name IN (:...labels)', {
          labels: Array.isArray(filters.labels)
            ? filters.labels
            : (filters.labels as string).split(',').map((l) => l.trim()),
        });

      query.andWhere(`task.id IN (${subQuery.getQuery()})`);
      // const rawLabels = filters.labels as string | string[];
      // const labelArray = Array.isArray(rawLabels)
      //   ? rawLabels
      //   : String(rawLabels)
      //       .split(',')
      //       .map((l) => l.trim())
      //       .filter(Boolean);

      // if (labelArray.length) {
      //   query.andWhere('labels.name IN (:...labels)', {
      //     labels: labelArray,
      //   });
      // }
    }

    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'DESC';
    query.orderBy(`task.${sortBy}`, sortOrder);

    query.skip(+(filters.offset ?? 0)).take(+(filters.limit ?? 10));

    const [tasks, total] = await query.getManyAndCount();

    return {
      data: tasks,
      total,
      page: Math.floor((filters.offset ?? 0) / (filters.limit ?? 10)) + 1,
      limit: +(filters.limit ?? 10),
    };
  }

  public async findOne(id: string): Promise<Task | NotFoundException> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  public async create(body: CreateTaskDto): Promise<Task> {
    if (body.labels) {
      body.labels = this.getUniqueLabels(body.labels);
    }
    return this.tasksRepository.save({
      ...body,
    });
  }

  public async updateStatus(
    id: string,
    status: TaskStatus,
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);

    if (task instanceof NotFoundException) {
      return task;
    }

    await this.tasksRepository.update(id, { status });
    return this.findOne(id);
  }

  public async update(
    id: string,
    body: UpdateTaskDto,
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) return task;

    // const isLabelExists = body?.labels?.some((label) =>
    //   task.labels.some((taskLabel) => taskLabel.name === label.name),
    // );
    // if (isLabelExists) {
    //   throw new BadRequestException('Label already exists');
    // }

    if (body.labels) {
      body.labels = this.getUniqueLabels(body.labels);
    }

    Object.assign(task, body);
    await this.tasksRepository.save(task);

    return this.findOne(id);
  }

  public async addLabels(
    id: string,
    labelsDto: CreateTaskLabelDto[],
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      return task;
    }

    const names = task.labels.map((label) => label.name);
    const labels = this.getUniqueLabels(labelsDto)
      .filter((label) => !names.includes(label.name))
      .map((label) => this.taskLabelsRepository.create({ name: label.name }));

    if (labels.length > 0) {
      task.labels = [...task.labels, ...labels];
      return await this.tasksRepository.save(task);
    }

    return task;
  }

  public async removeLabels(
    id: string,
    labels: string[],
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      return task;
    }
    task.labels = task.labels.filter((label) => !labels.includes(label.name));
    return await this.tasksRepository.save(task);
  }

  public async delete(id: string): Promise<void> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    await this.tasksRepository.remove(task);
    return;
  }

  private getUniqueLabels(labels: CreateTaskLabelDto[]): CreateTaskLabelDto[] {
    const uniqueNames = [...new Set(labels.map((label) => label.name))];
    return uniqueNames.map((name) => ({ name }));
  }
}
