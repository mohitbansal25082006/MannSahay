export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  hashedId?: string | null
  language?: string | null
  isAdmin: boolean
  preferredLanguage?: 'en' | 'hi' | 'dog' | 'mr' | 'ta' | null
  interests?: string[]
  preferredSpecializations?: string[]
  preferredLanguages?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Counselor {
  id: string
  name: string
  email: string
  bio?: string | null
  specialties: string[]
  languages: string[]
  isActive: boolean
  profileImage?: string | null
  experience?: number | null
  education?: string | null
  approach?: string | null
  consultationFee?: number | null
  maxDailySessions?: number | null
  bufferTimeMinutes?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface AvailabilitySlot {
  id: string
  counselorId: string
  dayOfWeek: number
  startTime: Date
  endTime: Date
  isBooked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  slotTime: Date
  endTime: Date
  status: BookingStatus
  notes?: string | null
  sessionType: SessionType
  isRecurring: boolean
  recurringPattern?: string | null
  recurringEndDate?: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  counselorId: string
  availabilitySlotId?: string | null
  counselor?: Counselor
  sessionNotes?: SessionNote[]
  feedbacks?: Feedback[]
  videoSession?: VideoSession
  reminders?: Reminder[]
  moodEntries?: MoodEntry[]
}

export interface GroupSession {
  id: string
  title: string
  description?: string | null
  maxParticipants: number
  sessionDate: Date
  duration: number
  counselorId: string
  createdAt: Date
  updatedAt: Date
  counselor?: Counselor
  participants?: GroupSessionParticipant[]
}

export interface GroupSessionParticipant {
  id: string
  groupSessionId: string
  userId: string
  joinedAt: Date
}

export interface WaitlistEntry {
  id: string
  userId: string
  counselorId: string
  preferredDay?: number | null
  preferredTime?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  contacted: boolean
}

export interface SessionNote {
  id: string
  content: string
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  counselorId: string
  bookingId: string
  counselor?: {
    name: string
  }
}

export interface CounselorNote {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  counselorId: string
  userId: string
}

export interface MoodEntry {
  id: string
  mood: number
  notes?: string | null
  createdAt: Date
  userId: string
  bookingId?: string | null
}

export interface Feedback {
  id: string
  rating: number
  content?: string | null
  createdAt: Date
  userId: string
  bookingId: string
}

export interface Reminder {
  id: string
  type: ReminderType
  message: string
  sendAt: Date
  sent: boolean
  sentAt?: Date | null
  createdAt: Date
  bookingId: string
}

export interface VideoSession {
  id: string
  platform: VideoPlatform
  meetingId?: string | null
  meetingUrl?: string | null
  hostUrl?: string | null
  createdAt: Date
  updatedAt: Date
  bookingId: string
}

// Interface for writing suggestions
export interface WritingSuggestion {
  suggestion: string;
  type: 'grammar' | 'clarity' | 'tone' | 'other';
  startIndex: number;
  endIndex: number;
}

// Interface for tone analysis
export interface ToneAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  details?: string;
}

export interface Chat {
  id: string
  content: string
  role: string
  timestamp: Date
  userId: string
  sessionId: string
  language?: 'en' | 'hi' | 'dog' | 'mr' | 'ta' | null
  riskLevel: RiskLevel
  context?: Record<string, unknown>
  audioUrl?: string | null
}

export interface Post {
  id: string
  title?: string | null
  content: string
  isAnonymous: boolean
  flagged: boolean
  riskLevel: RiskLevel
  category?: string | null
  views: number
  createdAt: Date
  updatedAt: Date
  authorId: string
  moderationStatus?: ModerationStatus
  moderationReason?: string | null
  moderationNote?: string | null
  moderatedAt?: Date | null
  moderatedBy?: string | null
  summary?: string | null
  summaryGeneratedAt?: Date | null
  isHidden?: boolean
  language: 'en' | 'hi' | 'dog' | 'mr' | 'ta'
  translatedContent?: Record<string, string>
  writingSuggestions?: WritingSuggestion[]
  toneAnalysis?: ToneAnalysis
}

