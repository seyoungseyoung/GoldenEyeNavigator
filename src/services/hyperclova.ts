
import axios from 'axios';

const API_KEY = process.env.HYPERCLOVA_API_KEY;
const REQUEST_ID = process.env.HYPERCLOVA_REQUEST_ID;
const MODEL = "HCX-003";
const URL = `https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/${MODEL}`;

if (!API_KEY || !REQUEST_ID) {
    throw new Error("HyperClova API Key or Request ID is not defined in .env");
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

/**
 * Calls the HyperClova X API with the given messages and system prompt.
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

    try {
        const response = await axios.post(URL, payload, { headers });
        const result = response.data;
        let messageContent = result.result.message.content;
        
        // AI가 JSON 외에 다른 텍스트를 포함하여 응답하는 경우가 있으므로,
        // 응답에서 JSON 객체만 추출합니다.
        try {
            const jsonStart = messageContent.indexOf('{');
            const jsonEnd = messageContent.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                messageContent = messageContent.substring(jsonStart, jsonEnd + 1);
                return JSON.parse(messageContent);
            } else {
                // JSON 객체를 찾지 못하면 원래 내용을 파싱 시도
                return JSON.parse(messageContent);
            }
        } catch (e) {
            // 파싱에 실패하면 원본 내용을 반환 (오류 처리는 호출 측에서)
            console.error("Failed to parse JSON from HyperClova X response, returning raw content.", messageContent);
            return messageContent; 
        }

    } catch (error) {
        console.error("Error calling HyperClova X API:", error);
        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
        }
        throw new Error("Failed to get response from HyperClova X API.");
    }
}
