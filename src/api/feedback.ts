/**
 * Public feedback API — for the interviewer feedback page.
 * Uses the existing server route: GET/POST /api/feedback/:applicationId/:stageId
 * Token = btoa(`${applicationId}:${stageId}`)
 */

const BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export interface FeedbackVerifyResult {
  valid: boolean;
  applicationId: string;
  stageId: string;
}

export interface FeedbackDataResult {
  application: {
    id: string;
    job: { id: string; title: string };
    candidate: { id: string; name: string; email: string; phone: string; source: string; resume_path?: string };
    stage_id: string;
  };
  interviewer: { id: string; name: string; email: string };
  feedbackForm: {
    id: string;
    name: string;
    questions: Array<{
      id: string;
      question: string;
      answer_type: string;
      display_order: number;
      options?: string[];
      score_min?: number;
      score_max?: number;
    }>;
  } | null;
  existingFeedback: {
    score: number | null;
    questions: Array<{ question: string; feedback: string; comment?: string }>;
  } | null;
}

/**
 * Verify the token is valid (no email yet).
 */
export async function verifyToken(applicationId: string, stageId: string, token: string): Promise<FeedbackVerifyResult> {
  const url = `${BASE}/feedback/${applicationId}/${stageId}?token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  return handleResponse<FeedbackVerifyResult>(res);
}

/**
 * Verify email and get full feedback data.
 */
export async function getFeedbackData(applicationId: string, stageId: string, token: string, email: string): Promise<FeedbackDataResult> {
  const params = new URLSearchParams({ token, email });
  const url = `${BASE}/feedback/${applicationId}/${stageId}?${params}`;
  const res = await fetch(url);
  return handleResponse<FeedbackDataResult>(res);
}

/**
 * Submit feedback.
 */
export async function submitFeedback(
  applicationId: string,
  stageId: string,
  token: string,
  email: string,
  score: number | null,
  questions: Array<{ question: string; feedback: string; comment?: string }>
): Promise<{ ok: boolean }> {
  const url = `${BASE}/feedback/${applicationId}/${stageId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email, score, questions }),
  });
  return handleResponse<{ ok: boolean }>(res);
}
