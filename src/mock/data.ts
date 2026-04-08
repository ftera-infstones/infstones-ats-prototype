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
  description: string;       // About the role (summary shown in listing + header)
  responsibilities?: string; // What you'll do
  requirements?: string;     // What we're looking for
  nice_to_have?: string;     // Nice to have
  about_company?: string;    // About InfStones section
  status: 'open' | 'draft' | 'closed';
  base?: 'US' | 'CHN'; // which region this job belongs to (for visibility scoping)
  created_by?: string; // user id of the recruiter who created this job
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
  stage_id: string; // Questions are per Job + Stage
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

export interface FeedbackFormQuestion {
  id: string;
  question: string;
  answer_type: FeedbackQuestionType;
  display_order: number;
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
  referrer_name?: string; // set when source === 'Referral'
  resume_path?: string;
  current_company?: string;
  current_title?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface StageFeedback {
  score: number | null;
  questions: Array<{ question: string; feedback: string }>;
}

export type RejectReasonTag =
  | 'not_considering'    // 候选人暂时不考虑
  | 'candidate_declined' // 候选人明确拒绝
  | 'eliminated'         // 淘汰
  | 'no_hc'              // 岗位暂无 HC
  | 'other';             // 其他

// Map from tag to translation key (used with t() for i18n)
export const REJECT_REASON_KEYS: Record<RejectReasonTag, string> = {
  not_considering: 'reject_not_considering',
  candidate_declined: 'reject_candidate_declined',
  eliminated: 'reject_eliminated',
  no_hc: 'reject_no_hc',
  other: 'reject_other',
};

// Fallback English labels (used where t() is not available)
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
  // stageFeedback: Record<stageId, Record<interviewerId, StageFeedback>>
  stageFeedback?: Record<string, Record<string, StageFeedback>>;
  rejectInfo?: RejectInfo; // set when moved to Rejected stage
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
  meetingTime?: string;         // MM-DD-YYYY HH:mm (UTC+8)
  inviteEmailSent?: boolean;
  inviteEmailSentAt?: string;
  calendarCreated?: boolean;
  calendarCreatedAt?: string;
  feedbackFormId?: string;
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Zhang', email: 'alice@infstones.com', avatar_initials: 'AZ' },
  { id: 'u2', name: 'Bob Chen', email: 'bob@infstones.com', avatar_initials: 'BC' },
  { id: 'u3', name: 'Carol Wang', email: 'carol@infstones.com', avatar_initials: 'CW' },
  { id: 'u4', name: 'David Liu', email: 'david@infstones.com', avatar_initials: 'DL' },
  // Demo accounts for Access Control testing
  { id: 'u_admin', name: 'Zhenwu Shi', email: 'zhenwu@infstones.com', avatar_initials: 'ZS' },
  { id: 'u_shan', name: 'Shan Guan', email: 'shan@infstones.com', avatar_initials: 'SG', base: 'CHN' },
  { id: 'u_melissa', name: 'Melissa DeArce', email: 'melissa@infstones.com', avatar_initials: 'MD', base: 'US' },
];

const ABOUT_INFSTONES = `InfStones is a leading blockchain infrastructure provider serving developers, exchanges, and enterprises worldwide. We operate thousands of nodes across 80+ blockchains, delivering enterprise-grade staking, API, and node services at scale. Our team is distributed globally, united by a passion for making blockchain infrastructure reliable, fast, and accessible.`;

