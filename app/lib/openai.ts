// openai.ts
export async function sendMessageToOpenAI(message: string) {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!res.ok) {
        const errorDetails = await res.text();
        throw new Error(`API route error: ${res.status} - ${errorDetails}`);
    }

    const data = await res.json();
    return data.response;
}
