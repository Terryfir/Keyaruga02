const axios = require('axios');

const geminiApiKey = "AIzaSyCt_bKlKBMQGYd_y2wJYSlAciVKoNVZ1k0";

const chatbot = {
  config: {
    name: "bard",
    version: "2.0",
    author: "Cruizex",
    description: "Generate Responses using Gemini | Vertex by Google LLMs",
  },

  async makeGeminiApiRequest(userInput) {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          contents: [{
            parts: [{
              text: userInput
            }]
          }],
        },
        {
          params: { key: geminiApiKey },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      return generatedText;
    } catch (error) {
      console.error("Error making Gemini API request:", error.message);
      throw error;
    }
  },

  async handleCommand({ message, event, args, api }) {
    try {
      const uid = event.senderID;
      const encodedPrompt = encodeURIComponent(args.join(" "));

      if (!encodedPrompt) {
        return message.reply("Please provide questions");
      }

      const geminiResponse = await this.makeGeminiApiRequest(encodedPrompt);

      message.reply({
        body: `${geminiResponse}`,
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: uid,
          prompt: encodedPrompt,
          response: geminiResponse,
        });
      });
    } catch (error) {
      console.error("Error handling command:", error.message);
    }
  },

  onStart: function (params) {
    return this.handleCommand(params);
  },

  onReply: function (params) {
    (async () => {
      try {
        const uid = params.event.senderID;
        const context = global.GoatBot.onReply.get(params.messageID);

        if (context) {
          const { prompt, response } = context;
          const newPrompt = `${prompt} ${params.args.join(" ")}`;

          const geminiResponse = await this.makeGeminiApiRequest(newPrompt);
          global.GoatBot.onReply.set(params.messageID, {
            ...context,
            prompt: newPrompt,
            response: geminiResponse,
          });

          params.message.reply({
            body: `${geminiResponse}`,
          });
        } else {
          this.handleCommand(params);
        }
      } catch (error) {
        console.error("Error handling reply:", error.message);
      }
    })();
  },
};

chatbot.onStart();

module.exports = chatbot;