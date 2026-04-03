export interface CredentialFieldDef {
  key: string;
  label: string;
  secret?: boolean;
  placeholder?: string;
}

export interface CredentialPreset {
  id: string;
  type_key: "llm" | "asr" | "tts";
  vendor: string;
  label: string;
  fields: CredentialFieldDef[];
}

export const CREDENTIAL_PRESETS: CredentialPreset[] = [
  {
    id: "llm-openai",
    type_key: "llm",
    vendor: "openai",
    label: "OpenAI (LLM)",
    fields: [
      { key: "api_key", label: "API key", secret: true, placeholder: "sk-…" },
      {
        key: "base_url",
        label: "Base URL",
        placeholder: "https://api.openai.com/v1",
      },
    ],
  },
  {
    id: "asr-microsoft",
    type_key: "asr",
    vendor: "microsoft",
    label: "Microsoft Azure (ASR)",
    fields: [
      { key: "key", label: "Key", secret: true },
      { key: "region", label: "Region", placeholder: "eastus" },
      { key: "language", label: "Language", placeholder: "en-US" },
    ],
  },
  {
    id: "tts-microsoft",
    type_key: "tts",
    vendor: "microsoft",
    label: "Microsoft Azure (TTS)",
    fields: [
      { key: "key", label: "Key", secret: true },
      { key: "region", label: "Region", placeholder: "eastus" },
      { key: "language", label: "Language", placeholder: "en-US" },
    ],
  },
];

export function findPreset(id: string): CredentialPreset | undefined {
  return CREDENTIAL_PRESETS.find((p) => p.id === id);
}
