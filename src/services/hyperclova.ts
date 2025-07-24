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
 * Parses a JSON object from a string, which may be wrapped in markdown code blocks.
 * @param content The string content to parse.
 * @returns The parsed JSON object.
 */
function parseJsonFromContent(content: string): any {
    // Attempt to find JSON within ```json ... ```
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (e) {
            console.error("Failed to parse JSON from markdown block, falling back.", e);
        }
    }

    // Fallback to finding the first and last brace if no markdown block is found or parsing fails
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            const jsonString = content.substring(firstBrace, lastBrace + 1);
            return JSON.parse(jsonString);
        } catch (e) {
             console.error("Failed to parse JSON from content between braces, falling back.", e);
        }
    }
    
    // As a last resort, try parsing the whole string directly
    try {
        return JSON.parse(content);
    } catch(e) {
        console.error("Failed to parse JSON from the entire content string.", e);
        throw new Error(`Failed to parse JSON from AI response. Raw content: ${content}`);
    }
}


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
        maxTokens: 2048,
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
            const messageContent = result.result.message.content;
            
            return parseJsonFromContent(messageContent);
            
        // This catch block handles network errors or API server errors (e.g., 5xx)
        } catch (error) {
            lastError = error; // Store the last error
            if (axios.isAxiosError(error)) {
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
