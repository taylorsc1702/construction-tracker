export type Job = {
  id: string;
  name: string;
  site: string;
  status: "Active" | "On Hold" | "Complete";
};

export type Fault = {
  id: string;
  jobId: string;
  title: string;
  description: string;
  reportedBy: string;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
};

export type HourLog = {
  id: string;
  jobId: string;
  worker: string;
  date: string;
  hours: number;
  notes: string;
};

export type RequiredDoc = {
  id: string;
  jobId: string;
  worker: string;
  docName: string;
  status: "Pending" | "Submitted";
};

// In-memory only, by design for this trial: data resets whenever the
// container restarts or redeploys. Swap for a real database once this
// stops being just a "does the deploy work" test.
const jobs: Job[] = [
  { id: "job-1", name: "Riverside Apartments", site: "12 River St", status: "Active" },
  { id: "job-2", name: "Oak St Renovation", site: "45 Oak St", status: "Active" },
];

const faults: Fault[] = [];
const hours: HourLog[] = [];
const docs: RequiredDoc[] = [
  { id: "doc-1", jobId: "job-1", worker: "J. Smith", docName: "Site Induction Form", status: "Pending" },
  { id: "doc-2", jobId: "job-1", worker: "J. Smith", docName: "Working at Heights Certificate", status: "Pending" },
];

const nextId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export const store = { jobs, faults, hours, docs, nextId };
