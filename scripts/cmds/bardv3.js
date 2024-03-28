const axios = require("axios");
const fs = require("fs");
const gtts = require("gtts");
const path = require("path");

module.exports = {
  config: {
    name: "bardv3",
    version: "1.0.0",
    author: "lance", //Credits to Arjhil
    cooldowns: 5,
    role: 0,
    shortDescription: "Bard AI, Pinterest Image Search, and gTTS",
    longDescription: "Bard AI, Pinterest Image Search, and gTTS",
    category: "ai",
    guide: "just type, bardv3 <queries> and let the bot reacts",
  },
  async onStart({ api, event, args }) {
    api.sendMessage('This command doesn\'t need a prefix.', event.threadID, event.messageID);
    api.setMessageReaction("😆", event.messageID, () => {}, true);
  },
  onChat: async ({ api, args, event }) => {
    if (event.body.toLowerCase().split(' ')[0] === 'bardv3') {
      const { threadID, messageID, type, messageReply, body } = event;
      let question = "";
      if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
        const attachment = messageReply.attachments[0];
        const imageURL = attachment.url;
        question = await convertImageToText(imageURL);
        if (!question) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          api.sendMessage("❌ Failed to convert the photo to text. Please try again with a clearer photo.", threadID, messageID);
          return;
        }
      } else {
        question = args.join(" ").trim();
        if (!question) {
          api.sendMessage("Please provide a question or query", threadID, messageID);
          return;
        }
      }

      api.setMessageReaction("🔎", event.messageID, () => {}, true);
      api.sendMessage("🔎 Bardv3 is searching for an answer, please wait...", threadID, messageID);
      try {
        const bardResponse = await axios.get(`https://celestial-dainsleif-docs.archashura.repl.co/bardgpt?id=${id}&ask=${encodeURIComponent(prompt)}${imageQuery}`);
        const bardData = bardResponse.data;
        const bardMessage = bardData.message;

        const pinterestResponse = await axios.get(`https://api-dien.kira1011.repl.co/pinterest?search=${encodeURIComponent(keyword)}`);
        const pinterestImageUrls = pinterestResponse.data.data.slice(0, 6);
        const pinterestImageAttachments = [];

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir);
        }
        for (let i = 0; i < pinterestImageUrls.length; i++) {
          const imageUrl = pinterestImageUrls[i];
          try {
            const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const imagePath = path.join(cacheDir, `pinterest_image${i + 1}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
            pinterestImageAttachments.push(fs.createReadStream(imagePath));
          } catch (error) {
            console.error("Error fetching Pinterest image:", error);
          }
        }
        const formattedBardAnswer = `🤖 BARDV3: ${formatFont(bardMessage)}`;
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage(formattedBardAnswer, threadID);

        const gttsPath = path.join(cacheDir, 'voice.mp3');
        const gttsInstance = new gtts(bardMessage, 'en');
        gttsInstance.save(gttsPath, function (error, result) {
          if (error) {
            console.error("Error saving gTTS:", error);
          } else {
            api.sendMessage({
              body: "🗣️ Voice Answer:",
              attachment: fs.createReadStream(gttsPath)
            }, threadID);
          }
        });

        if (pinterestImageAttachments.length > 0) {
          api.sendMessage({
            attachment: pinterestImageAttachments,
            body: `📷 Image Search Results for: ${question}`,
          }, threadID);
        }
      } catch (error) {
        console.error("An error occurred:", error);
        api.sendMessage("❌ An error occurred while processing the request.", threadID, messageID);
      }
    }
  }
};

async function convertImageToText(imageURL) {
  try {
    const response = await axios.get(`https://bard-ai.arjhilbard.repl.co/api/other/img2text?input=${encodeURIComponent(imageURL)}`);
    return response.data.extractedText;
  } catch (error) {
    console.error("Error converting image to text:", error);
    return null;
  }
}

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹",
  };
  let formattedText = "";
  for (const char of text) {
    if (char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }
  return formattedText;
}
