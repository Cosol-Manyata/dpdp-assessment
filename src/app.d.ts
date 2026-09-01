declare global {
  interface Window {
    DPDPA?: Record<string, unknown>;
    DPDPA_INTRO_CONFIG?: {
      enabled?: boolean;
      durationMs?: number;
      deadline?: string;
      deadlineLabel?: string;
      allowSkip?: boolean;
    };
    DPDPA_STORAGE_KEY?: string;
  }
}

export {};
