import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(store.docs);
  }

  if (req.method === "POST") {
    const { jobId, worker, docName } = req.body as { jobId?: string; worker?: string; docName?: string };
    if (!jobId || !worker || !docName) {
      return res.status(400).json({ error: "jobId, worker and docName are required" });
    }
    const doc = { id: store.nextId("doc"), jobId, worker, docName, status: "Pending" as const };
    store.docs.push(doc);
    return res.status(201).json(doc);
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body as { id?: string; status?: string };
    const doc = store.docs.find(d => d.id === id);
    if (!doc) return res.status(404).json({ error: "not found" });
    doc.status = (status as "Pending" | "Submitted") || doc.status;
    return res.status(200).json(doc);
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  res.status(405).end();
}
