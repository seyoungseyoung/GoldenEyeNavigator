import fs from 'fs/promises';
import path from 'path';

type Subscription = {
    email: string;
    ticker: string;
    tradingStrategy?: string;
};

// Path to the JSON file that will act as a simple database.
const subscriptionsFilePath = path.resolve(process.cwd(), 'src', 'data', 'subscriptions.json');

/**
 * Ensures the subscription file exists.
 */
async function ensureFileExists() {
    try {
        await fs.access(subscriptionsFilePath);
    } catch {
        await fs.writeFile(subscriptionsFilePath, JSON.stringify([], null, 2));
    }
}

/**
 * Reads all subscriptions from the JSON file.
 * @returns A promise that resolves to an array of subscriptions.
 */
export async function getAllSubscriptions(): Promise<Subscription[]> {
    await ensureFileExists();
    const data = await fs.readFile(subscriptionsFilePath, 'utf-8');
    return JSON.parse(data);
}

/**
 * Adds a new subscription to the JSON file.
 * Prevents duplicate subscriptions for the same email and ticker.
 * @param newSubscription The subscription to add.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addSubscription(newSubscription: Subscription): Promise<void> {
    const subscriptions = await getAllSubscriptions();

    const exists = subscriptions.some(
        sub => sub.email === newSubscription.email && sub.ticker.toUpperCase() === newSubscription.ticker.toUpperCase()
    );

    if (exists) {
        throw new Error('이미 해당 종목에 대해 구독하고 있습니다.');
    }

    subscriptions.push(newSubscription);
    await fs.writeFile(subscriptionsFilePath, JSON.stringify(subscriptions, null, 2));
}

/**
 * Removes a subscription from the JSON file.
 * @param email The email of the subscriber.
 * @param ticker The ticker to unsubscribe from.
 * @returns A promise that resolves when the operation is complete.
 */
export async function removeSubscription(email: string, ticker: string): Promise<void> {
    let subscriptions = await getAllSubscriptions();
    
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter(
        sub => !(sub.email === email && sub.ticker.toUpperCase() === ticker.toUpperCase())
    );

    if (subscriptions.length === initialLength) {
        throw new Error('해당 구독 정보를 찾을 수 없습니다.');
    }

    await fs.writeFile(subscriptionsFilePath, JSON.stringify(subscriptions, null, 2));
}
