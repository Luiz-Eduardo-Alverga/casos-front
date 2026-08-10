export interface ReleaseNotesData {
  registro_liberacao: string;
  produto: string;
  versoes: string[];
  total_casos: number;
}

export interface ReleaseNotesResponse {
  success: boolean;
  data?: ReleaseNotesData;
  error?: string;
  message?: string;
  processedIn?: string;
}

export interface ReleaseNotesProgressEvent {
  step: number;
  totalSteps: number;
  stepId: string;
  percent: number;
  title: string;
  detail: string;
  totalCasos?: number;
}

export interface ReleaseNotesDoneEvent {
  success: boolean;
  data?: ReleaseNotesData;
  error?: string;
  message?: string;
  processedIn?: string;
}

export interface ReleaseNotesDeltaEvent {
  chunk: string;
}

export interface ReleaseNotesStreamErrorEvent {
  error?: string;
  message?: string;
}
