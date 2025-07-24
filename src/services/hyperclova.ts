
import axios from 'axios';

//환경 변수를 읽을 때 trim()을 사용하여 앞뒤 공백 및 줄바꿈 문자를 제거합니다.
const API_KEY = process.env.HYPERCLOVA_API_KEY?.trim();
const REQUEST_ID = process.env.HYPERCLOVA_REQUEST_ID?.trim();
const MODEL = "HCX-003";
const URL = `https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/${MODEL}`;

if (!API_KEY || !REQUEST_ID) {
    throw new Error("HyperClova API Key or Request ID is not defined in .env. Please check your .env file.");
}

const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "X-NCP-CLOVASTUDIO-REQUEST-ID": REQUEST_ID,
    "Content-Type": "application/json",
};

export interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // 500ms

/**
 * Calls the HyperClova X API with the given messages and system prompt.
 * Implements a retry mechanism to handle transient errors.
 * @param messages An array of messages to send to the model.
 * @param systemPrompt The system prompt to guide the model's behavior.
 * @returns The content of the assistant's response.
 */
export async function callHyperClovaX(messages: Message[], systemPrompt: string): Promise<any> {
    const payload = {
        stream: false,
        topK: 0,
        includeAiFilters: true,
        maxTokens: 4096,
        temperature: 0.6,
        repeatPenalty: 5.0,
        topP: 0.8,
        stopBefore: [],
        messages: [
            { role: "system", content: systemPrompt },
            ...messages
        ],
    };

    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(URL, payload, { headers });
            const result = response.data;
            let messageContent = result.result.message.content;
            
            // AI가 JSON 외에 다른 텍스트를 포함하여 응답하는 경우가 있으므로,
            // 응답에서 JSON 객체만 안정적으로 추출합니다.
            try {
                // Check if the response is wrapped in markdown code blocks
                if (messageContent.includes('```json')) {
                    const jsonMatch = messageContent.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch && jsonMatch[1]) {
                        messageContent = jsonMatch[1];
                    }
                }
                // Fallback to finding the first and last brace
                const jsonStart = messageContent.indexOf('{');
                const jsonEnd = messageContent.lastIndexOf('}');

                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    const jsonString = messageContent.substring(jsonStart, jsonEnd + 1);
                    return JSON.parse(jsonString);
                } else {
                    // If no clear JSON object is found, try to parse the whole thing
                    return JSON.parse(messageContent);
                }
            } catch (e) {
                console.error("Failed to parse JSON from HyperClova X response. Raw content:", messageContent);
                // JSON 파싱 실패는 재시도하지 않고 즉시 에러를 던집니다.
                throw new Error(`Failed to parse JSON from AI response. Raw content: ${messageContent}`);
            }
        // This catch block handles network errors or API server errors (e.g., 5xx)
        } catch (error) {
            lastError = error; // Store the last error
            if (axios.isAxiosError(error)) {
                // JSON 파싱 에러는 위에서 잡히므로 여기서는 주로 네트워크/서버 에러입니다.
                console.error(`Attempt ${attempt} failed for HyperClova X API call. Status: ${error.response?.status}`, error.response?.data);
            } else {
                console.error(`Attempt ${attempt} failed for HyperClova X API call:`, error);
            }


            if (attempt === MAX_RETRIES) {
                // 마지막 시도에서도 실패하면 최종적으로 에러를 던집니다.
                let errorMessage = "Failed to get response from HyperClova X API after multiple retries.";
                if (axios.isAxiosError(lastError) && lastError.response) {
                    // 서버가 제공한 구체적인 에러 메시지를 포함합니다.
                    errorMessage = `Failed to get response from HyperClova X API. Status: ${lastError.response.status}. Response: ${JSON.stringify(lastError.response.data)}`;
                } else if (lastError instanceof Error) {
                    errorMessage = lastError.message;
                }
                throw new Error(errorMessage);
            }
            // 재시도 전에 잠시 대기합니다.
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
    // 루프가 비정상적으로 종료될 경우를 대비한 최종 에러 처리
    throw new Error("Failed to get response from HyperClova X API.");
}
