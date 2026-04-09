import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import {
  mockUsers,
  mockJobs,
  mockStages,
  mockCandidates,
  mockApplications,
  mockComments,
  mockStageHistory,
  mockInterviewers,
  mockInterviewQuestions,
  mockFeedbackFormGroups,
  mockFeedbackForms,
} from '../mock/data';
import type {
  User,
  Job,
  PipelineStage,
  Candidate,
  Application,
  Comment,
  StageHistory,
  Interviewer,
  InterviewQuestion,
  RejectInfo,
  FeedbackForm,
  FeedbackFormGroup,
  FeedbackFormQuestion,
} from '../mock/data';

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  users: User[];
  jobs: Job[];
  stages: PipelineStage[];
  candidates: Candidate[];
  applications: Application[];
  comments: Comment[];
  stageHistory: StageHistory[];
  interviewers: Interviewer[];
  interviewQuestions: InterviewQuestion[];
  feedbackForms: FeedbackForm[];
  feedbackFormGroups: FeedbackFormGroup[];
  // feedbackLinks: key = `${applicationId}_${stageId}`, value = token string
  feedbackLinks: Record<string, string>;
  // Auth
  currentUser: User | null;
  isLoggedIn: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'MOVE_APPLICATION'; applicationId: string; newStageId: string; userId: string }
  | { type: 'ADD_COMMENT'; comment: Comment }
  | { type: 'ADD_JOB'; job: Job }
  | { type: 'ADD_CANDIDATE'; candidate: Candidate }
  | { type: 'ADD_APPLICATION'; application: Application }
  | { type: 'REORDER_STAGES'; orderedIds: string[] }
  | { type: 'UPDATE_STAGE'; stageId: string; name: string }
  | { type: 'ADD_STAGE'; stage: PipelineStage }
  | { type: 'DELETE_STAGE'; stageId: string }
  | { type: 'ADD_INTERVIEWER'; interviewer: Interviewer }
  | { type: 'UPDATE_INTERVIEWER'; interviewer: Interviewer }
  | { type: 'DELETE_INTERVIEWER'; interviewerId: string }
  | { type: 'UPDATE_STAGE_INTERVIEWERS'; applicationId: string; stageId: string; interviewerIds: string[] }
  | { type: 'UPDATE_JOB_STATUS'; payload: { jobId: string; status: 'open' | 'closed' | 'draft' } }
  | { type: 'DELETE_JOB'; payload: { jobId: string } }
  | { type: 'UPDATE_JOB'; job: Job }
  | { type: 'TOGGLE_STAGE_NEED_INTERVIEWER'; stageId: string; value: boolean }
  | { type: 'ADD_INTERVIEW_QUESTION'; question: InterviewQuestion }
  | { type: 'UPDATE_INTERVIEW_QUESTION'; question: InterviewQuestion }
  | { type: 'DELETE_INTERVIEW_QUESTION'; questionId: string }
  | { type: 'REORDER_INTERVIEW_QUESTIONS'; jobId: string; stageId: string; orderedIds: string[] }
  | { type: 'SET_FEEDBACK_LINK'; applicationId: string; stageId: string; token: string }
  | { type: 'SET_REJECT_INFO'; applicationId: string; rejectInfo: RejectInfo }
  | { type: 'SUBMIT_FEEDBACK'; applicationId: string; stageId: string; interviewerId: string; score: number; questions: Array<{ question: string; feedback: string; comment?: string }> }
  | { type: 'SET_INTERVIEWER_META'; applicationId: string; stageId: string; interviewerId: string; meta: Partial<import('../mock/data').InterviewerAssignmentMeta> }
  | { type: 'ADD_FEEDBACK_FORM_GROUP'; group: FeedbackFormGroup }
  | { type: 'ADD_FEEDBACK_FORM'; form: FeedbackForm }
  | { type: 'UPDATE_FEEDBACK_FORM'; form: FeedbackForm }
  | { type: 'DELETE_FEEDBACK_FORM'; formId: string }
  | { type: 'DELETE_FEEDBACK_FORM_GROUP'; groupId: string }
  | { type: 'UPDATE_FEEDBACK_FORM_GROUP'; group: FeedbackFormGroup }
  | { type: 'UPDATE_FEEDBACK_FORM_QUESTIONS'; formId: string; questions: FeedbackFormQuestion[] };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.user, isLoggedIn: true };

    case 'LOGOUT':
      return { ...state, currentUser: null, isLoggedIn: false };

    case 'MOVE_APPLICATION': {
      const historyEntry: StageHistory = {
        id: `sh-${Date.now()}`,
        application_id: action.applicationId,
        from_stage_id: state.applications.find(a => a.id === action.applicationId)?.stage_id ?? null,
        to_stage_id: action.newStageId,
        moved_at: new Date().toISOString(),
        moved_by_user_id: action.userId,
      };
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.applicationId ? { ...app, stage_id: action.newStageId } : app
        ),
        stageHistory: [...state.stageHistory, historyEntry],
      };
    }

    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.comment] };

    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, action.job] };

    case 'ADD_CANDIDATE':
      return { ...state, candidates: [...state.candidates, action.candidate] };

    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.application] };

    case 'REORDER_STAGES': {
      const updated = action.orderedIds.map((id, index) => {
        const stage = state.stages.find(s => s.id === id)!;
        return { ...stage, display_order: index + 1 };
      });
      return { ...state, stages: updated };
    }

    case 'UPDATE_STAGE':
      return {
        ...state,
        stages: state.stages.map(s =>
          s.id === action.stageId ? { ...s, name: action.name } : s
        ),
      };

    case 'ADD_STAGE':
      return { ...state, stages: [...state.stages, action.stage] };

    case 'DELETE_STAGE':
      return { ...state, stages: state.stages.filter(s => s.id !== action.stageId) };

    case 'ADD_INTERVIEWER':
      return { ...state, interviewers: [...state.interviewers, action.interviewer] };

    case 'UPDATE_INTERVIEWER':
      return {
        ...state,
        interviewers: state.interviewers.map(i =>
          i.id === action.interviewer.id ? action.interviewer : i
        ),
      };

    case 'DELETE_INTERVIEWER':
      return {
        ...state,
        interviewers: state.interviewers.filter(i => i.id !== action.interviewerId),
      };

    case 'UPDATE_STAGE_INTERVIEWERS':
      return {
        ...state,
        applications: state.applications.map(app => {
          if (app.id !== action.applicationId) return app;
          const existing = app.stageInterviewers ?? {};
          return {
            ...app,
            stageInterviewers: {
              ...existing,
              [action.stageId]: action.interviewerIds,
            },
          };
        }),
      };

    case 'UPDATE_JOB_STATUS':
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id === action.payload.jobId ? { ...j, status: action.payload.status } : j
        ),
      };

    case 'DELETE_JOB':
      return { ...state, jobs: state.jobs.filter(j => j.id !== action.payload.jobId) };

    case 'UPDATE_JOB':
      return { ...state, jobs: state.jobs.map(j => j.id === action.job.id ? action.job : j) };

    case 'TOGGLE_STAGE_NEED_INTERVIEWER':
      return {
        ...state,
        stages: state.stages.map(s => s.id === action.stageId ? { ...s, needInterviewer: action.value } : s),
      };

    case 'ADD_INTERVIEW_QUESTION':
      return { ...state, interviewQuestions: [...state.interviewQuestions, action.question] };

    case 'UPDATE_INTERVIEW_QUESTION':
      return {
        ...state,
        interviewQuestions: state.interviewQuestions.map(q => q.id === action.question.id ? action.question : q),
      };

    case 'DELETE_INTERVIEW_QUESTION':
      return { ...state, interviewQuestions: state.interviewQuestions.filter(q => q.id !== action.questionId) };

    case 'REORDER_INTERVIEW_QUESTIONS': {
      const updated = action.orderedIds.map((id, index) => {
        const q = state.interviewQuestions.find(q => q.id === id)!;
        return { ...q, display_order: index + 1 };
      });
      return {
        ...state,
        interviewQuestions: state.interviewQuestions
          .filter(q => !(q.job_id === action.jobId && q.stage_id === action.stageId))
          .concat(updated),
      };
    }

    case 'SET_FEEDBACK_LINK':
      return {
        ...state,
        feedbackLinks: {
          ...state.feedbackLinks,
          [`${action.applicationId}_${action.stageId}`]: action.token,
        },
      };

    case 'SET_REJECT_INFO':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.applicationId ? { ...app, rejectInfo: action.rejectInfo } : app
        ),
      };

    case 'SUBMIT_FEEDBACK':
      return {
        ...state,
        applications: state.applications.map(app => {
          if (app.id !== action.applicationId) return app;
          const existing = app.stageFeedback ?? {};
          const existingStage = existing[action.stageId] ?? {};
          return {
            ...app,
            stageFeedback: {
              ...existing,
              [action.stageId]: {
                ...existingStage,
                [action.interviewerId]: { score: action.score, questions: action.questions },
              },
            },
          };
        }),
      };

    case 'SET_INTERVIEWER_META':
      return {
        ...state,
        applications: state.applications.map(app => {
          if (app.id !== action.applicationId) return app;
          const existingMeta = app.stageInterviewerMeta ?? {};
          const existingStage = existingMeta[action.stageId] ?? {};
          const existingIv = existingStage[action.interviewerId] ?? {};
          return {
            ...app,
            stageInterviewerMeta: {
              ...existingMeta,
              [action.stageId]: {
                ...existingStage,
                [action.interviewerId]: { ...existingIv, ...action.meta },
              },
            },
          };
        }),
      };

    case 'ADD_FEEDBACK_FORM_GROUP':
      return { ...state, feedbackFormGroups: [...state.feedbackFormGroups, action.group] };

    case 'UPDATE_FEEDBACK_FORM_GROUP':
      return { ...state, feedbackFormGroups: state.feedbackFormGroups.map(g => g.id === action.group.id ? action.group : g) };

    case 'DELETE_FEEDBACK_FORM_GROUP':
      return {
        ...state,
        feedbackFormGroups: state.feedbackFormGroups.filter(g => g.id !== action.groupId),
        feedbackForms: state.feedbackForms.map(f => f.group_id === action.groupId ? { ...f, group_id: null } : f),
      };

    case 'ADD_FEEDBACK_FORM':
      return { ...state, feedbackForms: [...state.feedbackForms, action.form] };

    case 'UPDATE_FEEDBACK_FORM':
      return { ...state, feedbackForms: state.feedbackForms.map(f => f.id === action.form.id ? action.form : f) };

    case 'DELETE_FEEDBACK_FORM':
      return { ...state, feedbackForms: state.feedbackForms.filter(f => f.id !== action.formId) };

    case 'UPDATE_FEEDBACK_FORM_QUESTIONS':
      return {
        ...state,
        feedbackForms: state.feedbackForms.map(f => f.id === action.formId ? { ...f, questions: action.questions } : f),
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  login: (user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialState: AppState = {
  users: mockUsers,
  jobs: mockJobs,
  stages: mockStages,
  candidates: mockCandidates,
  applications: mockApplications,
  comments: mockComments,
  stageHistory: mockStageHistory,
  interviewers: mockInterviewers,
  interviewQuestions: mockInterviewQuestions,
  feedbackForms: mockFeedbackForms,
  feedbackFormGroups: mockFeedbackFormGroups,
  // Pre-populated feedback links for mock data: applications a1, a2, a6, a8 at Interview stage (s3)
  // Token = btoa("applicationId:stageId") — self-contained, works after page reload
  feedbackLinks: {
    'a1_s3': btoa('a1:s3'),
    'a2_s3': btoa('a2:s3'),
    'a6_s3': btoa('a6:s3'),
    'a8_s3': btoa('a8:s3'),
  },
  currentUser: null,
  isLoggedIn: false,
};

function getPersistedUser(users: User[]): { currentUser: User | null; isLoggedIn: boolean } {
  try {
    const stored = localStorage.getItem('atp_current_user_id');
    if (stored) {
      const user = users.find(u => u.id === stored);
      if (user) return { currentUser: user, isLoggedIn: true };
    }
  } catch { /* ignore */ }
  return { currentUser: null, isLoggedIn: false };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    ...getPersistedUser(mockUsers),
  });

  const login = (user: User) => {
    try { localStorage.setItem('atp_current_user_id', user.id); } catch { /* ignore */ }
    dispatch({ type: 'LOGIN', user });
  };
  const logout = () => {
    try { localStorage.removeItem('atp_current_user_id'); } catch { /* ignore */ }
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AppContext.Provider value={{ ...state, dispatch, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
