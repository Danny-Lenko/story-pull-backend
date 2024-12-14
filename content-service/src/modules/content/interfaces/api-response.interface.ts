export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      total: number;
      page: number;
      lastPage: number;
      limit: number;
    };
    filter?: {
      applied: string[];
      available: string[];
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
