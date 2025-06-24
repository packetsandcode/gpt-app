export async function sendMessageToGemini(contents: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }>) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
        });

        const data = await res.json();
        console.log("Gemini raw response:", data);

        // Return the first candidate's first text part (fallback to generic message)
        return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response text found.";
    } catch (err) {
        console.error("Error calling Gemini API:", err);
        return "Sorry, something went wrong.";
    }
}
