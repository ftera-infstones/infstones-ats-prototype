export interface User {
  id: string;
  name: string;
  email: string;
  avatar_initials: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  status: 'open' | 'draft' | 'closed';
  created_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  display_order: number;
  is_default: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'LinkedIn' | 'Referral' | 'Website' | 'Other';
  resume_path?: string;
}

export interface StageFeedback {
  score: number | null;
  questions: Array<{ question: string; feedback: string }>;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  stage_id: string;
  applied_at: string;
  stageInterviewers?: Record<string, string[]>;
  stageFeedback?: Record<string, StageFeedback>;
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
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Zhang', email: 'alice@infstones.com', avatar_initials: 'AZ' },
  { id: 'u2', name: 'Bob Chen', email: 'bob@infstones.com', avatar_initials: 'BC' },
  { id: 'u3', name: 'Carol Wang', email: 'carol@infstones.com', avatar_initials: 'CW' },
  { id: 'u4', name: 'David Liu', email: 'david@infstones.com', avatar_initials: 'DL' },
];

export const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    description: 'We are looking for a senior backend engineer to join our core infrastructure team. You will be responsible for designing and implementing scalable APIs and services.',
    status: 'open',
    created_at: '2026-03-01',
  },
  {
    id: 'j2',
    title: 'Frontend Engineer',
    department: 'Engineering',
    description: 'Join our frontend team to build world-class user interfaces for blockchain infrastructure management.',
    status: 'open',
    created_at: '2026-03-05',
  },
  {
    id: 'j3',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    description: 'We need a DevOps engineer to improve our CI/CD pipelines and manage cloud infrastructure at scale.',
    status: 'open',
    created_at: '2026-03-10',
  },
  {
    id: 'j4',
    title: 'Product Manager',
    department: 'Product',
    description: 'Lead product strategy and roadmap for our developer tools suite.',
    status: 'draft',
    created_at: '2026-03-15',
  },
  {
    id: 'j5',
    title: 'Data Engineer',
    department: 'Data',
    description: 'Build and maintain data pipelines for blockchain analytics.',
    status: 'closed',
    created_at: '2026-02-01',
  },
];

export const mockStages: PipelineStage[] = [
  { id: 's1', name: 'Applied', color: '#3b82f6', display_order: 1, is_default: true },
  { id: 's2', name: 'Screening', color: '#eab308', display_order: 2, is_default: true },
  { id: 's3', name: 'Interview', color: '#a855f7', display_order: 3, is_default: true },
  { id: 's4', name: 'Offer', color: '#f97316', display_order: 4, is_default: true },
  { id: 's5', name: 'Hired', color: '#22c55e', display_order: 5, is_default: true },
  { id: 's6', name: 'Rejected', color: '#ef4444', display_order: 6, is_default: true },
];

export const mockCandidates: Candidate[] = [
  { id: 'c1', name: 'James Wilson', email: 'james.wilson@gmail.com', phone: '+1-415-555-0101', source: 'LinkedIn', resume_path: 'james_wilson_resume.pdf' },
  { id: 'c2', name: 'Sophia Martinez', email: 'sophia.m@outlook.com', phone: '+1-415-555-0102', source: 'Referral', resume_path: 'sophia_martinez_cv.pdf' },
  { id: 'c3', name: 'Liam Johnson', email: 'liam.j@gmail.com', phone: '+1-415-555-0103', source: 'Website' },
  { id: 'c4', name: 'Emma Brown', email: 'emma.brown@hotmail.com', phone: '+1-415-555-0104', source: 'LinkedIn', resume_path: 'emma_brown_resume.pdf' },
  { id: 'c5', name: 'Noah Davis', email: 'noah.davis@gmail.com', phone: '+1-415-555-0105', source: 'Referral' },
  { id: 'c6', name: 'Olivia Garcia', email: 'olivia.g@yahoo.com', phone: '+1-415-555-0106', source: 'LinkedIn', resume_path: 'olivia_garcia_cv.pdf' },
  { id: 'c7', name: 'William Anderson', email: 'william.a@gmail.com', phone: '+1-415-555-0107', source: 'Website' },
  { id: 'c8', name: 'Ava Thomas', email: 'ava.thomas@gmail.com', phone: '+1-415-555-0108', source: 'LinkedIn', resume_path: 'ava_thomas_resume.pdf' },
  { id: 'c9', name: 'Mason Jackson', email: 'mason.j@outlook.com', phone: '+1-415-555-0109', source: 'Referral', resume_path: 'mason_jackson_cv.pdf' },
  { id: 'c10', name: 'Isabella White', email: 'isabella.w@gmail.com', phone: '+1-415-555-0110', source: 'Website' },
  { id: 'c11', name: 'Ethan Harris', email: 'ethan.h@gmail.com', phone: '+1-415-555-0111', source: 'LinkedIn', resume_path: 'ethan_harris_resume.pdf' },
  { id: 'c12', name: 'Mia Martin', email: 'mia.martin@yahoo.com', phone: '+1-415-555-0112', source: 'Referral' },
];

