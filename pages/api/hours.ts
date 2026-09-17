import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(store.hours);
  }

  if (req.method === "POST") {
    const { jobId, worker, date, hours, notes } = req.body as {
      jobId?: string; worker?: string; date?: string; hours?: number; notes?: string;
    };
    if (!jobId || !worker || !date || !hours) {
      return res.status(400).json({ error: "jobId, worker, date and hours are required" });
    }
    const entry = {
      id: store.nextId("hours"),
      jobId,
      worker,
      date,
      hours: Number(hours),
      notes: notes || "",
    };
    store.hours.push(entry);
    return res.status(201).json(entry);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
