export interface Memory {
  id: string;
  imageUri: string;
  commentary: string;
  createdAt: number;
  source: "OpenAI";
}

export interface LLMResponse {
  commentary: string;
  timestamp: number;
  source: "OpenAI";
}

export interface CameraPermission {
  granted: boolean;
  canAskAgain: boolean;
}