export const mockInterviewers: Interviewer[] = [
  { id: 'iv1', name: 'Rachel Kim', email: 'rachel.kim@infstones.com', jobIds: ['j1', 'j3'] },
  { id: 'iv2', name: 'Marcus Lee', email: 'marcus.lee@infstones.com', jobIds: ['j1', 'j2'] },
  { id: 'iv3', name: 'Priya Sharma', email: 'priya.sharma@infstones.com', jobIds: ['j2', 'j4'] },
  { id: 'iv4', name: 'Tom Bradley', email: 'tom.bradley@infstones.com', jobIds: ['j3', 'j5'] },
  { id: 'iv5', name: 'Chen Wei', email: 'chen.wei@infstones.com', jobIds: ['j1', 'j5'] },
];

export const mockApplications: Application[] = [
  // Senior Backend Engineer (j1)
  {
    id: 'a1',
    job_id: 'j1',
    candidate_id: 'c1',
    stage_id: 's3',
    applied_at: '2026-03-05',
    stageInterviewers: {
      's2': ['iv1'],
      's3': ['iv1', 'iv2'],
    },
    stageFeedback: {
      's2': {
        score: 4,
        questions: [
          {
            question: 'Walk me through your experience with distributed systems.',
            feedback: 'Strong understanding of CAP theorem and eventual consistency. Demonstrated practical experience with Kafka and Cassandra at previous company.',
          },
          {
            question: 'How do you handle production incidents?',
            feedback: 'Has a well-defined on-call process. Uses structured incident response with clear runbooks and post-mortems.',
          },
        ],
      },
      's3': {
        score: 3,
        questions: [
          {
            question: 'Design a rate limiter for a high-traffic API.',
            feedback: 'Good approach using token bucket algorithm. Could improve on edge cases around burst handling and distributed token synchronization.',
          },
          {
            question: 'Explain your approach to database indexing and query optimization.',
            feedback: 'Solid fundamentals. Mentioned covering indexes and query plan analysis. Could go deeper on sharding strategies.',
          },
        ],
      },
    },
  },
  {
    id: 'a2',
    job_id: 'j1',
    candidate_id: 'c2',
    stage_id: 's4',
    applied_at: '2026-03-06',
    stageInterviewers: {
      's2': ['iv2'],
      's3': ['iv1', 'iv5'],
    },
    stageFeedback: {
      's2': {
        score: 4,
        questions: [
          {
            question: 'Describe your experience building microservices at scale.',
            feedback: 'Excellent answer. Has hands-on experience with service mesh, circuit breakers, and distributed tracing.',
          },
        ],
      },
      's3': {
        score: 4,
        questions: [
          {
            question: 'How do you approach system design for a globally distributed service?',
            feedback: 'Outstanding candidate. Covered geo-routing, multi-region replication, and latency trade-offs comprehensively.',
          },
          {
            question: 'Tell me about a technical challenge you solved under pressure.',
            feedback: 'Strong communication. Walked through a war story about a P0 outage with clear root cause analysis and follow-up actions.',
          },
        ],
      },
      's4': {
        score: null,
        questions: [],
      },
    },
  },
  { id: 'a3', job_id: 'j1', candidate_id: 'c3', stage_id: 's1', applied_at: '2026-03-20' },
  { id: 'a4', job_id: 'j1', candidate_id: 'c4', stage_id: 's6', applied_at: '2026-03-08' },
  // Frontend Engineer (j2)
  { id: 'a5', job_id: 'j2', candidate_id: 'c5', stage_id: 's2', applied_at: '2026-03-10' },
  {
    id: 'a6',
    job_id: 'j2',
    candidate_id: 'c6',
    stage_id: 's3',
    applied_at: '2026-03-11',
    stageInterviewers: {
      's2': ['iv3'],
      's3': ['iv2', 'iv3'],
    },
    stageFeedback: {
      's2': {
        score: 4,
        questions: [
          {
            question: 'Describe your experience with React performance optimization.',
            feedback: 'Excellent. Discussed memoization, virtual DOM diffing, code splitting, and lazy loading in detail.',
          },
        ],
      },
      's3': {
        score: 3,
        questions: [
          {
            question: 'How do you manage state in a large React application?',
            feedback: 'Good knowledge of Context API, Redux, and Zustand. Could strengthen understanding of server state vs client state separation.',
          },
        ],
      },
    },
  },
  { id: 'a7', job_id: 'j2', candidate_id: 'c7', stage_id: 's1', applied_at: '2026-03-22' },
  // DevOps Engineer (j3)
  {
    id: 'a8',
    job_id: 'j3',
    candidate_id: 'c8',
    stage_id: 's3',
    applied_at: '2026-03-12',
    stageInterviewers: {
      's3': ['iv1', 'iv4'],
    },
    stageFeedback: {
      's3': {
        score: 3,
        questions: [
          {
            question: 'Walk us through how you would design a zero-downtime deployment pipeline.',
            feedback: 'Solid approach with blue-green deployments and canary releases. Mentioned health checks and automatic rollback triggers.',
          },
          {
            question: 'How do you monitor and alert on Kubernetes cluster health?',
            feedback: 'Good knowledge of Prometheus and Grafana. Mentioned resource quotas and HPA. Could improve on multi-cluster observability.',
          },
        ],
      },
    },
  },
  { id: 'a9', job_id: 'j3', candidate_id: 'c9', stage_id: 's5', applied_at: '2026-03-01' },
  // Product Manager (j4)
  { id: 'a10', job_id: 'j4', candidate_id: 'c10', stage_id: 's1', applied_at: '2026-03-18' },
  // Data Engineer (j5)
  { id: 'a11', job_id: 'j5', candidate_id: 'c11', stage_id: 's6', applied_at: '2026-02-10' },
  { id: 'a12', job_id: 'j5', candidate_id: 'c12', stage_id: 's5', applied_at: '2026-02-05' },
];

