const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const { handleLLMResponse } = require('./lib/llm');
const { generateVoice } = require('./lib/elevenlabs');
const epochRoutes = require('./api/epochRoutes');

const app = express();

// Enable CORS for all routes (important for cross-origin frontend requests)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Body-parser limit increased for large Base64 images
app.use(express.json({ limit: '50mb' }));

// Mount the epochs routes at /api/epochs
app.use('/api/epochs', epochRoutes);

// Initialize Gemini AI engine with fallback support
const apiKey = process.env.GEMINI_API_KEY || process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Streaming Chat API (SSE) used by CuratorChat
app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { message, imageBase64 } = req.body;

    if (genAI) {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are 'The Curator', an advanced AI managing a luxury digital museum. 
        YOUR DIRECTIVES:
        1. You must ONLY answer questions related to world history, historical artifacts, ancient civilizations, and historical figures.
        2. If a user uploads an image, analyze it purely from a historical or archaeological perspective.
        3. If a user asks about coding, math, modern pop culture, or anything unrelated to history, you MUST politely decline and state: "My protocol restricts me to the global historical archives. I cannot assist with that inquiry."
        4. Keep your tone professional, immersive, and slightly mysterious.`
      });

      const parts = [message];
      if (imageBase64) {
        const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          parts.push({
            inlineData: {
              data: matches[2],
              mimeType: matches[1]
            }
          });
        }
      }

      const result = await model.generateContentStream(parts);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    } else {
      // Fallback in case of no API key
      const mockText = "As The Curator, I welcome your inquiry. However, the connection to the AI engine is currently running in offline mode. Let me share a historical whisper: Rome was not built in a day.";
      const words = mockText.split(" ");
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + " " })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error("AI Streaming Error:", error);
    res.write(`data: ${JSON.stringify({ text: "\n\n[Failed to sync with AI engine.]" })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// Setup HTTP server and Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Curator HUD client connected: ${socket.id}`);

  socket.on('request_curation', async (data) => {
    try {
      const message = data.message;
      console.log(`Curation request received: "${message}"`);
      
      // 1. Get text response from LLM (using handleLLMResponse)
      const reply = await handleLLMResponse(message);
      
      // 2. Try to get voice audio from ElevenLabs (using generateVoice)
      let audioData = null;
      try {
        if (process.env.ELEVENLABS_API_KEY) {
          audioData = await generateVoice(reply);
        }
      } catch (voiceError) {
        console.error("ElevenLabs Voice Generation Error:", voiceError.message);
      }

      // 3. Emit response back to client
      socket.emit('ai_response', {
        text: reply,
        audioData: audioData
      });
    } catch (error) {
      console.error("Socket Curation Error:", error.message);
      socket.emit('ai_response', {
        text: "My archives are temporarily inaccessible. Let us observe the quiet of history.",
        audioData: null
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Curator HUD client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Mythos Archive server running on port ${PORT}`);
});