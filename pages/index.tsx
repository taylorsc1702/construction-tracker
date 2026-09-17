import { useEffect, useState, useCallback } from "react";
import type { Job, Fault, HourLog, RequiredDoc } from "@/lib/store";

const ORANGE = "#d97706";

type Tab = "jobs" | "faults" | "hours" | "docs";

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16,
};
const input: React.CSSProperties = {
  padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13,
};
const button: React.CSSProperties = {
  padding: "8px 16px", background: ORANGE, color: "#fff", border: "none",
  borderRadius: 6, fontWeight: 600, fontSize: 13,
};
const th: React.CSSProperties = {
  textAlign: "left", padding: "8px 10px", fontSize: 11, textTransform: "uppercase",
  color: "#6b7280", borderBottom: "2px solid #e5e7eb",
};
const td: React.CSSProperties = { padding: "8px 10px", fontSize: 13, borderBottom: "1px solid #f0f0f0" };

export default function Home() {
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [hours, setHours] = useState<HourLog[]>([]);
  const [docs, setDocs] = useState<RequiredDoc[]>([]);

  const [jobForm, setJobForm] = useState({ name: "", site: "" });
  const [faultForm, setFaultForm] = useState({ jobId: "", title: "", description: "", reportedBy: "", severity: "Medium" });
  const [hourForm, setHourForm] = useState({ jobId: "", worker: "", date: "", hours: "", notes: "" });
  const [docForm, setDocForm] = useState({ jobId: "", worker: "", docName: "" });

  const loadAll = useCallback(async () => {
    const [j, f, h, d] = await Promise.all([
      fetch("/api/jobs").then(r => r.json()),
      fetch("/api/faults").then(r => r.json()),
      fetch("/api/hours").then(r => r.json()),
      fetch("/api/docs").then(r => r.json()),
    ]);
    setJobs(j); setFaults(f); setHours(h); setDocs(d);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const jobName = (id: string) => jobs.find(j => j.id === id)?.name ?? id;

  async function addJob(e: React.FormEvent) {
    e.preventDefault();
    if (!jobForm.name || !jobForm.site) return;
    await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(jobForm) });
    setJobForm({ name: "", site: "" });
    loadAll();
  }

  async function addFault(e: React.FormEvent) {
    e.preventDefault();
    if (!faultForm.jobId || !faultForm.title || !faultForm.reportedBy) return;
    await fetch("/api/faults", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(faultForm) });
    setFaultForm({ jobId: "", title: "", description: "", reportedBy: "", severity: "Medium" });
    loadAll();
  }

  async function addHours(e: React.FormEvent) {
    e.preventDefault();
    if (!hourForm.jobId || !hourForm.worker || !hourForm.date || !hourForm.hours) return;
    await fetch("/api/hours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hourForm) });
    setHourForm({ jobId: "", worker: "", date: "", hours: "", notes: "" });
    loadAll();
  }

  async function addDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docForm.jobId || !docForm.worker || !docForm.docName) return;
    await fetch("/api/docs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(docForm) });
    setDocForm({ jobId: "", worker: "", docName: "" });
    loadAll();
  }

  async function cycleFaultStatus(f: Fault) {
    const next = f.status === "Open" ? "In Progress" : f.status === "In Progress" ? "Resolved" : "Open";
    await fetch("/api/faults", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: f.id, status: next }) });
    loadAll();
  }

  async function toggleDocStatus(d: RequiredDoc) {
    const next = d.status === "Pending" ? "Submitted" : "Pending";
    await fetch("/api/docs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id, status: next }) });
    loadAll();
  }

  const jobOptions = (value: string, onChange: (v: string) => void) => (
    <select style={input} value={value} onChange={e => onChange(e.target.value)} required>
      <option value="">Select job…</option>
      {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
    </select>
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>🏗️ Construction Tracker</h1>
      <p style={{ color: "#6b7280", fontSize: 13, marginTop: 0, marginBottom: 20 }}>
        Faults, hours, jobs and required documents — in-memory demo, data resets on restart.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["jobs", "faults", "hours", "docs"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...button, background: tab === t ? ORANGE : "#fff", color: tab === t ? "#fff" : "#374151",
            border: tab === t ? "none" : "1px solid #d1d5db",
          }}>
            {t === "jobs" ? "Jobs" : t === "faults" ? "Faults" : t === "hours" ? "Hours" : "Required Docs"}
          </button>
        ))}
      </div>

      {tab === "jobs" && (
        <div style={card}>
          <form onSubmit={addJob} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <input style={input} placeholder="Job name" value={jobForm.name} onChange={e => setJobForm({ ...jobForm, name: e.target.value })} required />
            <input style={input} placeholder="Site address" value={jobForm.site} onChange={e => setJobForm({ ...jobForm, site: e.target.value })} required />
            <button style={button} type="submit">Add Job</button>
          </form>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Name</th><th style={th}>Site</th><th style={th}>Status</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}><td style={td}>{j.name}</td><td style={td}>{j.site}</td><td style={td}>{j.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "faults" && (
        <div style={card}>
          <form onSubmit={addFault} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {jobOptions(faultForm.jobId, v => setFaultForm({ ...faultForm, jobId: v }))}
            <input style={input} placeholder="Fault title" value={faultForm.title} onChange={e => setFaultForm({ ...faultForm, title: e.target.value })} required />
            <input style={input} placeholder="Description" value={faultForm.description} onChange={e => setFaultForm({ ...faultForm, description: e.target.value })} />
            <input style={input} placeholder="Reported by" value={faultForm.reportedBy} onChange={e => setFaultForm({ ...faultForm, reportedBy: e.target.value })} required />
            <select style={input} value={faultForm.severity} onChange={e => setFaultForm({ ...faultForm, severity: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <button style={button} type="submit">Report Fault</button>
          </form>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Job</th><th style={th}>Title</th><th style={th}>Reported By</th><th style={th}>Severity</th><th style={th}>Status</th></tr></thead>
            <tbody>
              {faults.map(f => (
                <tr key={f.id}>
                  <td style={td}>{jobName(f.jobId)}</td>
                  <td style={td}>{f.title}</td>
                  <td style={td}>{f.reportedBy}</td>
                  <td style={td}>{f.severity}</td>
                  <td style={td}>
                    <button style={{ ...button, padding: "4px 10px", fontSize: 11 }} onClick={() => cycleFaultStatus(f)}>{f.status}</button>
                  </td>
                </tr>
              ))}
              {!faults.length && <tr><td style={td} colSpan={5}>No faults reported yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "hours" && (
        <div style={card}>
          <form onSubmit={addHours} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {jobOptions(hourForm.jobId, v => setHourForm({ ...hourForm, jobId: v }))}
            <input style={input} placeholder="Worker name" value={hourForm.worker} onChange={e => setHourForm({ ...hourForm, worker: e.target.value })} required />
            <input style={input} type="date" value={hourForm.date} onChange={e => setHourForm({ ...hourForm, date: e.target.value })} required />
            <input style={input} type="number" step="0.5" placeholder="Hours" value={hourForm.hours} onChange={e => setHourForm({ ...hourForm, hours: e.target.value })} required />
            <input style={input} placeholder="Notes" value={hourForm.notes} onChange={e => setHourForm({ ...hourForm, notes: e.target.value })} />
            <button style={button} type="submit">Log Hours</button>
          </form>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Job</th><th style={th}>Worker</th><th style={th}>Date</th><th style={th}>Hours</th><th style={th}>Notes</th></tr></thead>
            <tbody>
              {hours.map(h => (
                <tr key={h.id}>
                  <td style={td}>{jobName(h.jobId)}</td><td style={td}>{h.worker}</td><td style={td}>{h.date}</td>
                  <td style={td}>{h.hours}</td><td style={td}>{h.notes}</td>
                </tr>
              ))}
              {!hours.length && <tr><td style={td} colSpan={5}>No hours logged yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "docs" && (
        <div style={card}>
          <form onSubmit={addDoc} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {jobOptions(docForm.jobId, v => setDocForm({ ...docForm, jobId: v }))}
            <input style={input} placeholder="Worker name" value={docForm.worker} onChange={e => setDocForm({ ...docForm, worker: e.target.value })} required />
            <input style={input} placeholder="Document name" value={docForm.docName} onChange={e => setDocForm({ ...docForm, docName: e.target.value })} required />
            <button style={button} type="submit">Add Requirement</button>
          </form>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Job</th><th style={th}>Worker</th><th style={th}>Document</th><th style={th}>Status</th></tr></thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id}>
                  <td style={td}>{jobName(d.jobId)}</td><td style={td}>{d.worker}</td><td style={td}>{d.docName}</td>
                  <td style={td}>
                    <button style={{ ...button, padding: "4px 10px", fontSize: 11, background: d.status === "Submitted" ? "#16a34a" : ORANGE }} onClick={() => toggleDocStatus(d)}>
                      {d.status}
                    </button>
                  </td>
                </tr>
              ))}
              {!docs.length && <tr><td style={td} colSpan={4}>No document requirements yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
