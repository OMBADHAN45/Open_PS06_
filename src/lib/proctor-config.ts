// Proctoring configuration for the Assessment & Proctoring module

export const PROCTOR_CONFIG = {
  MAX_WARNINGS: 3,
  LOUD_LIMIT: 40,
  FACE_AWAY_SECONDS: 3,
  DETECT_INTERVAL_MS: 1000,
  BAD_OBJECTS: ["cell phone", "book", "laptop"] as const,
  EXAM_MINUTES: 10,
  COOLDOWN_MS: 5000,
  PASS_THRESHOLD: 75,
} as const;

export type WarningType =
  | "fullscreen_exit"
  | "tab_switch"
  | "camera_off"
  | "loud_noise"
  | "no_face"
  | "multiple_faces"
  | "face_away"
  | "bad_object"
  | "multiple_persons"
  | "shortcut_blocked";

export interface WarningEvent {
  type: WarningType;
  time: number;
  message: string;
  snapshot?: string;
}

export const WARNING_LABELS: Record<WarningType, string> = {
  fullscreen_exit: "Exited Fullscreen",
  tab_switch: "Tab / Window Switch",
  camera_off: "Camera Stream Stopped",
  loud_noise: "Ambient Noise Too Loud",
  no_face: "No Face Detected",
  multiple_faces: "Multiple Faces Detected",
  face_away: "Face Turned Away",
  bad_object: "Forbidden Object Detected",
  multiple_persons: "Multiple Persons Detected",
  shortcut_blocked: "Blocked Shortcut Action",
};

// 5 randomized MCQs per skill — small bank; will pick 5 per attempt
export interface MCQ {
  id: string;
  skill: string;
  question: string;
  options: string[];
  answer: number; // index
  explain: string;
}

