module.exports = {
  config: {
    name: "university",
    version: "1.0",
    author: "Samir Œ",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "search university",
      en: "search university",
    },
    longDescription: {
      vi: "search university in your country",
      en: "search university in your country",
    },
    category: "tech",
  },
  onStart: async function ({ api, args, message }) {
    const axios = require('axios');
    const text = args[0];
    const apiUrl = `http://universities.hipolabs.com/search?country=${text}`;

    try {
      const response = await axios.get(apiUrl);
      const universities = response.data;
      const header = "𝗨𝗻𝗶𝘃𝗲𝗿𝘀𝗶𝘁𝘆 ";

      const shuffledUniversities = universities.sort(() => Math.random() - 0.5);
      const randomInfo = shuffledUniversities.slice(0, 5).map((university,index) => `${index + 1}. ${header}\n🌟 Name: ${university.name}\n🌎 Website: ${university.web_pages.join(', ')}`);
      message.reply({ body: randomInfo.join('\n\n') });
    } catch (error) {
      console.error('Error:', error);
    }
  },
};