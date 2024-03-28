const moment = require('moment-timezone');
module.exports = {
  config: {
    name: "status",
    aliases: ["sts"],
    version: "1.0",
    author: "RiL",
    countDown: 30,
    role: 0,
    shortDescription: {
      en: `check bot status`
    },
    longDescription: {
      en: `Check BoT status`
    },
    category: "system",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
      
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;

      const now = moment().tz('Asia/Jakarta'); 
      const date = now.format('MMMM Do YYYY'); 
      const time = now.format('h:mm:ss A');
      
      api.sendMessage(`[BOT STATUS]\n\n⏣ Bot running time:\n➤ ${uptimeString}\n⏣ Total Users:\n➤ ${allUsers.length}\n⏣ Total threads:\n➤ ${allThreads.length}\n⏣ Date:\n➤ ${date}\n⏣ Time:\n➤ ${time}\n\n${now}`, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};