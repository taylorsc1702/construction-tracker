import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(store.faults);
  }

  if (req.method === "POST") {
    const { jobId, title, description, reportedBy, severity } = req.body as {
      jobId?: string; title?: string; description?: string; reportedBy?: string; severity?: string;
    };
    if (!jobId || !title || !reportedBy) {
      return res.status(400).json({ error: "jobId, title and reportedBy are required" });
    }
    const fault = {
      id: store.nextId("fault"),
      jobId,
      title,
      description: description || "",
      reportedBy,
      severity: (severity as "Low" | "Medium" | "High") || "Medium",
      status: "Open" as const,
      createdAt: new Date().toISOString(),
    };
    store.faults.push(fault);
    return res.status(201).json(fault);
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body as { id?: string; status?: string };
    const fault = store.faults.find(f => f.id === id);
    if (!fault) return res.status(404).json({ error: "not found" });
    fault.status = (status as "Open" | "In Progress" | "Resolved") || fault.status;
    return res.status(200).json(fault);
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  res.status(405).end();
}
