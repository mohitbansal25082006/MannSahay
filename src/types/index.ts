export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  hashedId?: string | null
  language?: string | null
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}
export interface Chat {
  id: string
  content: string
  role: string
  timestamp: Date
  userId: string
  language?: string | null
  riskLevel: RiskLevel
}
export interface Booking {
  id: string
  slotTime: Date
  status: BookingStatus
  notes?: string | null
  createdAt: Date
  userId: string
  counselorId: string
}
export interface Post {
  id: string
  title?: string | null
  content: string
  isAnonymous: boolean
  flagged: boolean
  riskLevel: RiskLevel
  createdAt: Date
  authorId: string
}
export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}
export enum RiskLevel {
  NONE = "NONE",
  LOW = "LOW",
  MEDIUM = "MEDIUM", 
  HIGH = "HIGH"
}
export enum ResourceType {
  ARTICLE = "ARTICLE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  PDF = "PDF",
  EXERCISE = "EXERCISE"
}
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      hashedId?: string
    }
  }
}