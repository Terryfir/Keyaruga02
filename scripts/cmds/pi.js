const axios = require("axios");
let targetMessageID;

module.exports = {
  config: {
    name: 'pi',
    version: '1.0.11',
    author: 'Shikaki & Aliester Crowley',
    countDown: 10,
    role: 0,
    category: 'Ai',
    description: {
      en: 'pi ai : Can use Internet.',
    },
    guide: {
      en: '{pn} [prompt]',
    },
  },

  onStart: async function ({ api, message, event, args, commandName }) {
    let prompt = args.join(" ");

    if (prompt.toLowerCase() === "clear") {
      const clear = await axios.get(`https://pi.aliestercrowley.com/api/reset?uid=${event.senderID}`);
      message.reply(clear.data.message);
      return;
    }

    let content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
    targetMessageID = (event.type == "message_reply") ? event.messageReply.messageID : event.messageID;
    if (content != "" && event.type == "message_reply") {

      api.setMessageReaction("⌛", event.messageID, () => { }, true);

      var startTime = new Date().getTime();

      let updatedPrompt = `Mostly answer in short like 1 or 2 sentenes unless it requires a long answer such as essay, poem or story and so on. Analyze the prompt and answer as instructed and only the necessary part. no additional fillers. Now : ${content}`;
      const url = `https://pi.aliestercrowley.com/api?prompt=${encodeURIComponent(updatedPrompt)}&uid=${targetMessageID}`;

      try {
        const response = await axios.get(url);
        const result = response.data.response;

        const endTime = new Date().getTime()
        const completionTime = ((endTime - startTime) / 1000).toFixed(2);

        const totalWords = result.split(/\s+/).filter(word => word !== '').length;

        message.reply(`${result}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`, (err, info) => {
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
        message.reply('An error occurred.');
        api.setMessageReaction("❌", event.messageID, () => { }, true);
      }
    } else {

      api.setMessageReaction("⌛", event.messageID, () => { }, true);

      const startTime = new Date().getTime();

      let updatedPrompt = `Mostly answer in short like 1 or 2 sentenes unless it requires a long answer such as essay, poem or story and so on. Analyze the prompt and answer as instructed and only the necessary part. no additional fillers. Now : ${content}`;
      const url = `https://pi.aliestercrowley.com/api?prompt=${encodeURIComponent(updatedPrompt)}&uid=${event.senderID}`;

      try {
        const response = await axios.get(url);
        const result = response.data.response;

        const endTime = new Date().getTime()
        const completionTime = ((endTime - startTime) / 1000).toFixed(2);

        const totalWords = result.split(/\s+/).filter(word => word !== '').length;

        message.reply(`${result}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`, (err, info) => {
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
        message.reply('An error occurred.');
        api.setMessageReaction("❌", event.messageID, () => { }, true);
      }
    }
  },

  onReply: async function ({ api, message, event, Reply, args }) {
    const prompt = args.join(" ");
    let { author, commandName } = Reply;
    if (event.senderID !== author) return;

    if (event.type == "message_reply") {
      var startTime = new Date().getTime();

      api.setMessageReaction("⌛", event.messageID, () => { }, true);

      let updatedPrompt = `Mostly answer in short like 1 or 2 sentenes unless it requires a long answer such as essay, poem or story and so on. Analyze the prompt and answer as instructed and only the necessary part. no additional fillers. Now : ${prompt}`;
      const url = `https://pi.aliestercrowley.com/api?prompt=${encodeURIComponent(updatedPrompt)}&uid=${updatedPrompt}`;
      try {
        const response = await axios.get(url);

        const content = response.data.response;

        const endTime = new Date().getTime()
        const completionTime = ((endTime - startTime) / 1000).toFixed(2);
        const totalWords = content.split(/\s+/).filter(word => word !== '').length;

        message.reply(`${content}\n\nCompletion time: ${completionTime}\nTotal words: ${totalWords}`, (err, info) => {
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
        console.error(error.message);
        message.reply("An error occurred.");
        api.setMessageReaction("❌", event.messageID, () => { }, true);
      }
    }
    else {
      var startTime = new Date().getTime();

      api.setMessageReaction("⌛", event.messageID, () => { }, true);

      let updatedPrompt = `Mostly answer in short like 1 or 2 sentenes unless it requires a long answer such as essay, poem or story and so on. Analyze the prompt and answer as instructed and only the necessary part. no additional fillers. Now : ${prompt}`;
      const url = `https://pi.aliestercrowley.com/api?prompt=${encodeURIComponent(updatedPrompt)}&uid=${event.senderID}`;
      try {
        const response = await axios.get(url);

        const content = response.data.response;

        const endTime = new Date().getTime()
        const completionTime = ((endTime - startTime) / 1000).toFixed(2);
        const totalWords = content.split(/\s+/).filter(word => word !== '').length;

        message.reply(`${content}\n\nCompletion time: ${completionTime}\nTotal words: ${totalWords}`, (err, info) => {
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
        console.error(error.message);
        message.reply("An error occurred.");
        api.setMessageReaction("❌", event.messageID, () => { }, true);
      }
    }

  },
};
