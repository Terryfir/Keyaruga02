const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "datetime",
    version: "1.4",
    author: "kae",
    countdown: 5,
    role: 0,
    shortDescription: "Displays the current date and time in South Africa.",
    longDescription: "",
    category: "misc",
    guide: "{prefix}{name}",
    envConfig: {}
  },

  onStart: async function({ message, args }) {
    const southafricanTime = moment.tz("Africa/Johannesburg").format("h:mm:ss A");
    const southafricanDate = moment.tz("Africa/Johannesburg").format("dddd, DD MMMM YYYY");

    const reply = `Today Date & Time in South Africa:\n` +
      `❏Date: ${southafricanDate}\n` +
      `❏Time: ${southafricanTime}`;

    message.reply(reply);
  },
  onEvent: async function() {}
};