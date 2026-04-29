import { readFileSync } from "node:fs";
import { join } from "node:path";

const HERE = join(process.cwd(), "lib", "skills");

function read(name: string): string {
  return readFileSync(join(HERE, name), "utf-8");
}

export const REVIEW_CONTRACT_SKILL = read("review-contract.md");
export const TRIAGE_NDA_SKILL = read("triage-nda.md");
export const COMPLIANCE_CHECK_SKILL = read("compliance-check.md");
