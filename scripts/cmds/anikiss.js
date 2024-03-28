module.exports = {
  config: {
    name: "anikiss",
    aliases: [],
    version: "1.0",
    author: "Strawhat Luffy",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a random kiss gif",
      tl: "Magpadala ng random na gif ng halik"
    },
    longDescription: {
      en: "Send a random kiss gif using the waifu.pics API",
      tl: "Magpadala ng random na gif ng halik gamit ang waifu.pics API"
    },
    category: "goatBot",
    guide: {
      en: "{p}kiss",
      tl: "{p}kiss"
    },
  },
  
  onStart: async function ({ event, message, args, api }) {
    const fetch = require('node-fetch');
    
    // Call the Waifu.pics API to get a random kiss gif
    const response = await fetch('https://api.waifu.pics/sfw/kiss');
    const data = await response.json();
    
    // Get the gif URL from the API response
    const gifUrl = data.url;
    
    // Create the message with the gif and author name
    const form = {
      body: gifUrl,
      attachment: await global.utils.getStreamFromURL(gifUrl),
      mentions: [{
        tag: "Strawhat Luffy",
        id: "100022653450378" // Replace <AUTHOR_ID> with the actual author ID
      }]
    }
    
    // Send the message
    message.reply(form);
  }
}