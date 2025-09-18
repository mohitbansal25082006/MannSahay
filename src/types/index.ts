// E:\mannsahay\src\types\index.ts

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
  moderationStatus?: ModerationStatus
  moderationReason?: string | null
  moderationNote?: string | null
  moderatedAt?: Date | null
  moderatedBy?: string | null
  summary?: string | null
  summaryGeneratedAt?: Date | null
  isHidden?: boolean
}

export interface Reply {
  id: string
  content: string
  flagged: boolean
  riskLevel: RiskLevel
  createdAt: Date
  postId: string
  authorId: string
  parentId?: string | null
  moderationStatus?: ModerationStatus
  moderationReason?: string | null
  moderationNote?: string | null
  moderatedAt?: Date | null
  moderatedBy?: string | null
  isHidden?: boolean
}

export interface Flag {
  id: string
  reason?: string | null
  createdAt: Date
  userId: string
  postId?: string | null
  replyId?: string | null
  resolved: boolean
  aiReviewStatus?: AiReviewStatus
  aiReviewResult?: string | null
  aiReviewedAt?: Date | null
  aiConfidence?: number | null
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

export enum ModerationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  UNDER_REVIEW = "UNDER_REVIEW"
}

export enum AiReviewStatus {
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR"
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
  
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    hashedId?: string
  }
}