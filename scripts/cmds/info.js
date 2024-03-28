const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "info",
    version: "1.3",
    author: "AceGun",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "",
      en: "Sends information about the bot and admin along with an image."
    },
    longDescription: {
      vi: "",
      en: "Sends information about the bot and admin along with an image."
    },
    category: "utility",
    guide: {
      en: "{pn}"
    },
    envConfig: {}
  },

  onStart: async function ({ message }) {
    const botName = "Terry";
    const botPrefix = "!";
    const authorName = "Certified Liar";
const authorId = "100081631170408"";
    const authorProfile = "https://www.facebook.com/profile.php?id=100081631170408"
    const authorInsta = "";
    const status = "hi, crush ko po kayong lahat";

    const urls = JSON.parse(fs.readFileSync('loid.json'));
    const link = urls[Math.floor(Math.random() * urls.length)];

    const now = moment().tz('Africa/Johannesburg ');
    const date = now.format('MMMM Do YYYY');
    const time = now.format('h:mm:ss A');

    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const days = Math.floor(uptime / (60 * 60 * 24));
    const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

    message.reply({
      body: `===「 Bot & Owner Info 」===\n❏Bot Name: ${botName}\n❏Bot Prefix: ${botPrefix}\n❏Name: ${authorName}\n❏Facebook: ${authorFB}\n❏Instagram: ${authorInsta}\n❏Status: ${status}\n❏Date: ${date}\n❏Time: ${time}\n❏Uptime: ${uptimeString}\n=====================`,
      attachment: await global.utils.getStreamFromURL(link)
    });
  },

  onChat: async function({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "info") {
      this.onStart({ message });
    }
  }
};