import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from '../../models/content.model';
import { CreateContentDto } from './dto/create-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
// import { PaginatedResponse } from './interfaces/paginated-response.interface';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from './interfaces/api-response.interface';

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

  findAllPaginated(query: QueryContentDto): Observable<ApiResponse<Content[]>> {
    return from(this.findAllPaginatedInternal(query));
  }

  private async findAllPaginatedInternal(query: QueryContentDto): Promise<ApiResponse<Content[]>> {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        tags,
        dateFrom,
        dateTo,
      } = query;

      // Build filter conditions
      const filter: Record<string, unknown> = {};
      const appliedFilters: string[] = [];

      // Text search
      if (search) {
        filter.$text = { $search: search };
        appliedFilters.push('text_search');
      }

      // Type filter
      if (type) {
        filter.type = type;
        appliedFilters.push('type');
      }

      // Status filter - now supports multiple statuses
      if (status && status.length > 0) {
        filter.status = { $in: status };
        appliedFilters.push('status');
      }

      // Tags filter
      if (tags && tags.length > 0) {
        filter.tags = { $all: tags };
        appliedFilters.push('tags');
      }

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) {
          (filter.createdAt as { $gte?: Date; $lte?: Date }).$gte = dateFrom;
          appliedFilters.push('date_from');
        }
        if (dateTo) {
          (filter.createdAt as { $gte?: Date; $lte?: Date }).$lte = dateTo;
          appliedFilters.push('date_to');
        }
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Build sort object
      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
      };

      // Execute queries
      const [data, total] = await Promise.all([
        this.contentModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.contentModel.countDocuments(filter),
      ]);

      // Calculate last page
      const lastPage = Math.ceil(total / limit);

      return {
        success: true,
        data,
        meta: {
          pagination: {
            total,
            page,
            lastPage,
            limit,
          },
          filter: {
            applied: appliedFilters,
            available: ['text_search', 'type', 'status', 'tags', 'date_from', 'date_to'],
          },
        },
      };
    } catch (error) {
      // Log the error here
      throw new Error('Failed to fetch content: ' + error.message);
    }
  }
  // ): Promise<PaginatedResponse<Content>> {
  //   const { page = 1, limit = 10, type, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  //   // Build filter conditions
  //   const filter: Record<string, unknown> = {};
  //   if (type) filter.type = type;
  //   if (status) filter.status = status;

  //   // Calculate skip value for pagination
  //   const skip = (page - 1) * limit;

  //   // Build sort object
  //   // EDITED BY THE COPILOT
  //   const sort: [string, 1 | -1][] = [[sortBy, sortOrder === 'asc' ? 1 : -1]];

  //   // Execute queries
  //   const [data, total] = await Promise.all([
  //     this.contentModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
  //     this.contentModel.countDocuments(filter),
  //   ]);

  //   // Calculate last page
  //   const lastPage = Math.ceil(total / limit);

  //   return {
  //     data,
  //     meta: {
  //       total,
  //       page,
  //       lastPage,
  //       limit,
  //     },
  //   };
  // }

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
