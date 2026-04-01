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
} from '../mock/data';
import type {
  User,
  Job,
  PipelineStage,
  Candidate,
  Application,
  Comment,
  StageHistory,
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
  | { type: 'ADD_APPLICATION'; application: Application }
  | { type: 'REORDER_STAGES'; orderedIds: string[] }
  | { type: 'UPDATE_STAGE'; stageId: string; name: string }
  | { type: 'ADD_STAGE'; stage: PipelineStage }
  | { type: 'DELETE_STAGE'; stageId: string };

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
  currentUser: null,
  isLoggedIn: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = (user: User) => dispatch({ type: 'LOGIN', user });
  const logout = () => dispatch({ type: 'LOGOUT' });

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
