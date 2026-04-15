import apiClient from '@/shared/lib/apiClient'

import type { MyTicketActiveList } from '@/shared/types/ticket'

interface FetchActiveTicketsParams {
  limit?: number
  offset?: number
}

export async function fetchActiveTickets(
  params: FetchActiveTicketsParams = {},
  token: string
): Promise<MyTicketActiveList> {
  const { data } = await apiClient.get<{ data: MyTicketActiveList }>('/ticket/my-ticket/active', {
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0
    },
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}
