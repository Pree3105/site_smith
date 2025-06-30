
require("dotenv").config({path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
// const Groq = require("groq-sdk");
const { BASE_PROMPT, getSystemPrompt }=require( "./prompts");
const { basePrompt: nodeBasePrompt } = require("./defaults/node");
const { basePrompt: reactBasePrompt } = require("./defaults/react");

const {OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// console.log("OPENAI_API_KEY:",OPENAI_API_KEY); // Debugging step
// const groq = new Groq({ apiKey: OPENAI_API_KEY });

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
app.use(cors(corsOptions));


app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});


//streaming response from LLM to app
// Endpoint for creating a template



// Add at the top of the file, after imports
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required but not set in environment variables');
  }

// const LLM_PROVIDER = process.env.LLM_PROVIDER || "groq";
// const GROQ_API_KEY = process.env.GROQ_API_KEY;
// console.log("GROQ_API_KEY:", GROQ_API_KEY);


// if (!GROQ_API_KEY) {
//   throw new Error("GROQ_API_KEY is required but not set.");
// }

async function callOpenAI(messages, model = "gpt-4-turbo", max_tokens = 1000) {
  const response = await openai.chat.completions.create({
    // method: "POST",
    // headers: {
    //   "Authorization": `Bearer ${GROQ_API_KEY}`,
    //   "Content-Type": "application/json"
    // },
    // body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature: 0
    // })
  });
  // if (!response.ok) {
    // const error = await response.text();
    // throw new Error(`OpenAI API Error: ${error}`);
  // }
  return response.choices[0]?.message?.content?.trim();


  // const data = await response.json();
  // return data.choices[0]?.message?.content?.trim();
}
  
  // Modify the /template endpoint
  app.post("/template", async (req, res) => {
     const prompt = req.body.prompt?.trim();
      console.log("prompt:", prompt)
  
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
    try {

      const messages= [
          {
            role: "system",
            content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
          },
          {
            role: "user",
            content: prompt,
          },
        ] 
        // model: "gpt-4-turbo",
        // max_tokens: 200,
        // temperature: 0,
        // stream: false,
      // const responseContent = response.choices[0]?.message?.content?.trim();

      console.log("template messages:", messages);
      const responseContent = await callOpenAI(messages, "gpt-4-turbo", 200);
      console.log(responseContent)
      
      if (!responseContent) {
        return res.status(500).json({ message: "No response from model" });
      }
  
      if (responseContent.includes("react")) {
        return res.json({
          prompts: [BASE_PROMPT,  `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [reactBasePrompt],
        });
      }
  
      if (responseContent.includes("node")) {
        return res.json({
          prompts: [BASE_PROMPT,  `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [nodeBasePrompt],
        });
      }
  
      return res.status(400).json({ message: "Invalid response type" });
    } catch (error) {
      console.error('Template endpoint error:', error);
      res.status(500).json({ 
        message: "Server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  // Modify the /chat endpoint
  app.post("/chat", async (req, res) => {
    try {
      // const messages = req.body.messages;
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

        const fullmessages= [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          ...messages,
        ]
        // model: "gpt-4-turbo",
        // max_tokens: 1000,
        // temperature: 0,
  
      const responseContent= await callOpenAI(fullmessages, "gpt-4-turbo", 3000);

      // Send the response back to the client
      res.json({ response: responseContent });
      console.log(responseContent)
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ 
        message: "Server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "An error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
})


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});