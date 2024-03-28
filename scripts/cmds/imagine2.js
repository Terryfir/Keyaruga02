const axios = require('axios');

module.exports = {
  config: {
    name: "imagine",
    version: "1.1",
    author: "MILAN",
    countDown: 10,
    shortDescription: {
      en: "V4 Image Generator."
    },
    longDescription: {
      en: "Create image from your text with 4 model like midjourney."
    },
    category: "ai",
    role: 0,
    guide: {
      en: "{pn} <prompt> or {pn} <prompt> | <model>\n\nHere's Available Models:\n[1]. Analog V1\n[2]. Anything V3\n[3]. Anything V4.5\n[4]. AbyssOrangeMix V3\n[5]. Deliberate V2\n[6]. Dreamlike Diffusion V1\n[7]. Dreamlike Diffusion V2\n[8]. Dreamshaper 5 baked vae\n[9]. Dreamshaper 6 baked vae\n[10]. Elldreth's Vivid\n[11]. Lyriel V1.5\n[12]. Lyriel V1.6\n[13]. MechaMix V1.0\n[14]. MeinaMix Meina V9\n[15]. Openjourney V4\n[16]. Portrait V1\n[17]. Realistic Vision V1.4\n[18]. Realistic Vision V2.0\n[19]. ReV Animated V1.2.2\n[20]. SDV1.4\n[21]. SDV1.5\n[22]. Shonin's Beautiful People V1.0\n[23]. TheAlly's Mix\n[24]. Timeless V1"
    }
  },

  onStart: async function ({ api, event, args, message }) {
  const [promptPart, modelPart] = args.join(" ").split("|").map(part => part.trim());

  if (!promptPart) return message.reply("Add something baka");

  message.reply("✅| Creating your Imagination...", async (err, info) => {
    let ui = info.messageID;

    try {
      let apiUrl = `https://image.restfulapi.repl.co/generatev4?prompt=${encodeURIComponent(promptPart)}`;
      if (modelPart) {
        apiUrl += `&model=${encodeURIComponent(modelPart)}`;
      }

      const response = await axios.get(apiUrl);
      const img = response.data.combinedImageUrl;
      message.unsend(ui); // Unsend the "Creating your Imagination" message

      message.reply({
        body: "Here's your imagination 🖼. Please reply with the image number (1, 2, 3, 4) to get the corresponding image in high resolution.",
        attachment: await global.utils.getStreamFromURL(img)
      }, async (err, info) => {
        let id = info.messageID;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          imageUrls: response.data.imageUrls // Store the imageUrls in the onReply data
        });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage(`Error: ${error}`, event.threadID);
    }
  });
},


  onReply: async function ({ api, event, Reply, usersData, args, message }) {
    const reply = parseInt(args[0]);
    const { author, messageID, imageUrls } = Reply;
    if (event.senderID !== author) return;
    try {
      if (reply >=1 && reply <= 4) {
        const img = imageUrls[`image${reply}`];
        message.reply({ attachment: await global.utils.getStreamFromURL(img) });
      } else {
        message.reply("Invalid image number. Please reply with a number between 1 and 4.");
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(`Error: ${error}`, event.threadID);
    }
  message.unsend(Reply.messageID);
  },
};