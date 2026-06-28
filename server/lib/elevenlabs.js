const axios = require('axios');

async function generateVoice(text) {
	try {
		// Using Antoni voice ID (deep, authoritative)
		const voiceId = 'ErXwobaYiN019PkySvjV'; 
		const response = await axios.post(
			`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
			{
				text: text,
				model_id: "eleven_monolingual_v1",
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.5
				}
			},
			{
				headers: {
					'Accept': 'audio/mpeg',
					'xi-api-key': process.env.ELEVENLABS_API_KEY,
					'Content-Type': 'application/json'
				},
				responseType: 'arraybuffer'
			}
		);
		return response.data;
	} catch (error) {
		console.error("ElevenLabs API Error:", error.response?.data || error.message);
		throw error;
	}
}

module.exports = { generateVoice };