export const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    team: 'Core Platform',
    location: 'Remote',
    commitment: 'Full-time',
    description: 'We are looking for a senior backend engineer to join our core infrastructure team. You will design and implement scalable APIs and services that power the next generation of blockchain infrastructure.',
    responsibilities: `• Design, build, and maintain high-performance backend services and APIs\n• Collaborate with product and frontend teams to deliver end-to-end features\n• Optimize database queries and system performance for high-traffic workloads\n• Participate in on-call rotations and incident response\n• Conduct code reviews and mentor junior engineers`,
    requirements: `• 5+ years of backend engineering experience (Go, Node.js, or Python)\n• Strong understanding of distributed systems, microservices, and API design\n• Experience with PostgreSQL, Redis, and message queues (Kafka, RabbitMQ)\n• Comfortable working in a fast-paced, remote-first environment\n• Familiarity with blockchain concepts is a plus`,
    nice_to_have: `• Experience with Kubernetes and container orchestration\n• Prior work at a blockchain or Web3 company\n• Open-source contributions`,
    about_company: ABOUT_INFSTONES,
    status: 'open',
    created_at: '2026-03-01',
    created_by: 'u_shan', base: 'CHN',
  },
  {
    id: 'j2',
    title: 'Frontend Engineer',
    department: 'Engineering',
    team: 'Developer Experience',
    location: 'Remote',
    commitment: 'Full-time',
    description: 'Join our frontend team to build world-class user interfaces for blockchain infrastructure management tools used by developers worldwide.',
    responsibilities: `• Build and maintain React-based web applications and dashboards\n• Collaborate with designers to implement pixel-perfect UI components\n• Write unit and integration tests to ensure code quality\n• Optimize frontend performance and loading times\n• Contribute to our internal component library`,
    requirements: `• 3+ years of frontend engineering experience\n• Proficiency in React, TypeScript, and modern CSS (Tailwind a plus)\n• Experience with REST APIs and state management (Redux, Zustand, or Context API)\n• Strong eye for design and attention to detail`,
    nice_to_have: `• Experience with Web3/blockchain frontend (ethers.js, wagmi)\n• Familiarity with Node.js for backend-for-frontend patterns`,
    about_company: ABOUT_INFSTONES,
    status: 'open',
    created_at: '2026-03-05',
    created_by: 'u_shan', base: 'CHN',
  },
  {
    id: 'j3',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    team: 'Site Reliability',
    location: 'Remote',
    commitment: 'Full-time',
    description: 'We need a DevOps engineer to improve our CI/CD pipelines and manage cloud infrastructure at scale across 80+ blockchain networks.',
    responsibilities: `• Design and maintain CI/CD pipelines for rapid, reliable deployments\n• Manage Kubernetes clusters and cloud infrastructure (AWS, GCP)\n• Monitor system health, respond to incidents, and drive post-mortems\n• Implement infrastructure-as-code using Terraform\n• Collaborate with engineering teams on deployment strategies`,
    requirements: `• 3+ years of DevOps or SRE experience\n• Hands-on experience with Kubernetes, Docker, and Helm\n• Proficiency in at least one IaC tool (Terraform preferred)\n• Experience with monitoring stacks (Prometheus, Grafana, ELK)\n• Strong scripting skills (Bash, Python)`,
    nice_to_have: `• Experience operating blockchain nodes\n• Certifications: CKA, AWS Solutions Architect\n• Experience with GitOps workflows (ArgoCD, Flux)`,
    about_company: ABOUT_INFSTONES,
    status: 'open',
    created_at: '2026-03-10',
    created_by: 'u_melissa', base: 'US',
  },
  {
    id: 'j4',
    title: 'Product Manager',
    department: 'Product',
    team: 'Developer Tools',
    location: 'Remote',
    commitment: 'Full-time',
    description: 'Lead product strategy and roadmap for our developer tools suite, helping teams across the blockchain ecosystem build faster.',
    responsibilities: `• Own the product roadmap for developer-facing tools and APIs\n• Conduct user research, interviews, and competitive analysis\n• Write clear product specs and partner closely with engineering\n• Define and track product KPIs and success metrics\n• Work cross-functionally with sales, marketing, and customer success`,
    requirements: `• 4+ years of product management experience at a B2B SaaS or developer tools company\n• Strong analytical mindset with experience using data to drive decisions\n• Excellent written and verbal communication skills\n• Ability to translate technical concepts into user-friendly product narratives`,
    nice_to_have: `• Background in blockchain or Web3\n• Experience with developer tools or infrastructure products\n• Technical background (CS degree or coding experience)`,
    about_company: ABOUT_INFSTONES,
    status: 'draft',
    created_at: '2026-03-15',
    created_by: 'u_melissa', base: 'US',
  },
  {
    id: 'j5',
    title: 'Data Engineer',
    department: 'Data',
    team: 'Analytics',
    location: 'Remote',
    commitment: 'Full-time',
    description: 'Build and maintain data pipelines for blockchain analytics, powering insights for customers and internal teams.',
    responsibilities: `• Design and implement scalable data pipelines and ETL processes\n• Build data models and maintain our data warehouse\n• Work with product and analytics teams to deliver data-driven insights\n• Ensure data quality, reliability, and observability`,
    requirements: `• 3+ years of data engineering experience\n• Proficiency in Python, SQL, and data pipeline frameworks (Airflow, dbt)\n• Experience with cloud data warehouses (BigQuery, Snowflake, Redshift)\n• Strong understanding of data modeling best practices`,
    nice_to_have: `• Experience with blockchain data (on-chain analytics)\n• Knowledge of streaming data systems (Kafka, Flink)`,
    about_company: ABOUT_INFSTONES,
    status: 'closed',
    created_at: '2026-02-01',
    created_by: 'u_melissa', base: 'US',
  },
];

