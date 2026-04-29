#!/usr/bin/env -S node --experimental-strip-types
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SKILLS_DIR = join(ROOT, "lib", "skills");
const NOTICES = join(ROOT, "THIRD_PARTY_NOTICES.md");

const REPO = "anthropics/knowledge-work-plugins";
const PIN = process.env.SKILLS_PIN_SHA || "main";

const SKILLS = [
  { dir: "review-contract", out: "review-contract.md" },
  { dir: "triage-nda", out: "triage-nda.md" },
  { dir: "compliance-check", out: "compliance-check.md" },
] as const;

async function fetchOne(skillDir: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO}/${PIN}/legal/skills/${skillDir}/SKILL.md`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return await res.text();
}

async function main() {
  await mkdir(SKILLS_DIR, { recursive: true });
  for (const s of SKILLS) {
    const text = await fetchOne(s.dir);
    const dest = join(SKILLS_DIR, s.out);
    await writeFile(dest, text, "utf-8");
    console.log(`vendored ${s.dir} -> lib/skills/${s.out} (${text.length} bytes)`);
  }
  await writeFile(
    NOTICES,
    [
      "# Third-Party Notices",
      "",
      "This project vendors files from the following open-source projects.",
      "",
      "## anthropics/knowledge-work-plugins",
      "",
      `- Source: https://github.com/${REPO}`,
      `- Pinned ref: \`${PIN}\``,
      "- License: Apache License, Version 2.0",
      "- Vendored files (under `lib/skills/`):",
      ...SKILLS.map((s) => `  - \`${s.out}\` (from \`legal/skills/${s.dir}/SKILL.md\`)`),
      "",
      "See https://www.apache.org/licenses/LICENSE-2.0 for the full license text.",
      "",
    ].join("\n"),
    "utf-8",
  );
  console.log(`wrote ${NOTICES}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
