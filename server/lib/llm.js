const axios = require('axios');

async function handleLLMResponse(userMessage) {
	try {
		const systemInstruction = "You are the Curator of the Mythos Archive, a highly advanced digital museum. Your tone is authoritative, poetic, and concise. You MUST enthusiastically answer any question related to global history, ancient civilizations, mythology, archaeology, or ancient artifacts.\n\nHowever, if a question is explicitly about modern post-1900 politics, computer programming, pop culture, or non-historical topics, you must elegantly deflect by saying: 'My archives contain only the echoes of antiquity. Ask me of the past, and I shall answer.' Keep all responses under 3 sentences.";
		
		const response = await axios.post(
			'https://integrate.api.nvidia.com/v1/chat/completions',
			{
				model: 'meta/llama-3.1-8b-instruct',
				messages: [
					{ role: 'system', content: systemInstruction },
					{ role: 'user', content: userMessage || "Who are you and what is this place?" }
				],
				temperature: 0.7,
				max_tokens: 150
			},
			{
				headers: {
					'Authorization': `Bearer ${process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);

		return response.data.choices[0].message.content;
	} catch (error) {
		console.error("LLM Error:", error.response?.data || error.message);
		throw error;
	}
}

module.exports = { handleLLMResponse };