export const mockStages: PipelineStage[] = [
  { id: 's1', name: 'Applied',   color: '#3b82f6', display_order: 1, is_default: true, needInterviewer: false },
  { id: 's2', name: 'Screening', color: '#eab308', display_order: 2, is_default: true, needInterviewer: false },
  { id: 's3', name: 'Interview', color: '#a855f7', display_order: 3, is_default: true, needInterviewer: true  },
  { id: 's4', name: 'Offer',     color: '#f97316', display_order: 4, is_default: true, needInterviewer: false },
  { id: 's5', name: 'Hired',     color: '#22c55e', display_order: 5, is_default: true, needInterviewer: false },
  { id: 's6', name: 'Rejected',  color: '#ef4444', display_order: 6, is_default: true, needInterviewer: false },
];

export const mockInterviewQuestions: InterviewQuestion[] = [
  // j1 (Senior Backend) - Screening stage (s2)
  { id: 'iq1', job_id: 'j1', stage_id: 's2', question: 'Tell me about your backend engineering background.', display_order: 1 },
  { id: 'iq2', job_id: 'j1', stage_id: 's2', question: 'What draws you to InfStones and blockchain infrastructure?', display_order: 2 },
  // j1 (Senior Backend) - Interview stage (s3)
  { id: 'iq3', job_id: 'j1', stage_id: 's3', question: 'Walk me through your experience with distributed systems.', display_order: 1 },
  { id: 'iq4', job_id: 'j1', stage_id: 's3', question: 'How do you handle production incidents and post-mortems?', display_order: 2 },
  { id: 'iq5', job_id: 'j1', stage_id: 's3', question: 'Design a rate limiter for a high-traffic API.', display_order: 3 },
  // j2 (Frontend) - Screening stage (s2)
  { id: 'iq6', job_id: 'j2', stage_id: 's2', question: "What's your experience with React and TypeScript?", display_order: 1 },
  // j2 (Frontend) - Interview stage (s3)
  { id: 'iq7', job_id: 'j2', stage_id: 's3', question: 'Describe your experience with React performance optimization.', display_order: 1 },
  { id: 'iq8', job_id: 'j2', stage_id: 's3', question: 'How do you manage state in a large React application?', display_order: 2 },
  // j3 (DevOps) - Interview stage (s3)
  { id: 'iq9', job_id: 'j3', stage_id: 's3', question: 'Walk us through how you would design a zero-downtime deployment pipeline.', display_order: 1 },
  { id: 'iq10', job_id: 'j3', stage_id: 's3', question: 'How do you monitor and alert on Kubernetes cluster health?', display_order: 2 },
];

