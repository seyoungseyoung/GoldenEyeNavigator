
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
const RETRY_DELAY = 1000; // 1 second

/**
 * Parses a JSON object from a string, which may be wrapped in markdown code blocks or contain other text.
 * This function is designed to be resilient to variations in AI response formatting.
 * @param content The string content to parse.
 * @returns The parsed JSON object.
 * @throws An error if a valid JSON object cannot be parsed from the content.
 */
function parseJsonFromContent(content: string): any {
    // Attempt to extract from ```json ... ``` markdown block first.
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (e) {
            console.warn("Could not parse JSON from markdown block, will try other methods.", e);
        }
    }

    // If markdown fails, try to find the first '{' and last '}'
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            const jsonString = content.substring(firstBrace, lastBrace + 1);
            return JSON.parse(jsonString);
        } catch (e) {
            console.warn("Could not parse JSON from brace-enclosed content, will try parsing the whole string.", e);
        }
    }

    // As a last resort, try to parse the entire string.
    try {
        return JSON.parse(content);
    } catch(e) {
         // If all methods fail, throw a specific, informative error.
         throw new Error(`Failed to parse JSON from AI response. Raw content: ${content}`);
    }
}


/**
 * Calls the HyperClova X API with the given messages and system prompt.
 * Implements a retry mechanism that triggers on both network errors and content parsing errors.
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
            // Step 1: Call the API
            const response = await axios.post(URL, payload, { headers });
            const messageContent = response.data.result.message.content;
            
            // Step 2: Try to parse the response. This might throw an error.
            const parsedJson = parseJsonFromContent(messageContent);
            
            // If both steps succeed, return the result.
            return parsedJson;
            
        } catch (error) {
            lastError = error;
            if (axios.isAxiosError(error)) {
                console.error(`Attempt ${attempt} - API Call Failed. Status: ${error.response?.status}`, error.response?.data);
            } else {
                 // This will catch errors from parseJsonFromContent
                console.error(`Attempt ${attempt} - Content Parsing Failed:`, error);
            }

            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }

    // If all retries fail, throw the last captured error.
    let finalErrorMessage = "Failed to get a valid response from HyperClova X API after multiple retries.";
    if (axios.isAxiosError(lastError) && lastError.response) {
        finalErrorMessage = `API Error. Status: ${lastError.response.status}. Response: ${JSON.stringify(lastError.response.data)}`;
    } else if (lastError instanceof Error) {
        finalErrorMessage = lastError.message; // This will include the "Failed to parse JSON" message
    }
    throw new Error(finalErrorMessage);
}
