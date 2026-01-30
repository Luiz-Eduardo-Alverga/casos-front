import { apiAssistant } from "@/lib/axios";

interface AssistantParams {
    description: string;
}

interface AssistantResponse {
    success: boolean;
    data: {
        title: string;
        description: string;
        category: string;
        additionalInformation: string;
    };
}

interface HealthResponse {
    status: string;
    timestamp: string;
}

export async function checkAssistantHealth(): Promise<HealthResponse> {
    try {
        const response = await apiAssistant.get<HealthResponse>('/health');
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
}

export async function assistant({ description }: AssistantParams) {
    
    const response = await apiAssistant.post<AssistantResponse>('/api/assistant', {
        description
    });

    return response.data;
}
