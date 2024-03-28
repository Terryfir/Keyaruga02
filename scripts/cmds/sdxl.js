const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: 'sdxl',
    version: '1.0',
    author: 'rehat--',
    countDown: 0,
    role: 0,
    longDescription: {
      en: 'Text to Image'
    },
    category: 'ai',
   guide: {
        en: '1 | DreamshaperXL10' +
'\n2 | DynavisionXL' +
'\n3 | JuggernautXL' +
'\n4 | RealismEngineSDXL' +
'\n5 | Sdxl 1.0' 
      }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const info = args.join(' ');
      const [prompt, model] = info.split('|').map(item => item.trim());
      const text = args.join ("");
          if (!text) {
      return message.reply("❎ | Please Provide a Prompt");}   
      const modelParam = model || '2';
      const apiUrl = `https://prodia-xl.api-tu33rtle.repl.co/api/sdxl?prompt=${prompt}&model=${modelParam}`;

      await message.reply('Please Wait...⏳');

      const form = {
      };
      form.attachment = [];
      form.attachment[0] = await global.utils.getStreamFromURL(apiUrl);

      message.reply(form);
    } catch (error) {
      console.error(error);
      await message.reply('❎ | Sorry, API Have Skill Issue');
    }
  }
};