export const mockCandidates: Candidate[] = [
  { id: 'c1', name: 'James Wilson', email: 'james.wilson@gmail.com', phone: '+1-415-555-0101', source: 'LinkedIn', resume_path: 'james_wilson_resume.pdf', current_company: 'Coinbase', current_title: 'Senior Software Engineer', linkedin: 'https://linkedin.com/in/jameswilson', portfolio: 'https://github.com/jameswilson' },
  { id: 'c2', name: 'Sophia Martinez', email: 'sophia.m@outlook.com', phone: '+1-415-555-0102', source: 'Referral', referrer_name: 'Chen Wei', resume_path: 'sophia_martinez_cv.pdf', current_company: 'Binance', current_title: 'Frontend Engineer', linkedin: 'https://linkedin.com/in/sophiamartinez' },
  { id: 'c3', name: 'Liam Johnson', email: 'liam.j@gmail.com', phone: '+1-415-555-0103', source: 'Website', current_company: 'Freelance', current_title: 'Full Stack Developer', portfolio: 'https://liamjohnson.dev' },
  { id: 'c4', name: 'Emma Brown', email: 'emma.brown@hotmail.com', phone: '+1-415-555-0104', source: 'LinkedIn', resume_path: 'emma_brown_resume.pdf', current_company: 'AWS', current_title: 'DevOps Engineer', linkedin: 'https://linkedin.com/in/emmabrown' },
  { id: 'c5', name: 'Noah Davis', email: 'noah.davis@gmail.com', phone: '+1-415-555-0105', source: 'Referral', current_company: 'Google', current_title: 'Site Reliability Engineer' },
  { id: 'c6', name: 'Olivia Garcia', email: 'olivia.g@yahoo.com', phone: '+1-415-555-0106', source: 'LinkedIn', resume_path: 'olivia_garcia_cv.pdf', current_company: 'Meta', current_title: 'Product Manager', linkedin: 'https://linkedin.com/in/oliviagarcia', portfolio: 'https://oliviagarcia.com' },
  { id: 'c7', name: 'William Anderson', email: 'william.a@gmail.com', phone: '+1-415-555-0107', source: 'Website', current_company: 'Chainlink', current_title: 'Backend Engineer' },
  { id: 'c8', name: 'Ava Thomas', email: 'ava.thomas@gmail.com', phone: '+1-415-555-0108', source: 'LinkedIn', resume_path: 'ava_thomas_resume.pdf', current_company: 'Polygon', current_title: 'Data Engineer', linkedin: 'https://linkedin.com/in/avathomas' },
  { id: 'c9', name: 'Mason Jackson', email: 'mason.j@outlook.com', phone: '+1-415-555-0109', source: 'Referral', resume_path: 'mason_jackson_cv.pdf', current_company: 'Stripe', current_title: 'Software Engineer', linkedin: 'https://linkedin.com/in/masonjackson', portfolio: 'https://github.com/masonjackson' },
  { id: 'c10', name: 'Isabella White', email: 'isabella.w@gmail.com', phone: '+1-415-555-0110', source: 'Website', current_company: 'Figma', current_title: 'Frontend Developer' },
  { id: 'c11', name: 'Ethan Harris', email: 'ethan.h@gmail.com', phone: '+1-415-555-0111', source: 'LinkedIn', resume_path: 'ethan_harris_resume.pdf', current_company: 'Solana Labs', current_title: 'Blockchain Engineer', linkedin: 'https://linkedin.com/in/ethanharris' },
  { id: 'c12', name: 'Mia Martin', email: 'mia.martin@yahoo.com', phone: '+1-415-555-0112', source: 'Referral', current_company: 'Uniswap', current_title: 'Smart Contract Developer' },
];

