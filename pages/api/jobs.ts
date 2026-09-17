import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(store.jobs);
  }

  if (req.method === "POST") {
    const { name, site } = req.body as { name?: string; site?: string };
    if (!name || !site) return res.status(400).json({ error: "name and site are required" });
    const job = { id: store.nextId("job"), name, site, status: "Active" as const };
    store.jobs.push(job);
    return res.status(201).json(job);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
