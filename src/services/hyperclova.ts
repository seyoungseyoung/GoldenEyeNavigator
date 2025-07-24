
import axios from 'axios';

// 환경 변수를 함수 호출 시점에 읽도록 변경하여 로딩 문제를 해결합니다.

const MODEL = "HCX-003";
const URL = `https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/${MODEL}`;

export interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Parses a JSON object from a string, which may be wrapped in markdown code blocks or contain other text.
 * This function is designed to be resilient to variations in AI response formatting.
 * @param content The string content to parse.
 * @returns The parsed JSON object or null if parsing fails.
 */
function parseJsonFromContent(content: string): any {
    console.log("[DEBUG] Raw content for parsing:", content);
    try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            console.log("[DEBUG] Found JSON in markdown block.");
            return JSON.parse(jsonMatch[1]);
        }
    } catch (e) {
        console.warn("[DEBUG] Failed to parse JSON from markdown block:", e);
    }

    try {
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            const jsonString = content.substring(firstBrace, lastBrace + 1);
            console.log("[DEBUG] Found brace-enclosed string. Attempting to parse.");
            return JSON.parse(jsonString);
        }
    } catch (e) {
        console.warn("[DEBUG] Failed to parse JSON from brace-enclosed content:", e);
    }
    
    // AI가 순수 텍스트만 반환한 경우를 대비
    if (!content.trim().startsWith('{')) {
        return null;
    }

    // 최후의 수단으로 전체를 파싱 시도
    try {
        return JSON.parse(content);
    } catch(e) {
        console.warn("[DEBUG] Final attempt to parse entire content as JSON failed.", e);
    }

    return null;
}


/**
 * Calls the HyperClova X API with the given messages and system prompt.
 * Implements a retry mechanism that triggers on both network errors and content parsing errors.
 * @param messages An array of messages to send to the model.
 * @param systemPrompt The system prompt to guide the model's behavior.
 * @param jsonOutputFormat The key to wrap the plain text response in if the AI doesn't return JSON. e.g., "answer".
 * @returns The content of the assistant's response as a JSON object.
 */
export async function callHyperClovaX(messages: Message[], systemPrompt: string, jsonOutputFormat?: string): Promise<any> {
    // 함수 호출 시점에서 환경 변수를 읽어옵니다.
    const API_KEY = process.env.HYPERCLOVA_API_KEY?.trim();
    const REQUEST_ID = process.env.HYPERCLOVA_REQUEST_ID?.trim();

    if (!API_KEY || !REQUEST_ID) {
        throw new Error("HyperClova API Key or Request ID is not defined in .env. Please check your .env file.");
    }

    const headers = {
        "Authorization": `Bearer ${API_KEY}`,
        "X-NCP-CLOVASTUDIO-REQUEST-ID": REQUEST_ID,
        "Content-Type": "application/json",
    };
    
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
        console.log(`[DEBUG] HyperClova X API Call - Attempt ${attempt}/${MAX_RETRIES}`);
        try {
            // Step 1: Call the API
            const response = await axios.post(URL, payload, { headers });

            if (!response.data || !response.data.result || !response.data.result.message || !response.data.result.message.content) {
                lastError = new Error("Invalid API response structure from HyperClova X.");
                console.error(`[DEBUG] Attempt ${attempt} failed: ${lastError.message}`, response.data);
                continue; // 재시도
            }

            const messageContent = response.data.result.message.content;
            
            // Step 2: Try to parse the response as JSON.
            const parsedJson = parseJsonFromContent(messageContent);
            
            if (parsedJson) {
                console.log("[DEBUG] Successfully parsed JSON from AI response.");
                return parsedJson;
            }

            // Step 3: If no JSON is found, and a jsonOutputFormat key is provided,
            // assume the response is plain text and wrap it.
            if (jsonOutputFormat) {
                console.log(`[DEBUG] Attempt ${attempt} - Received plain text. Wrapping with key "${jsonOutputFormat}".`);
                return { [jsonOutputFormat]: messageContent.trim() };
            }

            // Step 4: If no JSON is found and no format key is provided, it's an invalid state.
            // We consider this a failure and will trigger a retry.
            lastError = new Error(`AI returned a non-JSON response, and no output format was specified. Raw content: ${messageContent}`);
            console.error(`[DEBUG] Attempt ${attempt} failed: ${lastError.message}`);

        } catch (error) {
            lastError = error;
            if (axios.isAxiosError(error)) {
                console.error(`[DEBUG] Attempt ${attempt} - API Call Failed. Status: ${error.response?.status}`, error.response?.data);
            } else {
                console.error(`[DEBUG] Attempt ${attempt} - An unexpected error occurred:`, error);
            }
        }

        if (attempt < MAX_RETRIES) {
            console.log(`[DEBUG] Retrying in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }

    // If all retries fail, throw the last captured error.
    let finalErrorMessage = "Failed to get a valid response from HyperClova X API after multiple retries.";
    if (axios.isAxiosError(lastError) && lastError.response) {
        finalErrorMessage = `API Error. Status: ${lastError.response.status}. Response: ${JSON.stringify(lastError.response.data)}`;
    } else if (lastError instanceof Error) {
        finalErrorMessage = lastError.message;
    }
    throw new Error(finalErrorMessage);
}