export const mockInterviewers: Interviewer[] = [
  { id: 'iv1', name: 'Rachel Kim', email: 'rachel.kim@infstones.com', jobIds: ['j1', 'j3'], meetingRoomLink: 'https://meet.google.com/abc-defg-hij' },
  { id: 'iv6', name: 'Yi Yang', email: 'yi@infstones.com', jobIds: ['j1', 'j2', 'j3'], meetingRoomLink: 'https://meet.google.com/yi-infstones' },
  { id: 'iv2', name: 'Marcus Lee', email: 'marcus.lee@infstones.com', jobIds: ['j1', 'j2'], meetingRoomLink: 'https://zoom.us/j/123456789' },
  { id: 'iv3', name: 'Priya Sharma', email: 'priya.sharma@infstones.com', jobIds: ['j2', 'j4'], meetingRoomLink: 'https://meet.google.com/klm-nopq-rst' },
  { id: 'iv4', name: 'Tom Bradley', email: 'tom.bradley@infstones.com', jobIds: ['j3', 'j5'], meetingRoomLink: 'https://teams.microsoft.com/l/meetup/xyz' },
  { id: 'iv5', name: 'Chen Wei', email: 'chen.wei@infstones.com', jobIds: ['j1', 'j5'], meetingRoomLink: 'https://meet.google.com/uvw-xyz-123' },
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
      's3': ['iv1', 'iv2', 'iv6'],
    },
    stageFeedback: {
      's2': {
        'iv1': {
          score: 4,
          questions: [
            { question: 'Walk me through your experience with distributed systems.', feedback: 'Strong understanding of CAP theorem and eventual consistency. Demonstrated practical experience with Kafka and Cassandra at previous company.' },
            { question: 'How do you handle production incidents?', feedback: 'Has a well-defined on-call process. Uses structured incident response with clear runbooks and post-mortems.' },
          ],
        },
      },
      's3': {
        'iv1': {
          score: 3,
          questions: [
            { question: 'Design a rate limiter for a high-traffic API.', feedback: 'Good approach using token bucket algorithm. Could improve on edge cases around burst handling and distributed token synchronization.' },
          ],
        },
        'iv2': {
          score: 4,
          questions: [
            { question: 'Explain your approach to database indexing and query optimization.', feedback: 'Solid fundamentals. Mentioned covering indexes and query plan analysis. Could go deeper on sharding strategies.' },
          ],
        },
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
        'iv2': {
          score: 4,
          questions: [
            { question: 'Describe your experience building microservices at scale.', feedback: 'Excellent answer. Has hands-on experience with service mesh, circuit breakers, and distributed tracing.' },
          ],
        },
      },
      's3': {
        'iv1': {
          score: 4,
          questions: [
            { question: 'How do you approach system design for a globally distributed service?', feedback: 'Outstanding candidate. Covered geo-routing, multi-region replication, and latency trade-offs comprehensively.' },
          ],
        },
        'iv5': {
          score: 4,
          questions: [
            { question: 'Tell me about a technical challenge you solved under pressure.', feedback: 'Strong communication. Walked through a war story about a P0 outage with clear root cause analysis and follow-up actions.' },
          ],
        },
      },
    },
  },
  { id: 'a3', job_id: 'j1', candidate_id: 'c3', stage_id: 's1', applied_at: '2026-03-20' },
  { id: 'a4', job_id: 'j1', candidate_id: 'c4', stage_id: 's6', applied_at: '2026-03-08', rejectInfo: { tag: 'eliminated', description: 'Technical interview score did not meet the bar. Will reconsider in 6 months.' } },
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
        'iv3': {
          score: 4,
          questions: [
            { question: 'Describe your experience with React performance optimization.', feedback: 'Excellent. Discussed memoization, virtual DOM diffing, code splitting, and lazy loading in detail.' },
          ],
        },
      },
      's3': {
        'iv2': {
          score: 3,
          questions: [
            { question: 'How do you manage state in a large React application?', feedback: 'Good knowledge of Context API, Redux, and Zustand. Could strengthen understanding of server state vs client state separation.' },
          ],
        },
        'iv3': {
          score: 4,
          questions: [
            { question: 'Walk me through your CSS architecture approach for a design system.', feedback: 'Demonstrated strong understanding of design tokens, atomic CSS, and component-driven styling. Very solid candidate.' },
          ],
        },
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
        'iv1': {
          score: 3,
          questions: [
            { question: 'Walk us through how you would design a zero-downtime deployment pipeline.', feedback: 'Solid approach with blue-green deployments and canary releases. Mentioned health checks and automatic rollback triggers.' },
          ],
        },
        'iv4': {
          score: 3,
          questions: [
            { question: 'How do you monitor and alert on Kubernetes cluster health?', feedback: 'Good knowledge of Prometheus and Grafana. Mentioned resource quotas and HPA. Could improve on multi-cluster observability.' },
          ],
        },
      },
    },
  },
  { id: 'a9', job_id: 'j3', candidate_id: 'c9', stage_id: 's5', applied_at: '2026-03-01' },
  // Product Manager (j4)
  { id: 'a10', job_id: 'j4', candidate_id: 'c10', stage_id: 's1', applied_at: '2026-03-18' },
  // Data Engineer (j5)
  { id: 'a11', job_id: 'j5', candidate_id: 'c11', stage_id: 's6', applied_at: '2026-02-10', rejectInfo: { tag: 'no_hc', description: 'Position has been put on hold due to budget freeze.' } },
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

export const mockFeedbackFormGroups: FeedbackFormGroup[] = [
  { id: 'fg1', name: 'COM' },
  { id: 'fg2', name: '1 MAN' },
  { id: 'fg3', name: '2 FIN' },
];

export const mockFeedbackForms: FeedbackForm[] = [
  // COM group
  { id: 'ff1', name: 'CEO Final Interview Feedback Form', group_id: 'fg1', questions: [] },
  { id: 'ff2', name: 'MAN-HR Behavior and Culture Feedback Form CHN', group_id: 'fg1', questions: [] },
  { id: 'ff3', name: 'MAN-HR Behavior and Culture Feedback Form USA', group_id: 'fg1', questions: [] },
  // 1 MAN group
  {
    id: 'ff4',
    name: '1.1 MAN-HR Interview Feedback Form',
    group_id: 'fg2',
    questions: [
      { id: 'fq1', question: 'Describe the candidate\'s communication skills and professionalism.', answer_type: 'text_paragraph', display_order: 1 },
      { id: 'fq2', question: 'Overall culture fit score', answer_type: 'score', display_order: 2 },
      { id: 'fq3', question: 'Would you recommend this candidate for the next round?', answer_type: 'yes_no', display_order: 3 },
    ],
  },
  { id: 'ff5', name: '1.2 MAN-Recruiter Interview Feedback Form', group_id: 'fg2', questions: [] },
  // 2 FIN group
  { id: 'ff6', name: 'FIN Interview Feedback Form', group_id: 'fg3', questions: [] },
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
