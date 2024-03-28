const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "hh",
    aliases: [],
    version: "1.0",
    author: "Strawhat Luffy",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Sends a random gif",
    },
    longDescription: {
      en: "Sends a random gif from the  API",
    },
    category: "anime",
    guide: {
      en: "{p}anikss",
    },
  },
  onStart: async function ({ event, message, args, threadsData, usersData, api, commandName, role }) {
    try {
      const response = await fetch("https://api.waifu.pics/sfw/handhold");
      const data = await response.json();

      if (data.url) {
        // Send the gif as an attachment
        message.reply({
   body:        data.url,
attachment: await global.utils.getStreamFromURL(data.url)
        });
      } else {
        message.reply("Sorry, I couldn't fetch a gif for you.");
      }
    } catch (err) {
      console.error(err);
      message.reply("Oops! An error occurred while fetching the gif.");
    }
  },
};