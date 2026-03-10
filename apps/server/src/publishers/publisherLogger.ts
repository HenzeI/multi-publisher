import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";

function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function writeDebugText(
  portal: string,
  prefix: string,
  content: string
): Promise<string> {
  const filePath = path.join(env.debugDir, `${nowStamp()}-${portal}-${prefix}.txt`);
  await fs.writeFile(filePath, content, "utf-8");
  return filePath;
}

export function logStep(portal: string, message: string): void {
  console.log(`[${portal}] ${message}`);
}