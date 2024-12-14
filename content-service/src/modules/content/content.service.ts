import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from '../../models/content.model';
import { CreateContentDto } from './dto/create-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
import { PaginatedResponse } from './interfaces/paginated-response.interface';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private contentModel: Model<ContentDocument>) {}

  create(createContentDto: CreateContentDto): Observable<Content> {
    return from(
      this.contentModel.create({
        ...createContentDto,
        status: createContentDto.status || 'draft',
        publishedAt: createContentDto.status === 'published' ? new Date() : null,
      }),
    );
  }

  findAllPaginated(query: QueryContentDto): Observable<PaginatedResponse<Content>> {
    return from(this.findAllPaginatedInternal(query));
  }

  private async findAllPaginatedInternal(
    query: QueryContentDto,
  ): Promise<PaginatedResponse<Content>> {
    const { page = 1, limit = 10, type, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    // Build filter conditions
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    // EDITED BY THE COPILOT
    const sort: [string, 1 | -1][] = [[sortBy, sortOrder === 'asc' ? 1 : -1]];

    // Execute queries
    const [data, total] = await Promise.all([
      this.contentModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.contentModel.countDocuments(filter),
    ]);

    // Calculate last page
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        lastPage,
        limit,
      },
    };
  }

  findById(id: string): Observable<Content> {
    return from(this.contentModel.findById(id).exec()).pipe(
      map((content) => {
        if (!content) {
          throw new NotFoundException(`Content with ID "${id}" not found`);
        }
        return content;
      }),
      catchError((error) => {
        if (error.name === 'CastError') {
          return throwError(() => new NotFoundException(`Invalid content ID format`));
        }
        return throwError(() => error);
      }),
    );
  }

  // Add more methods as needed

  async findAll(): Promise<Content[]> {
    return this.contentModel.find().exec();
  }

  async findOne(id: string): Promise<Content> {
    return this.contentModel.findById(id).exec();
  }
}
