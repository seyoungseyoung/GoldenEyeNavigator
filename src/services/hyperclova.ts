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
        stream: false, // Not using streaming for this implementation
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
        const messageContent = result.result.message.content;
        
        // The response is often a JSON string within a string, so we need to parse it.
        try {
            return JSON.parse(messageContent);
        } catch (e) {
            // If it's not a JSON string, return as is.
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
