export interface LoginRequest {
  email: string
  password: string
  deviceType: 'android' | 'iphone'
  deviceToken: string
  version: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userVerificationId?: string
}

export interface CardBill {
  billSeq: string
  cardCode: string
  cardName: string
  createdAt: string
  nickname: string
  cardNum: string
}

export interface UserAuth {
  isKakao?: boolean
  isNaver?: boolean
  isCitypass?: boolean
  isApple?: boolean
  isFacebook?: boolean
}

export interface UserProfile {
  userSeq: string
  email: string
  userName: string
  phone: string
  isVerifiedUser: boolean
  profileThumbnail?: string
  cardBills?: CardBill[]
  userAuth: UserAuth
  noticeCount: number
  paymentcount: number
}
