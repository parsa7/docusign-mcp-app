export type IntentRoute = {
  model: string;
  expandPrompt?: string;
};

const SLASH_COMMANDS = /^\/(review-contract|triage-nda|vendor-check)\b\s*(.*)$/i;

export function pickRoute(latestUserMessage: string): IntentRoute {
  const defaultModel = process.env.DEFAULT_MODEL || "claude-sonnet-4-6";
  const heavyModel = process.env.HEAVY_MODEL || "claude-opus-4-7";

  const m = latestUserMessage.trim().match(SLASH_COMMANDS);
  if (m) {
    const cmd = m[1].toLowerCase();
    const arg = m[2].trim();
    let directive = "";
    if (cmd === "review-contract") {
      directive = `Apply the review-contract skill to the agreement identified by: "${arg || "(none — ask the user to specify)"}". Workflow: call getAllAgreements once to find the matching agreement by name/party, then call getAgreementDetails with its ID for the full content. Then perform a clause-by-clause review per the skill file. Output red/yellow/green flags with redline suggestions and prioritized concerns.`;
    } else if (cmd === "triage-nda") {
      directive = `Apply the triage-nda skill to the NDA identified by: "${arg || "(none — ask the user to specify)"}". Workflow: call getAllAgreements to find the matching NDA, then getAgreementDetails for its full text. Classify as standard-approval / counsel-review / full-review per the skill file. Justify the classification.`;
    } else if (cmd === "vendor-check") {
      directive = `Apply the vendor-check workflow for vendor: "${arg || "(none — ask the user to specify)"}". Call getAllAgreements once and filter the results by party name. Report: count, agreement types, expiration dates, total contract value (where extractable), and any compliance flags.`;
    }
    return { model: heavyModel, expandPrompt: directive };
  }

  return { model: defaultModel };
}