export const mockComments: Comment[] = [
  { id: 'cm1', application_id: 'a1', user_id: 'u1', content: 'Strong system design skills. Cleared the technical phone screen easily.', created_at: '2026-03-10T10:00:00Z' },
  { id: 'cm2', application_id: 'a1', user_id: 'u2', content: 'Coding challenge result: 85/100. Good performance on distributed systems problems.', created_at: '2026-03-15T14:30:00Z' },
  { id: 'cm3', application_id: 'a2', user_id: 'u1', content: 'Excellent candidate. Offer letter drafted, pending final approval.', created_at: '2026-03-20T09:00:00Z' },
  { id: 'cm4', application_id: 'a2', user_id: 'u3', content: 'Compensation expectations align. Ready to extend offer.', created_at: '2026-03-21T11:00:00Z' },
  { id: 'cm5', application_id: 'a5', user_id: 'u2', content: 'Portfolio looks solid. Scheduling a technical interview next week.', created_at: '2026-03-14T16:00:00Z' },
  { id: 'cm6', application_id: 'a6', user_id: 'u1', content: 'Passed React and TypeScript technical assessment with flying colors.', created_at: '2026-03-18T13:00:00Z' },
  { id: 'cm7', application_id: 'a8', user_id: 'u4', content: 'Strong Kubernetes and Terraform experience. Culture fit seems good.', created_at: '2026-03-17T10:30:00Z' },
  { id: 'cm8', application_id: 'a9', user_id: 'u1', content: 'Hired! Start date: April 15, 2026. Great addition to the infra team.', created_at: '2026-03-25T15:00:00Z' },
];

export const mockStageHistory: StageHistory[] = [
  { id: 'sh1', application_id: 'a1', from_stage_id: null, to_stage_id: 's1', moved_at: '2026-03-05T08:00:00Z', moved_by_user_id: 'u1' },
  { id: 'sh2', application_id: 'a1', from_stage_id: 's1', to_stage_id: 's2', moved_at: '2026-03-08T09:00:00Z', moved_by_user_id: 'u1' },
  { id: 'sh3', application_id: 'a1', from_stage_id: 's2', to_stage_id: 's3', moved_at: '2026-03-12T10:00:00Z', moved_by_user_id: 'u2' },
  { id: 'sh4', application_id: 'a2', from_stage_id: null, to_stage_id: 's1', moved_at: '2026-03-06T08:00:00Z', moved_by_user_id: 'u1' },
  { id: 'sh5', application_id: 'a2', from_stage_id: 's1', to_stage_id: 's2', moved_at: '2026-03-09T09:00:00Z', moved_by_user_id: 'u1' },
  { id: 'sh6', application_id: 'a2', from_stage_id: 's2', to_stage_id: 's3', moved_at: '2026-03-13T10:00:00Z', moved_by_user_id: 'u2' },
  { id: 'sh7', application_id: 'a2', from_stage_id: 's3', to_stage_id: 's4', moved_at: '2026-03-19T11:00:00Z', moved_by_user_id: 'u1' },
  { id: 'sh8', application_id: 'a9', from_stage_id: null, to_stage_id: 's1', moved_at: '2026-03-01T08:00:00Z', moved_by_user_id: 'u4' },
  { id: 'sh9', application_id: 'a9', from_stage_id: 's1', to_stage_id: 's2', moved_at: '2026-03-05T09:00:00Z', moved_by_user_id: 'u4' },
  { id: 'sh10', application_id: 'a9', from_stage_id: 's2', to_stage_id: 's3', moved_at: '2026-03-10T10:00:00Z', moved_by_user_id: 'u4' },
  { id: 'sh11', application_id: 'a9', from_stage_id: 's3', to_stage_id: 's4', moved_at: '2026-03-17T11:00:00Z', moved_by_user_id: 'u1' },
  { id: 'sh12', application_id: 'a9', from_stage_id: 's4', to_stage_id: 's5', moved_at: '2026-03-24T12:00:00Z', moved_by_user_id: 'u1' },
];
