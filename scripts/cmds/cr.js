module.exports = {
  config: {
    name: "changeReaction",
    aliases: ["cr"],
    role: 1,
    shortDescription: {
      en: "Change quick reaction of thread group chat box",
      tl: "Baguhin ang mabilis na reaksiyon ng thread group chat box",
    },
    longDescription: {
      en: "Change the quick reaction of the thread group chat box.",
      tl: "Baguhin ang mabilis na reaksiyon ng thread group chat box.",
    },
    category: "goatBot",
    guide: {
      en: "{p}changeReaction <emoji>",
      tl: "{p}changeReaction <emoji>",
    },
  },
  onStart: async function ({ event, message, args, threadsData, usersData, api }) {
    if (!args[0]) {
      message.reply("Please provide an emoji as the quick reaction.");
      return;
    }

    const reaction = args[0];
    const threadID = event.threadID;

    try {
      await api.changeThreadEmoji(reaction, threadID);
      message.reply("Quick reaction successfully changed!");
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while changing the quick reaction.");
    }
  },
};