// require("dotenv").config(); 
// const GROQ_API_KEY=process.env.GROQ_API_KEY;
// const Groq = require("groq-sdk"); // Use require for CommonJS   //install this 1st
// const express = require("express");

// const groq = new Groq();

// async function main() {
//     const stream = await getGroqChatStream();
    
//     // Process the streaming chunks
//     for await (const chunk of stream) {
//       // Log the content of the current chunk
//       console.log(chunk.choices[0]?.delta?.content || "");
//   }
// }

// async function getGroqChatStream() {
//   return groq.chat.completions.create({
//     messages: [
//         {
//             role: "system",
//             content: "You are a helpful assistant.",
//           },
//       {
//         role: "user",
//         content: "Write the code for a todo application",  //here temp/ randomness:0
//       },
//     ],
//     model: "llama-3.3-70b-versatile",
//     max_tokens: 1000,  
//     temperature:0,  //amt of randomness (how diff u want the resposes to be each time)
//     stream:true,
//   });
// }
// main();

require("dotenv").config({path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { BASE_PROMPT, getSystemPrompt }=require( "./prompts");
const { basePrompt: nodeBasePrompt } = require("./defaults/node");
const { basePrompt: reactBasePrompt } = require("./defaults/react");


const GROQ_API_KEY = process.env.GROQ_API_KEY;
console.log("GROQ_API_KEY:",GROQ_API_KEY); // Debugging step
const groq = new Groq({ apiKey: GROQ_API_KEY });

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Change this to match your frontend URL
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
app.use(cors(corsOptions));

//error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: "An error occurred",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  });

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

//streaming response from LLM to app
// Endpoint for creating a template
// app.post("/template", async (req, res) => {
//     const prompt = req.body.prompt?.trim(); 

// if (!prompt) {
//     return res.status(400).json({ message: "Prompt is required" });
// }

//         const stream = await groq.chat.completions.create({
//             //2 types of msgs to Groq
//             messages: [
//                 {
//                     role: "system",
//                     content: "You are a helpful assistant.",
//                 },
//                 {
//                     role: "user",  //user msg: what is 2+2/write code for todo app
//                     content: prompt,
//                 },
//             ],
//             model: "llama-3.3-70b-versatile",
//             max_tokens: 200,
//             temperature: 0,  //randomness
//             stream: false,
//         });
//         console.log("API Response:", JSON.stringify(stream, null, 2)); // Log the whole response
//         const responseContent = stream.choices[0]?.message?.content?.trim();
//         console.log("Model Response:", responseContent);
    
//     if (responseContent.includes("React")) {
//         res.json({
//             prompts: [BASE_PROMPT,`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n${reactBasePrompt}`,,],  //for structure of React Projects
//             uiPrompts: [reactBasePrompt],  //exclusively for the UI
//         });
//         return;
//     }

//     if (responseContent.includes("Node")) {
//         res.json({
//             prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n${nodeBasePrompt}`, ],
//             uiPrompts: [nodeBasePrompt],
//         });
//         return;
//     }

//     res.status(403).json({ message: "You can't access this" });
// });

// //when user gives prompt,(3 messages totally go) along with user prompt the 'make UI beautiful'(BASE_PROMPT) & 'Here is an artifact ' message also goes

// // Endpoint for chat streaming
// app.post("/chat", async (req, res) => {
//     const messages = req.body.messages;
// //once u have the messages u forward them and the prompt to groq,
// // prompt=getSystemPrompt() in prompt.js
//     const stream = await groq.chat.completions.create({
//         messages: [
//             //messages to LLM:
//             //1) project file structure from template
//             //2) make UI beautiful
//             //3)user prompt/requirement
//             {
//                 role: "system",
//                 content: getSystemPrompt(), // Add the system message dynamically
//             },
//             ...messages, // Include the rest of the messages
//         ],
//         model: "llama-3.3-70b-versatile",
//         max_tokens: 1000,
//         temperature: 0,
//         stream: true,
//     });

//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");

//     let fullContent = ""; //empty string to store accumulated content

//     for await (const chunk of stream) {
//         const delta = chunk.choices[0]?.delta;
//         if (delta && delta.content) {
//             fullContent += delta.content; // Accumulate content
//         }
//     }

//     console.log("Full content:", fullContent); // display the full accumulated content

//     res.write(`\`\`\`javascript\n${fullContent}\n\`\`\``); // Send as formatted code block
//     res.end();
// });


// Add at the top of the file, after imports
if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required but not set in environment variables');
  }
  
  // Modify the /template endpoint
  app.post("/template", async (req, res) => {
    try {
      const prompt = req.body.prompt?.trim();
  
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
  
      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens: 200,
        temperature: 0,
        stream: false,
      });
  
      const responseContent = stream.choices[0]?.message?.content?.trim();
      
      if (!responseContent) {
        return res.status(500).json({ message: "No response from model" });
      }
  
      if (responseContent.includes("React")) {
        return res.json({
          prompts: [BASE_PROMPT, reactBasePrompt],
          uiPrompts: [reactBasePrompt],
        });
      }
  
      if (responseContent.includes("Node")) {
        return res.json({
          prompts: [BASE_PROMPT, nodeBasePrompt],
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
      const messages = req.body.messages;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }
  
      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          ...messages,
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0,
        stream: true,
      });
  
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
  
      let fullContent = "";
  
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
        }
      }
  
      res.write(`\`\`\`javascript\n${fullContent}\n\`\`\``);
      res.end();
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ 
        message: "Server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});