import api from "@/lib/axios";

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

export async function assistant({ description }: AssistantParams) {
    const assistantApiUrl = process.env.NEXT_PUBLIC_ASSISTANT_API_URL;

    if (!assistantApiUrl) {
        throw new Error("NEXT_PUBLIC_ASSISTANT_AP_IURL is not set");
    }
    
    const response = await api.post<AssistantResponse>(assistantApiUrl, {
        description
    });

    return response.data;
}
