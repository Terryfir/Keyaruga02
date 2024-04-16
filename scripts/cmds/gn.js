const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const { Buffer } = require('buffer');

const API_KEY = "AIzaSyCMNN7MN-KCaiBPIc6rATi7wYOgb3CQGZY";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });

const persistentChats = new Map();

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
];


module.exports = {
  config: {
    name: "gemini",
    aliases: "g",
    version: "1.1.7",
    author: "Shikaki",
    countDown: 5,
    role: 0,
    description: { en: "Artificial Intelligence Google Gemini 1.5 pro or 1.0 ultra" },
    guide: { en: "{pn} <query>" },
    category: "ai",
  },
  onStart: async function ({ api, message, event, args, commandName }) {
    const userID = event.senderID;
    let prompt = args.join(" ");

    if (prompt.toLowerCase() === "clear") {
      clearChatHistory();
      message.reply("Chat history cleared successfully.");
      return;
    }

    let content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
    targetMessageID = (event.type == "message_reply") ? event.messageReply.messageID : event.messageID;

    if (content != "" && event.type == "message_reply") {
      api.setMessageReaction("⌛", event.messageID, () => { }, true);
      var startTime = new Date().getTime();
      var chatHistory = readChatHistory(userID);

      if (!persistentChats.has(userID)) {
        persistentChats.set(userID, model.startChat({
          history: chatHistory,
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
          },
        }));
      }
      const persistentChat = persistentChats.get(userID);

      try {
        let msg = content + prompt;

        const result = await persistentChat.sendMessage(msg, safetySettings);

        const response = await result.response;

        let text = response.text();
        appendToChatHistory({ role: "user", parts: [{ text: msg }] });
        appendToChatHistory({ role: "model", parts: [{ text: text }] });

        const endTime = new Date().getTime();
        const completionTime = ((endTime - startTime) / 1000).toFixed(2);
        const totalWords = text.split(/\s+/).filter(word => word !== '').length;

        message.reply(`${text}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
            });
          }
        });
        api.setMessageReaction("✅", event.messageID, () => { }, true);
      } catch (error) {
        message.reply(`${error.message}`);
        api.setMessageReaction("❌", event.messageID, () => { }, true);
      }
    } else if (event.type === "message_reply") {
      prompt = args.join(" ");

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-vision-latest" });

      var startTime = new Date().getTime();
      api.setMessageReaction("⌛", event.messageID, () => { }, true);

      try {
        let imageParts = [];
        for (let i = 0; i < Math.min(event.messageReply.attachments.length, 5); i++) {
          const imageUrl = event.messageReply.attachments[i]?.url;
          if (imageUrl) {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            imageParts.push({
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: response.headers['content-type']
              },
            });
          }
        }

        if (imageParts.length > 0) {
          let result = await model.generateContent([prompt, ...imageParts], safetySettings);
          const generationResponse = await result.response;

          let text = generationResponse.text();

          appendToChatHistory({ role: "user", parts: [{ text: prompt }] });
          appendToChatHistory({ role: "model", parts: [{ text: text }] });

          const endTime = new Date().getTime();
          const completionTime = ((endTime - startTime) / 1000).toFixed(2);
          const totalWords = text.split(/\s+/).filter(word => word !== '').length;
          await message.reply(`${text}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`);
          api.setMessageReaction("✅", event.messageID, () => { }, true);
        } else {
          throw new Error("No image attachments found to process.");
        }
      } catch (error) {
        message.reply(`${error.message}`);
        api.setMessageReaction("❌", event.messageID, () => { }, true);
      }
    } else {
      api.setMessageReaction("⌛", event.messageID, () => { }, true);
      const startTime = new Date().getTime();
      var chatHistory = readChatHistory(userID);

      if (!persistentChats.has(userID)) {
        persistentChats.set(userID, model.startChat({
          history: chatHistory,
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
          },
        }));
      }

      const persistentChat = persistentChats.get(userID);

      try {
        let msg = prompt;

        const result = await persistentChat.sendMessage(msg, safetySettings);
        const response = await result.response;

        let text = response.text();

        appendToChatHistory({ role: "user", parts: [{ text: msg }] });
        appendToChatHistory({ role: "model", parts: [{ text: text }] });

        const endTime = new Date().getTime();
        const completionTime = ((endTime - startTime) / 1000).toFixed(2);
        const totalWords = text.split(/\s+/).filter(word => word !== '').length;

        message.reply(`${text}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
            });
          }
        });
        api.setMessageReaction("✅", event.messageID, () => { }, true);
      } catch (error) {
        message.reply(`${error.message}`);
        api.setMessageReaction("❌", event.messageID, () => { }, true);
      }
    }
  },
  onReply: async function ({ api, message, event, Reply, args }) {
    const userID = event.senderID;
    const prompt = args.join(" ");
    let { author, commandName } = Reply;

    if (event.senderID !== author) return;

    var startTime = new Date().getTime();
    api.setMessageReaction("⌛", event.messageID, () => { }, true);

    var chatHistory = readChatHistory(userID);

    if (chatHistory.length === 0) {
      chatHistory.push({
        role: "user",
        parts: [{ text: "Start of conversation" }],
      });
    }

    if (!persistentChats.has(userID)) {
      persistentChats.set(userID, model.startChat({
        history: chatHistory,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
        },
      }));
    }
    const persistentChat = persistentChats.get(userID);

    try {
      msg = prompt.trim() === "" ? "" : prompt;
      const result = await persistentChat.sendMessage(msg, safetySettings);
      const response = await result.response;

      text = response.text();

      appendToChatHistory(userID, { role: "user", parts: [{ text: msg }] });
      appendToChatHistory(userID, { role: "model", parts: [{ text: text }] });

      const endTime = new Date().getTime();
      const completionTime = ((endTime - startTime) / 1000).toFixed(2);
      const totalWords = text.split(/\s+/).filter(word => word !== '').length;

      message.reply(`${text}\n\nCompletion time: ${completionTime}\nTotal words: ${totalWords}`, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
          });
        }
      });
      api.setMessageReaction("✅", event.messageID, () => { }, true);
    } catch (error) {
      message.reply(`${error.message}`);
      api.setMessageReaction("❌", event.messageID, () => { }, true);
    }
  }
}

function ensureChatHistoryFile(userID) {
  const directoryPath = path.join(__dirname, 'chatHistory');
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
  const filePath = path.join(directoryPath, `${userID}gemini.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
  return filePath;
}

function readChatHistory(userID) {
  const filePath = ensureChatHistoryFile(userID);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading chat history for user ${userID}:`, err);
    return [];
  }
}

function appendToChatHistory(userID, messageObject) {
  const filePath = ensureChatHistoryFile(userID);
  try {
    const chatHistory = readChatHistory(userID);
    chatHistory.push(messageObject);
    fs.writeFileSync(filePath, JSON.stringify(chatHistory, null, 2));
  } catch (err) {
    console.error(`Error appending message to chat history for user ${userID}:`, err);
  }
}

function clearChatHistory(userID) {
  const filePath = path.join(__dirname, 'chatHistory', `${userID}gemini.json`);
  try {
    fs.unlinkSync(filePath);
    console.log(`Chat history cleared for user ${userID}`);
  } catch (err) {
    console.error(`Error clearing chat history for user ${userID}:`, err);
  }
}