export const QUESTION_BANK: MCQ[] = [
  {
    id: "py1",
    skill: "Python",
    question: "Which of the following is the correct way to create a virtual environment in Python 3?",
    options: [
      "python -m venv myenv",
      "pip install venv",
      "python create venv myenv",
      "python -m pip venv myenv",
    ],
    answer: 0,
    explain: "`python -m venv myenv` invokes the venv module to create an isolated environment.",
  },
  {
    id: "py2",
    skill: "Python",
    question: "What does the `with` statement primarily ensure?",
    options: [
      "Faster execution",
      "Automatic resource cleanup (context management)",
      "Thread locking",
      "Memory pooling",
    ],
    answer: 1,
    explain: "`with` guarantees __enter__/__exit__ are called, ensuring cleanup of resources.",
  },
  {
    id: "py3",
    skill: "Python",
    question: "Which data structure does NOT preserve insertion order (before Python 3.7)?",
    options: ["dict", "list", "set", "tuple"],
    answer: 0,
    explain: "Before 3.7, dicts did not guarantee order; from 3.7+ insertion order is preserved.",
  },
  {
    id: "sql1",
    skill: "SQL",
    question: "Which clause is used to filter rows BEFORE grouping?",
    options: ["HAVING", "WHERE", "GROUP BY", "DISTINCT"],
    answer: 1,
    explain: "WHERE filters rows pre-aggregation; HAVING filters post-aggregation.",
  },
  {
    id: "sql2",
    skill: "SQL",
    question: "What does an INNER JOIN return?",
    options: [
      "All rows from both tables",
      "Only matching rows from both tables",
      "All rows from left table",
      "Only non-matching rows",
    ],
    answer: 1,
    explain: "INNER JOIN returns only the rows where the join condition matches in both tables.",
  },
  {
    id: "sql3",
    skill: "SQL",
    question: "Which index type is best for exact-match lookups on a column?",
    options: ["B-Tree", "Hash", "GIN", "BRIN"],
    answer: 1,
    explain: "Hash indexes are optimal for equality (=) lookups; B-Tree supports range too.",
  },
  {
    id: "react1",
    skill: "React",
    question: "Which hook lets you persist a value across renders without triggering re-renders?",
    options: ["useState", "useMemo", "useRef", "useEffect"],
    answer: 2,
    explain: "useRef holds a mutable value in .current that does NOT trigger re-renders.",
  },
  {
    id: "react2",
    skill: "React",
    question: "When does useEffect with an empty dependency array run?",
    options: [
      "On every render",
      "Only once after the initial mount",
      "Never",
      "On unmount only",
    ],
    answer: 1,
    explain: "An empty deps array runs the effect once after mount (and cleanup on unmount).",
  },
  {
    id: "react3",
    skill: "React",
    question: "What is the purpose of `key` prop in a list?",
    options: [
      "Styling",
      "Help React identify which items changed",
      "Sorting",
      "Accessibility only",
    ],
    answer: 1,
    explain: "Keys help React reconcile list items efficiently across renders.",
  },
  {
    id: "node1",
    skill: "Node.js",
    question: "Which module is used to work with the file system in Node.js?",
    options: ["http", "fs", "path", "url"],
    answer: 1,
    explain: "The `fs` module provides file system APIs.",
  },
  {
    id: "node2",
    skill: "Node.js",
    question: "What is the event loop primarily responsible for?",
    options: [
      "Compiling JavaScript",
      "Handling async I/O callbacks on a single thread",
      "Managing memory allocation",
      "Networking only",
    ],
    answer: 1,
    explain: "The event loop processes async callbacks on a single thread, enabling non-blocking I/O.",
  },
  {
    id: "node3",
    skill: "Node.js",
    question: "Which is the correct way to export a function from a CommonJS module?",
    options: [
      "export function foo(){}",
      "module.exports = function foo(){}",
      "export default foo",
      "public function foo(){}",
    ],
    answer: 1,
    explain: "CommonJS uses module.exports / require(). ESM uses export.",
  },
  {
    id: "docker1",
    skill: "Docker",
    question: "What does `docker build` produce?",
    options: ["A container", "An image", "A volume", "A network"],
    answer: 1,
    explain: "`docker build` reads a Dockerfile and produces an image; containers run from images.",
  },
  {
    id: "docker2",
    skill: "Docker",
    question: "Which instruction in a Dockerfile sets the default command to run?",
    options: ["RUN", "CMD", "ENTRYPOINT", "FROM"],
    answer: 1,
    explain: "CMD sets the default command; ENTRYPOINT sets a fixed executable.",
  },
  {
    id: "aws1",
    skill: "AWS",
    question: "Which service is an object storage offering on AWS?",
    options: ["EC2", "S3", "RDS", "Lambda"],
    answer: 1,
    explain: "Amazon S3 is object storage; EC2 is compute; RDS is managed DB; Lambda is serverless.",
  },
  {
    id: "redis1",
    skill: "Redis",
    question: "Which Redis data structure is best for a leaderboard?",
    options: ["String", "Hash", "Sorted Set (ZSET)", "List"],
    answer: 2,
    explain: "Sorted Sets keep members ordered by score — ideal for leaderboards (ZADD/ZRANGE).",
  },
  {
    id: "redis2",
    skill: "Redis",
    question: "What is Redis primarily?",
    options: [
      "Relational database",
      "In-memory key-value store",
      "Message queue only",
      "File system",
    ],
    answer: 1,
    explain: "Redis is an in-memory key-value store with rich data structures.",
  },
  {
    id: "pg1",
    skill: "PostgreSQL",
    question: "Which PostgreSQL feature provides MVCC for concurrent transactions?",
    options: ["Triggers", "WAL + tuple versions", "Indexes", "Views"],
    answer: 1,
    explain: "PostgreSQL uses Multi-Version Concurrency Control via tuple versions and WAL.",
  },
  {
    id: "go1",
    skill: "Go",
    question: "How are goroutines different from OS threads?",
    options: [
      "Goroutines are heavier",
      "Goroutines are user-space, multiplexed onto threads, lighter",
      "Goroutines cannot communicate",
      "There is no difference",
    ],
    answer: 1,
    explain: "Goroutines are lightweight user-space constructs multiplexed over OS threads by the runtime.",
  },
  {
    id: "ts1",
    skill: "TypeScript",
    question: "Which type means 'no value'?",
    options: ["any", "void", "null", "undefined"],
    answer: 1,
    explain: "`void` indicates the absence of a return value; null/undefined are values.",
  },
];

export function pickQuestions(skill: string, n = 5): MCQ[] {
  const pool = QUESTION_BANK.filter((q) => q.skill === skill);
  if (pool.length === 0) {
    // fallback: return any 5
    return shuffle(QUESTION_BANK).slice(0, n);
  }
  return shuffle(pool).concat(shuffle(QUESTION_BANK)).slice(0, n);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
