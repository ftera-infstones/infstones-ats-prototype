import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
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
  InterviewerAssignmentMeta,
} from '../types';
import * as authApi from '../api/auth';
import * as jobsApi from '../api/jobs';
import * as stagesApi from '../api/stages';
import * as candidatesApi from '../api/candidates';
import * as applicationsApi from '../api/applications';
import * as interviewersApi from '../api/interviewers';
import * as interviewQuestionsApi from '../api/interviewQuestions';
import * as feedbackFormsApi from '../api/feedbackForms';
import { getUsers } from '../api/users';

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
  // Loading/error
  loading: boolean;
  error: string | null;
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
  | { type: 'SET_INTERVIEWER_META'; applicationId: string; stageId: string; interviewerId: string; meta: Partial<InterviewerAssignmentMeta> }
  | { type: 'ADD_FEEDBACK_FORM_GROUP'; group: FeedbackFormGroup }
  | { type: 'ADD_FEEDBACK_FORM'; form: FeedbackForm }
  | { type: 'UPDATE_FEEDBACK_FORM'; form: FeedbackForm }
  | { type: 'DELETE_FEEDBACK_FORM'; formId: string }
  | { type: 'DELETE_FEEDBACK_FORM_GROUP'; groupId: string }
  | { type: 'UPDATE_FEEDBACK_FORM_GROUP'; group: FeedbackFormGroup }
  | { type: 'UPDATE_FEEDBACK_FORM_QUESTIONS'; formId: string; questions: FeedbackFormQuestion[] };

// ─── Pure reducer logic (state transforms, no API calls) ──────────────────────

