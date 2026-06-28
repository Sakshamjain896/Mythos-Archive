const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateRomanEpochs() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Generate a JSON array containing exactly 3 major epochs of Roman history.
Each epoch object MUST have the following string fields:
- "id": A unique identifier (e.g., "rome-01", "rome-02", "rome-03").
- "subtitle": The time period or year (e.g., "753 BC", "44 BC", "117 AD").
- "title": A short, catchy title of the epoch (e.g., "The Founding Myth", "The Ides of March").
- "description": A descriptive paragraph (2-3 sentences) detailing the significance of this epoch in Roman history.

Return ONLY the raw JSON array. Do not include markdown code block formatting (such as \`\`\`json) or any other conversational text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  // Clean JSON formatting if Gemini adds code fences
  const cleanJsonText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  
  return JSON.parse(cleanJsonText);
}

module.exports = { generateRomanEpochs };