import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const MCP_BETA = "mcp-client-2025-11-20";

export function buildMcpServers(authToken: string) {
  return [
    {
      type: "url" as const,
      url: process.env.DOCUSIGN_MCP_URL || "https://mcp-d.docusign.com/mcp",
      name: "docusign-navigator",
      authorization_token: authToken,
    },
  ];
}

// Per https://developers.docusign.com/platform/mcp-server/, the Docusign MCP
// server exposes exactly two Navigator tools (read-only):
//   - getAllAgreements:    list every agreement accessible to the authenticated user
//   - getAgreementDetails: full metadata + extracted provisions for one agreement by ID
// The server may also expose eSignature / Maestro tools that have write side effects;
// we keep them disabled by default and only allowlist these two.
export const NAVIGATOR_TOOL_ALLOWLIST = ["getAllAgreements", "getAgreementDetails"] as const;

export function buildMcpToolset() {
  const configs: Record<string, { enabled: boolean }> = {};
  for (const name of NAVIGATOR_TOOL_ALLOWLIST) configs[name] = { enabled: true };
  return [
    {
      type: "mcp_toolset" as const,
      mcp_server_name: "docusign-navigator",
      default_config: { enabled: false },
      configs,
    },
  ];
}