function reducerLogic(state: AppState, action: Action): AppState {
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
          app.id === action.applicationId ? { ...app, stage_id: action.newStageId, rejectInfo: undefined } : app
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
  dispatch: (action: Action) => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialState: AppState = {
  users: [],
  jobs: [],
  stages: [],
  candidates: [],
  applications: [],
  comments: [],
  stageHistory: [],
  interviewers: [],
  interviewQuestions: [],
  feedbackForms: [],
  feedbackFormGroups: [],
  feedbackLinks: {},
  currentUser: null,
  isLoggedIn: false,
  loading: true,
  error: null,
};

// Map of local fake IDs to in-flight promises that resolve to server IDs
const pendingIdMap = new Map<string, Promise<string>>();

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // On mount: check session and load all data
  useEffect(() => {
    async function initApp() {
      try {
        // Check if user is logged in
        const currentUser = await authApi.getMe();

        // Load all data in parallel
        const [
          jobs,
          stages,
          candidates,
          applications,
          interviewers,
          interviewQuestions,
          feedbackForms,
          feedbackFormGroups,
        ] = await Promise.all([
          jobsApi.getJobs().catch(() => [] as Job[]),
          stagesApi.getStages().catch(() => [] as PipelineStage[]),
          candidatesApi.getCandidates().catch(() => [] as Candidate[]),
          applicationsApi.getAllApplications().catch(() => [] as Application[]),
          interviewersApi.getInterviewers().catch(() => [] as Interviewer[]),
          interviewQuestionsApi.getInterviewQuestions().catch(() => [] as InterviewQuestion[]),
          feedbackFormsApi.getFeedbackForms().catch(() => [] as FeedbackForm[]),
          feedbackFormsApi.getFeedbackFormGroups().catch(() => [] as FeedbackFormGroup[]),
        ]);

        // Try to get users (admin-only, will 403 for non-admins)
        let users: User[] = [currentUser];
        try {
          users = await getUsers();
        } catch {
          // Non-admin: just use the current user
          users = [currentUser];
        }

        setState(prev => ({
          ...prev,
          currentUser,
          isLoggedIn: true,
          users,
          jobs,
          stages,
          candidates,
          applications,
          interviewers,
          interviewQuestions,
          feedbackForms,
          feedbackFormGroups,
          loading: false,
          error: null,
        }));
      } catch {
        // Not logged in or session expired
        setState(prev => ({
          ...prev,
          currentUser: null,
          isLoggedIn: false,
          loading: false,
          error: null,
        }));
      }
    }

    initApp();
  }, []);

  // Async dispatch — calls API then updates state
  const dispatch = useCallback(async (action: Action): Promise<void> => {
    switch (action.type) {
      // ── Auth actions (local only) ──────────────────────────────────────────
      case 'LOGIN':
      case 'LOGOUT':
        setState(prev => reducerLogic(prev, action));
        break;

      // ── Stage move (API + state) ───────────────────────────────────────────
      case 'MOVE_APPLICATION': {
        try {
          await applicationsApi.moveApplication(action.applicationId, action.newStageId);
        } catch (err) {
          console.error('moveApplication error:', err);
          // fall through to update state optimistically
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Comments ──────────────────────────────────────────────────────────
      case 'ADD_COMMENT': {
        // Comment is added via API before dispatch, so just update state
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Jobs ──────────────────────────────────────────────────────────────
      case 'ADD_JOB': {
        try {
          const created = await jobsApi.createJob(action.job);
          // Replace the locally-generated ID with the server-assigned ID
          setState(prev => reducerLogic(prev, { ...action, job: created }));
        } catch (err) {
          console.error('createJob error:', err);
          // Still update local state with the optimistic job
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'UPDATE_JOB': {
        try {
          const updated = await jobsApi.updateJob(action.job.id, action.job);
          setState(prev => reducerLogic(prev, { ...action, job: updated }));
        } catch (err) {
          console.error('updateJob error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'UPDATE_JOB_STATUS': {
        try {
          await jobsApi.updateJobStatus(action.payload.jobId, action.payload.status);
        } catch (err) {
          console.error('updateJobStatus error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      case 'DELETE_JOB': {
        try {
          await jobsApi.deleteJob(action.payload.jobId);
        } catch (err) {
          console.error('deleteJob error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Candidates ────────────────────────────────────────────────────────
      case 'ADD_CANDIDATE': {
        const localCandidateId = action.candidate.id;
        // Register a promise so ADD_APPLICATION can wait for the real ID
        const candidatePromise = candidatesApi.createCandidate(action.candidate)
          .then(created => {
            setState(prev => reducerLogic(prev, { ...action, candidate: created }));
            pendingIdMap.delete(localCandidateId);
            return created.id;
          })
          .catch(err => {
            console.error('createCandidate error:', err);
            setState(prev => reducerLogic(prev, action));
            pendingIdMap.delete(localCandidateId);
            return localCandidateId; // fall back to local ID
          });
        pendingIdMap.set(localCandidateId, candidatePromise);
        // don't await here — let it run in parallel with ADD_APPLICATION
        break;
      }

      // ── Applications ──────────────────────────────────────────────────────
      case 'ADD_APPLICATION': {
        try {
          // Wait for candidate creation if it's pending (local fake ID)
          let candidateId = action.application.candidate_id;
          if (pendingIdMap.has(candidateId)) {
            candidateId = await pendingIdMap.get(candidateId)!;
          }
          const created = await applicationsApi.createApplication({
            job_id: action.application.job_id,
            candidate_id: candidateId,
            stage_id: action.application.stage_id,
          });
          setState(prev => reducerLogic(prev, { ...action, application: created }));
        } catch (err) {
          console.error('createApplication error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      // ── Stages ────────────────────────────────────────────────────────────
      case 'ADD_STAGE': {
        try {
          const created = await stagesApi.createStage({
            name: action.stage.name,
            color: action.stage.color,
            is_default: action.stage.is_default,
            needInterviewer: action.stage.needInterviewer,
          });
          setState(prev => reducerLogic(prev, { ...action, stage: created }));
        } catch (err) {
          console.error('createStage error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'REORDER_STAGES': {
        try {
          await stagesApi.reorderStages(action.orderedIds);
        } catch (err) {
          console.error('reorderStages error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      case 'UPDATE_STAGE': {
        try {
          await stagesApi.updateStage(action.stageId, { name: action.name });
        } catch (err) {
          console.error('updateStage error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      case 'DELETE_STAGE': {
        try {
          await stagesApi.deleteStage(action.stageId);
        } catch (err) {
          console.error('deleteStage error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      case 'TOGGLE_STAGE_NEED_INTERVIEWER': {
        try {
          await stagesApi.updateStage(action.stageId, { needInterviewer: action.value });
        } catch (err) {
          console.error('toggleStageNeedInterviewer error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Interviewers ──────────────────────────────────────────────────────
      case 'ADD_INTERVIEWER': {
        try {
          const created = await interviewersApi.createInterviewer({
            name: action.interviewer.name,
            email: action.interviewer.email,
            jobIds: action.interviewer.jobIds,
            meetingRoomLink: action.interviewer.meetingRoomLink,
          });
          setState(prev => reducerLogic(prev, { ...action, interviewer: created }));
        } catch (err) {
          console.error('createInterviewer error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'UPDATE_INTERVIEWER': {
        try {
          const updated = await interviewersApi.updateInterviewer(action.interviewer.id, {
            name: action.interviewer.name,
            email: action.interviewer.email,
            jobIds: action.interviewer.jobIds,
            meetingRoomLink: action.interviewer.meetingRoomLink,
          });
          setState(prev => reducerLogic(prev, { ...action, interviewer: updated }));
        } catch (err) {
          console.error('updateInterviewer error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'DELETE_INTERVIEWER': {
        try {
          await interviewersApi.deleteInterviewer(action.interviewerId);
        } catch (err) {
          console.error('deleteInterviewer error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Stage interviewers ────────────────────────────────────────────────
      case 'UPDATE_STAGE_INTERVIEWERS': {
        try {
          await applicationsApi.setStageInterviewers(action.applicationId, action.stageId, action.interviewerIds);
        } catch (err) {
          console.error('setStageInterviewers error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Interview questions ───────────────────────────────────────────────
      case 'ADD_INTERVIEW_QUESTION': {
        try {
          const created = await interviewQuestionsApi.createQuestion({
            job_id: action.question.job_id,
            stage_id: action.question.stage_id,
            question: action.question.question,
            display_order: action.question.display_order,
          });
          setState(prev => reducerLogic(prev, { ...action, question: created }));
        } catch (err) {
          console.error('createQuestion error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'UPDATE_INTERVIEW_QUESTION': {
        try {
          const updated = await interviewQuestionsApi.updateQuestion(action.question.id, {
            question: action.question.question,
            display_order: action.question.display_order,
          });
          setState(prev => reducerLogic(prev, { ...action, question: updated }));
        } catch (err) {
          console.error('updateQuestion error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'DELETE_INTERVIEW_QUESTION': {
        try {
          await interviewQuestionsApi.deleteQuestion(action.questionId);
        } catch (err) {
          console.error('deleteQuestion error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      case 'REORDER_INTERVIEW_QUESTIONS': {
        try {
          await interviewQuestionsApi.reorderQuestions(action.orderedIds);
        } catch (err) {
          console.error('reorderQuestions error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Feedback link (local-only — token is btoa(appId:stageId)) ─────────
      case 'SET_FEEDBACK_LINK': {
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Reject info ───────────────────────────────────────────────────────
      case 'SET_REJECT_INFO': {
        try {
          await applicationsApi.setRejectInfo(action.applicationId, action.rejectInfo);
        } catch (err) {
          console.error('setRejectInfo error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Feedback submission (from ATS side is local state; interviewer uses public API) ──
      case 'SUBMIT_FEEDBACK': {
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Interviewer meta ──────────────────────────────────────────────────
      case 'SET_INTERVIEWER_META': {
        try {
          await applicationsApi.setInterviewerMeta(
            action.applicationId,
            action.stageId,
            action.interviewerId,
            action.meta
          );
        } catch (err) {
          console.error('setInterviewerMeta error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Feedback form groups ──────────────────────────────────────────────
      case 'ADD_FEEDBACK_FORM_GROUP': {
        try {
          const created = await feedbackFormsApi.createGroup(action.group.name);
          setState(prev => reducerLogic(prev, { ...action, group: created }));
        } catch (err) {
          console.error('createGroup error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'UPDATE_FEEDBACK_FORM_GROUP': {
        try {
          const updated = await feedbackFormsApi.updateGroup(action.group.id, action.group.name);
          setState(prev => reducerLogic(prev, { ...action, group: updated }));
        } catch (err) {
          console.error('updateGroup error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'DELETE_FEEDBACK_FORM_GROUP': {
        try {
          await feedbackFormsApi.deleteGroup(action.groupId);
        } catch (err) {
          console.error('deleteGroup error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      // ── Feedback forms ────────────────────────────────────────────────────
      case 'ADD_FEEDBACK_FORM': {
        try {
          const created = await feedbackFormsApi.createForm({
            name: action.form.name,
            group_id: action.form.group_id,
            questions: action.form.questions,
          });
          setState(prev => reducerLogic(prev, { ...action, form: created }));
        } catch (err) {
          console.error('createForm error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'UPDATE_FEEDBACK_FORM': {
        try {
          const updated = await feedbackFormsApi.updateForm(action.form.id, {
            name: action.form.name,
            group_id: action.form.group_id,
          });
          setState(prev => reducerLogic(prev, { ...action, form: updated }));
        } catch (err) {
          console.error('updateForm error:', err);
          setState(prev => reducerLogic(prev, action));
        }
        break;
      }

      case 'DELETE_FEEDBACK_FORM': {
        try {
          await feedbackFormsApi.deleteForm(action.formId);
        } catch (err) {
          console.error('deleteForm error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      case 'UPDATE_FEEDBACK_FORM_QUESTIONS': {
        try {
          await feedbackFormsApi.updateFormQuestions(action.formId, action.questions);
        } catch (err) {
          console.error('updateFormQuestions error:', err);
        }
        setState(prev => reducerLogic(prev, action));
        break;
      }

      default:
        setState(prev => reducerLogic(prev, action));
        break;
    }
  }, []);

  const login = useCallback((_user: User) => {
    // Real login: redirect to Google OAuth
    window.location.href = '/api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setState(prev => ({ ...prev, currentUser: null, isLoggedIn: false }));
    window.location.href = '/login';
  }, []);

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

// Re-export types for convenience
export type { User, Job, PipelineStage, Candidate, Application, Comment, StageHistory, Interviewer, InterviewQuestion, RejectInfo, FeedbackForm, FeedbackFormGroup, FeedbackFormQuestion, InterviewerAssignmentMeta };
export type { Action };
