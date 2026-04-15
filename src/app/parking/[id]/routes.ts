export const PARKING_ROUTES = {
  detail: (id: string | number) => `/parking/${id}`,
  payment: (id: string | number) => `/parking/${id}/payment`
} as const