export interface Reply {
  id: string
  content: string
  flagged: boolean
  riskLevel: RiskLevel
  createdAt: Date
  updatedAt: Date
  postId: string
  authorId: string
  parentId?: string | null
  moderationStatus?: ModerationStatus
  moderationReason?: string | null
  moderationNote?: string | null
  moderatedAt?: Date | null
  moderatedBy?: string | null
  isHidden?: boolean
  language: 'en' | 'hi' | 'dog' | 'mr' | 'ta'
  translatedContent?: Record<string, string>
  writingSuggestions?: WritingSuggestion[]
  toneAnalysis?: ToneAnalysis
}

export interface Like {
  id: string
  createdAt: Date
  userId: string
  postId?: string | null
  replyId?: string | null
}

export interface Bookmark {
  id: string
  createdAt: Date
  userId: string
  postId: string
}

export interface Share {
  id: string
  platform: string
  createdAt: Date
  userId: string
  postId: string
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

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
  userId: string
  metadata?: Record<string, unknown>
}

export interface Resource {
  id: string
  title: string
  description?: string | null
  content?: string | null
  type: ResourceType
  language: 'en' | 'hi' | 'dog' | 'mr' | 'ta'
  fileUrl?: string | null
  fileKey?: string | null // For cloud storage
  fileSize?: number | null // In bytes
  duration?: number | null // For audio/video in seconds
  author?: string | null
  tags: string[]
  categories: string[]
  isPublished: boolean
  isFeatured: boolean
  viewCount: number
  downloadCount: number
  createdAt: Date
  updatedAt: Date
  
  // Translation fields
  translations?: Record<string, string>
  summary?: string | null // AI-generated summary
  summaryGeneratedAt?: Date | null
  
  // Relations
  ratings?: ResourceRating[]
  bookmarks?: ResourceBookmark[]
  downloads?: ResourceDownload[]
  shares?: ResourceShare[]
  views?: ResourceView[]
  recommendations?: ResourceRecommendation[]
  comments?: ResourceComment[]

  // Computed/added fields from API
  averageRating?: number
  userRating?: number | null
  isBookmarked?: boolean
  cached?: boolean
}

export interface ResourceRating {
  id: string
  rating: number
  comment?: string | null
  createdAt: Date
  userId: string
  resourceId: string
}

export interface ResourceBookmark {
  id: string
  createdAt: Date
  userId: string
  resourceId: string
}

export interface ResourceDownload {
  id: string
  createdAt: Date
  userId: string
  resourceId: string
}

export interface ResourceShare {
  id: string
  platform: string // "whatsapp", "facebook", "twitter", "copy_link", etc.
  createdAt: Date
  userId: string
  resourceId: string
}

export interface ResourceView {
  id: string
  createdAt: Date
  userId?: string | null // Nullable for anonymous views
  resourceId: string
}

export interface ResourceRecommendation {
  id: string
  score: number
  reason?: string | null
  createdAt: Date
  userId: string
  resourceId: string
}

export interface ResourceComment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
  resourceId: string
  
  // Relations
  likes?: ResourceCommentLike[]
  flags?: ResourceCommentFlag[]
  replies?: ResourceComment[]
  parent?: ResourceComment
  parentId?: string | null
}

export interface ResourceCommentLike {
  id: string
  createdAt: Date
  userId: string
  commentId: string
  
  // Relations
  user?: User
  comment?: ResourceComment
}

export interface ResourceCommentFlag {
  id: string
  createdAt: Date
  userId: string
  commentId: string
  reason?: string | null
  
  // Relations
  user?: User
  comment?: ResourceComment
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  bookingConfirmation: {
    userName: string;
    counselorName: string;
    sessionTime: Date;
    meetingLink?: string;
  };
  sessionReminder: {
    userName: string;
    counselorName: string;
    sessionTime: Date;
    meetingLink?: string;
  };
  sessionCancellation: {
    userName: string;
    counselorName: string;
    sessionTime: Date;
    reason?: string;
  };
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW"
}

export enum SessionType {
  ONE_ON_ONE = "ONE_ON_ONE",
  GROUP = "GROUP"
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
  EXERCISE = "EXERCISE",
  MUSIC = "MUSIC",
  MEDITATION = "MEDITATION",
  INFOGRAPHIC = "INFOGRAPHIC",
  WORKSHEET = "WORKSHEET",
  GUIDE = "GUIDE"
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

export enum ReminderType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH_NOTIFICATION = "PUSH_NOTIFICATION"
}

export enum VideoPlatform {
  ZOOM = "ZOOM",
  GOOGLE_MEET = "GOOGLE_MEET",
  MICROSOFT_TEAMS = "MICROSOFT_TEAMS"
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