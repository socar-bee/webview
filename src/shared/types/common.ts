export interface ApiResponse<T> {
  data: T
  message: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  hasNext: boolean
}

export interface ErrorResponse {
  message: string
  statusCode: number
  error?: string
}
