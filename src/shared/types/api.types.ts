export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
export type ModuleType = 'PDF' | 'VIDEO' | 'QUIZ'
export type Permission = 'VIEW_AUDIT_LOGS' | 'EXPORT_AUDIT_LOGS' | 'MANAGE_POLICY_REACTIVATION'

export type AccountAccessState =
  | 'ACCOUNT_INACTIVE'
  | 'POLICY_PENDING'
  | 'POLICY_REJECTED_RECOVERABLE'
  | 'POLICY_REJECTED_EXPIRED'
  | 'POLICY_REVIEW_HOLD'
  | 'REACTIVATION_REQUESTED'
  | 'PENDING_ADMIN_DECISION'
  | 'POLICY_ACCEPTED'

export interface User {
  id: string
  name: string
  email: string
  username: string
  role: Role
  active: boolean
  avatarUrl: string | null
  mustChangePassword: boolean
  accessState: AccountAccessState
  permissions: Permission[]
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  about: string | null
  targetAudience: string | null
  coverUrl: string | null
  active: boolean
  createdById: string
  createdAt: string
}

export interface EnrolledStudent {
  id: string
  name: string
  email: string
  username: string
  assignedAt: string
}

export interface AvailableStudent {
  id: string
  name: string
  email: string
  username: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface UserCourse {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  active: boolean
  assignedAt: string
}

export interface StudentOverview {
  id: string
  name: string
  email: string
  username: string
  avatarUrl: string | null
  totalCourses: number
  courses: { id: string; title: string }[]
}

export interface CourseModule {
  id: string
  courseId: string
  type: ModuleType
  title: string
  coverUrl: string | null
  visible: boolean
  order: number
  studyPriority: number
  createdAt: string
}

export interface PdfItem {
  id: string
  moduleId: string
  title: string
  fileUrl: string
  fileKey: string
  sizeBytes: string | null
  orderLabel: string
  orderNum: number
  createdAt: string
}

export interface VideoItem {
  id: string
  moduleId: string
  title: string
  fileUrl: string
  fileKey: string | null
  durationSec: number | null
  orderLabel: string
  orderNum: number
  createdAt: string
}

export interface QuestionOption {
  id: string
  letter: string
  text: string
  correct?: boolean
}

export interface Question {
  id: string
  moduleId: string
  statement: string
  timeLimitSec: number
  order: number
  createdAt: string
  options: QuestionOption[]
}

export type QuizAttemptStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface QuizInfo {
  moduleId: string
  totalQuestions: number
  avgTimeLimitSec: number
  latestAttemptId: string | null
  latestStatus: QuizAttemptStatus | null
}

// Never carries `correct` on an option, or a correct-option reference — the
// backend withholds that until the attempt is COMPLETED.
export interface QuizAttemptQuestion {
  id: string
  statement: string
  timeLimitSec: number
  position: number
  options: Pick<QuestionOption, 'id' | 'letter' | 'text'>[]
  selectedOptionId: string | null
  questionStartedAt: string | null
}

export interface QuizAttemptState {
  attemptId: string
  status: QuizAttemptStatus
  startedAt: string
  totalQuestions: number
  questions: QuizAttemptQuestion[]
}

export interface QuizResultQuestion {
  questionId: string
  text: string
  position: number
  selectedOption: Pick<QuestionOption, 'id' | 'letter' | 'text'> | null
  correctOption: Pick<QuestionOption, 'id' | 'letter' | 'text'> | null
  isCorrect: boolean
  elapsedSeconds: number
  overtimeSeconds: number
}

export interface QuizResult {
  attemptId: string
  status: QuizAttemptStatus
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  percentage: number
  totalTimeSec: number
  questions: QuizResultQuestion[]
}

export interface ImportRowError {
  line: number
  reason: string
}

export interface ImportStatusResponse {
  status: 'processing' | 'completed' | 'error'
  totalLines?: number
  imported?: number
  withError?: number
  errors?: ImportRowError[]
  reason?: string
}

export type StudySessionStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface StudySession {
  id: string
  userId: string
  courseId: string
  moduleId: string
  status: StudySessionStatus
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
}

export interface ActiveStudySession {
  id: string
  moduleId: string
  moduleTitle: string
  moduleType: ModuleType
  courseId: string
  courseTitle: string
  startedAt: string
}

export interface StudyDaySession {
  id: string
  moduleId: string
  moduleTitle: string
  moduleType: ModuleType
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
}

export interface StudyDayGroup {
  date: string
  totalSeconds: number
  sessions: StudyDaySession[]
}

export interface StudyScheduleSummary {
  totalSecondsLast14Days: number
  sessionsCountLast14Days: number
  modulesStudiedLast14Days: number
  totalSecondsToday: number
}

export type StudyRecommendationReason =
  | 'NEVER_STUDIED'
  | 'LOW_QUIZ_SCORE'
  | 'LONG_TIME_NO_STUDY'
  | 'HIGH_PRIORITY'
  | 'LOW_COVERAGE'

export interface StudyRecommendation {
  moduleId: string
  title: string
  type: ModuleType
  reason: StudyRecommendationReason
  daysSinceLastStudy: number | null
  quizPercentage: number | null
  studyPriority: number
}

export interface StudySchedule {
  activeSession: ActiveStudySession | null
  summary: StudyScheduleSummary
  history: StudyDayGroup[]
  recommendations: StudyRecommendation[]
}

export interface TemplateLibraryFile {
  id: string
  name: string
  description: string | null
  originalName: string
  storageKey: string
  mimeType: string
  fileSize: number
  uploadedById: string | null
  uploadedBy: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export type PolicyAcceptanceStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface PolicyVersion {
  id: string
  version: string
  title: string
  content: string
  isActive: boolean
  requiresReacceptance: boolean
  publishedAt: string
  createdAt: string
}

export interface UserPolicyAcceptance {
  id: string
  userId: string
  policyVersionId: string
  status: PolicyAcceptanceStatus
  acceptedAt: string | null
  rejectedAt: string | null
  scheduledDeletionAt: string | null
  deletionPausedAt: string | null
  deletionRemainingSeconds: number | null
  // consolidated-account review hold — see PolicyService.transitionToRejected
  policyReviewStartedAt: string | null
  policyReviewUntil: string | null
  reactivationRequestedAt: string | null
  reactivatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CurrentPolicyResponse {
  policyVersion: PolicyVersion | null
  acceptance: UserPolicyAcceptance | null
  accessState: AccountAccessState
  reconsiderationDays: number
  reviewHoldDays: number
  isEstablishedAccount: boolean
}

export interface AdminPolicyStatus {
  currentPolicyVersion: PolicyVersion | null
  acceptance:
    | (UserPolicyAcceptance & { policyVersion: { version: string; title: string } })
    | null
}

export interface ReactivationRequestEntry extends UserPolicyAcceptance {
  user: {
    id: string
    name: string
    email: string
    role: Role
    active: boolean
    createdAt: string
  }
}

export type AuditCategory =
  | 'USER'
  | 'AUTHENTICATION'
  | 'SECURITY'
  | 'POLICY'
  | 'ADMINISTRATION'
  | 'CONTENT'
  | 'BLOCKLIST'
  | 'SYSTEM'

export type AuditSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'

export interface AuditEvent {
  id: string
  eventType: string
  category: AuditCategory
  severity: AuditSeverity
  actorUserId: string | null
  actorName: string | null
  targetUserId: string | null
  targetName: string | null
  targetEmailMasked: string | null
  resourceType: string | null
  resourceId: string | null
  method: string | null
  route: string | null
  httpStatus: number | null
  ipAddress: string | null
  userAgent: string | null
  requestId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface SecurityIncident {
  id: string
  type: string
  severity: AuditSeverity
  userId: string | null
  ipAddress: string | null
  route: string | null
  method: string | null
  occurrenceCount: number
  firstOccurredAt: string
  lastOccurredAt: string
  createdAt: string
}

export interface AuditNotification {
  id: string
  userId: string
  incidentId: string
  readAt: string | null
  popupDismissedAt: string | null
  createdAt: string
  incident: SecurityIncident
}

export interface EmailBlocklistEntry {
  id: string
  emailHash: string
  maskedEmail: string | null
  reason: string
  createdAt: string
  removedAt: string | null
  removedById: string | null
}

export interface ApiErrorBody {
  success: false
  statusCode: number
  path: string
  timestamp: string
  message: string | string[]
}
