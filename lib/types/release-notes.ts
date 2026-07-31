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
