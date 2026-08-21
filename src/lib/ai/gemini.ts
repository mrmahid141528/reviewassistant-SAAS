import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

const getAIClient = () => {
    if (!_genAI && process.env.GEMINI_API_KEY) {
        _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return _genAI;
}

export async function generateReviewDraft(
    businessName: string,
    rating: number,
    userInputs?: { question: string, answer: string }[],
    tone: string = "Friendly, professional, and authentic",
    language: string = "English"
): Promise<string> {
    const client = getAIClient();

    if (!client) {
        throw new Error("GEMINI_API_KEY configuration is missing on the server.");
    }

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    let inputsContext = "";
    if (userInputs && userInputs.length > 0) {
        inputsContext = userInputs.map(input => `- Question: ${input.question}\n  Answer: ${input.answer}`).join("\n");
    }

    const prompt = `
    You are an AI assistant helping a customer write a Google Review for a local business named "${businessName}".
    The customer gave a rating of ${rating} out of 5 stars.
    Their specific feedback is below (if any):
    ${inputsContext || "No additional specific feedback provided."}
    
    Task: Draft a highly authentic, natural-sounding Google review from the customer's perspective. It must sound like a real person wrote it.
    
    Constraints:
    - Tone: ${tone}
    - Output Language: ${language}
    - Length: Extremely concise (2 to 4 sentences maximum).
    - Exclude: Do not include quotes, greetings, placeholders, or any conversational meta-commentary like "Here is your review". 
    - Output ONLY the raw text of the review.
  `;

    // We are using `generateContent` specifically, without structured JSON here since we only want text.
    const result = await model.generateContent(prompt);
    return result.response.text();
}
