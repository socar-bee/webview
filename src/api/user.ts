// User 정보 API (api-dev.modudev.cloud, Authorization Bearer)
import { apiClient } from '@/api/client'

interface BaseResponseV2<T> {
  data: T
}

interface PointResult {
  point: { totalAmount: number }
}

/** 충전금(포인트) 잔액 조회 — GET /user/asset/point */
export async function fetchPointBalance(): Promise<number> {
  const { data } = await apiClient.get<BaseResponseV2<PointResult>>('/user/asset/point')
  return data.data.point.totalAmount
}
