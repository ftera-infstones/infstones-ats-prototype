// ─── Shared application types ─────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_initials: string;
  base?: 'US' | 'CHN';
}

export type JobCommitment = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export interface Job {
  id: string;
  title: string;
  department: string;
  team?: string;
  location: string;
  commitment: JobCommitment;
  description: string;
  responsibilities?: string;
  requirements?: string;
  nice_to_have?: string;
  about_company?: string;
  status: 'open' | 'draft' | 'closed';
  base?: 'US' | 'CHN';
  created_by?: string;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  display_order: number;
  is_default: boolean;
  needInterviewer: boolean;
}

export interface InterviewQuestion {
  id: string;
  job_id: string;
  stage_id: string;
  question: string;
  display_order: number;
}

export type FeedbackQuestionType =
  | 'text_single'
  | 'text_paragraph'
  | 'code'
  | 'date'
  | 'dropdown'
  | 'multiple_choice'
  | 'checkboxes'
  | 'score'
  | 'scorecard'
  | 'yes_no';

export const FEEDBACK_QUESTION_TYPE_META: Record<FeedbackQuestionType, { label: string; icon: string }> = {
  text_single:     { label: 'Text (Single Line)', icon: '📝' },
  text_paragraph:  { label: 'Text (Paragraph)',   icon: '📄' },
  code:            { label: 'Code',               icon: '</>' },
  date:            { label: 'Date',               icon: '📅' },
  dropdown:        { label: 'Dropdown',           icon: '▾' },
  multiple_choice: { label: 'Multiple Choice',    icon: '◉' },
  checkboxes:      { label: 'Checkboxes',         icon: '☐' },
  score:           { label: 'Score',              icon: '👍' },
  scorecard:       { label: 'Scorecard',          icon: '#' },
  yes_no:          { label: 'Yes / No',           icon: '○' },
};

export interface ScorecardCriterion {
  id: string;
  name: string;
  description?: string;
}

export interface FeedbackFormQuestion {
  id: string;
  question: string;
  answer_type: FeedbackQuestionType;
  display_order: number;
  options?: string[];
  score_min?: number;
  score_max?: number;
  criteria?: ScorecardCriterion[];
  code_language?: string;
}

export interface FeedbackForm {
  id: string;
  name: string;
  group_id: string | null;
  questions: FeedbackFormQuestion[];
}

export interface FeedbackFormGroup {
  id: string;
  name: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'LinkedIn' | 'Referral' | 'Website' | 'Campus Recruiting' | 'Dice' | 'Glassdoor' | 'Handshake' | 'Indeed' | 'Telegram' | 'ZipRecruiter' | 'Other';
  referrer_name?: string;
  resume_path?: string;
  current_company?: string;
  current_title?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface StageFeedback {
  score: number | null;
  questions: Array<{ question: string; feedback: string; comment?: string }>;
}

export type RejectReasonTag =
  | 'not_considering'
  | 'candidate_declined'
  | 'eliminated'
  | 'no_hc'
  | 'other';

export const REJECT_REASON_KEYS: Record<RejectReasonTag, string> = {
  not_considering: 'reject_not_considering',
  candidate_declined: 'reject_candidate_declined',
  eliminated: 'reject_eliminated',
  no_hc: 'reject_no_hc',
  other: 'reject_other',
};

export const REJECT_REASON_LABELS: Record<RejectReasonTag, string> = {
  not_considering: 'Candidate not available for now',
  candidate_declined: 'Candidate declined',
  eliminated: 'Eliminated',
  no_hc: 'Position on hold (no HC)',
  other: 'Other',
};

export interface RejectInfo {
  tag: RejectReasonTag;
  description: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  stage_id: string;
  applied_at: string;
  stageInterviewers?: Record<string, string[]>;
  stageInterviewerMeta?: Record<string, Record<string, InterviewerAssignmentMeta>>;
  stageFeedback?: Record<string, Record<string, StageFeedback>>;
  rejectInfo?: RejectInfo;
}

export interface Comment {
  id: string;
  application_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface StageHistory {
  id: string;
  application_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  moved_at: string;
  moved_by_user_id: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  jobIds: string[];
  meetingRoomLink: string;
}

export interface InterviewerAssignmentMeta {
  meetingTime?: string;
  inviteEmailSent?: boolean;
  inviteEmailSentAt?: string;
  calendarCreated?: boolean;
  calendarCreatedAt?: string;
  feedbackFormId?: string;
}
