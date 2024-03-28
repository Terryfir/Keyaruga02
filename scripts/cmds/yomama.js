const axios = require('axios');

module.exports = {
  config: {
    name: "yomama",
    aliases: [],
    version: "1.0",
    author: "Shikaki",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get a random 'Yo mama' joke",
    },
    longDescription: {
      en: "Get a random 'Yo mama' joke to lighten up your day.",
    },
    category: "Fun",
    guide: {
      en: "{pn} yomama",
    },
  },

  onStart: async function ({ message, event }) {
    try {
      // Define the URL for a random 'Yo mama' joke
      const yomamaUrl = 'https://www.yomama-jokes.com/api/v1/jokes/random/';

      // Fetch a random 'Yo mama' joke from the API
      const response = await axios.get(yomamaUrl, {
        headers: { 'accept': 'application/json' },
      });

      if (response.data && response.data.joke) {
        // Format and reply with the 'Yo mama' joke
        const formattedJoke = `😄 Here's a 'Yo mama' joke for your request:\----------------------\\${response.data.joke}\\----------------------`;
        message.reply(formattedJoke);
      } else {
        // Handle the case where the API response doesn't contain a joke
        message.reply("I couldn't fetch a 'Yo mama' joke at the moment. Try again later.");
      }
    } catch (error) {
      console.error("Error fetching 'Yo mama' joke:", error.message);
      message.reply("An error occurred while fetching the 'Yo mama' joke. Please try again later.");
    }
  },
};