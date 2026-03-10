import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }

  return value;
}

const filesBaseDirRaw = requireEnv("FILES_BASE_DIR");
const filesBaseDir = path.resolve(filesBaseDirRaw);

if (!fs.existsSync(filesBaseDir)) {
  throw new Error(
    `La carpeta configurada en FILES_BASE_DIR no existe: ${filesBaseDir}`
  );
}

const draftsDirRaw = process.env.DRAFTS_DIR ?? "../../data/drafts";
const draftsDir = path.resolve(draftsDirRaw);

if (!fs.existsSync(draftsDir)) {
  fs.mkdirSync(draftsDir, { recursive: true });
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  filesBaseDir,
  draftsDir,
};