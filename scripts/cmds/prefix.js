const { config } = global.GoatBot;
const path = require("path");
const fs = require("fs-extra");
const { utils } = global;
const axios = require("axios");

module.exports = {
	config: {
		name: "prefix",
		version: "1.6",
		author: "NTKhang | Shikaki",
		countDown: 5,
		role: 0,
		description: "We all know what this is.",
		category: "config",
		guide: {
			vi: "   {pn} <new prefix>: thay đổi prefix mới trong box chat của bạn"
				+ "\n   Ví dụ:"
				+ "\n    {pn} #"
				+ "\n\n   {pn} <new prefix> -g: thay đổi prefix mới trong hệ thống bot (chỉ admin bot)"
				+ "\n   Ví dụ:"
				+ "\n    {pn} # -g"
				+ "\n\n   {pn} reset: thay đổi prefix trong box chat của bạn về mặc định",
			en: "   {pn} <new prefix>: change new prefix in your box chat"
				+ "\n   Example:"
				+ "\n    {pn} #"
				+ "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)"
				+ "\n   Example:"
				+ "\n    {pn} # -g"
				+ "\n\n   {pn} reset: change prefix in your box chat to default"
		}
	},

	langs: {
		vi: {
			reset: "Đã reset prefix của bạn về mặc định: %1",
			onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
			confirmGlobal: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix của toàn bộ hệ thống bot",
			confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
			successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
			successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1",
			myPrefix: "🌐 Prefix của hệ thống: %1\n🛸 Prefix của nhóm bạn: %2"
		},
		en: {
			reset: "Your prefix has been reset to default: %1",
			onlyAdmin: "Only admin can change prefix of system bot",
			confirmGlobal: "Please react to this message to confirm change prefix of system bot",
			confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
			successGlobal: "Changed prefix of system bot to: %1",
			successThisThread: "Changed prefix in your group chat to: %1",
			myPrefix: "\nMy System Prefix: %1\nYour box chat prefix: %2"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}
		else if (args[0] == "file")
		{
			const isAdmin = config.adminBot.includes(event.senderID);
			if (!isAdmin)
			{
				message.reply("❌ You need to be an admin of the bot.");
			}
			else 
			{
				const fileUrl = event.messageReply && event.messageReply.attachments[0].url;

				if (!fileUrl) {
					return message.reply("❌ No valid attachment found.");
				}

				const folderPath = 'scripts/cmds/prefix';

				if (!fs.existsSync(folderPath)) {
					fs.mkdirSync(folderPath, { recursive: true });
				}

				try {
					const files = await fs.readdir(folderPath);
					for (const file of files) {
						await fs.unlink(path.join(folderPath, file));
					}
				} catch (error) {
					return message.reply("❌ Error clearing folder: " + error);
				}
		
				const response = await axios.get(fileUrl, {
					responseType: "arraybuffer",
					headers: {
						'User-Agent': 'axios'
					}
				});
		
				const contentType = response.headers['content-type'];
				if (contentType.includes('image')) {
					const imagePath = path.join(folderPath, 'image.jpg');
					fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));
				} else if (contentType.includes('video') || contentType.includes('gif')) {
					const ext = contentType.includes('video') ? '.mp4' : '.gif';
					const mediaPath = path.join(folderPath, 'media' + ext);
					fs.writeFileSync(mediaPath, Buffer.from(response.data, 'binary'));
				} else {
					return message.reply("❌ Invalid attachment format. Reply only with an image, video, or gif");
				}
		
				message.reply("✅ File saved successfully.");
			}
		}
		else if (args == "clear")
		{			const isAdmin = config.adminBot.includes(event.senderID);
			if (!isAdmin)
			{
				message.reply("❌ You need to be an admin of the bot.");
			}
			else{
				try {
					const folderPath = 'scripts/cmds/prefix';
		
					if (fs.existsSync(folderPath)) {
						const files = await fs.readdir(folderPath);
						for (const file of files) {
							await fs.unlink(path.join(folderPath, file));
						}
						message.reply("✅ Folder cleared successfully.");
					} else {
						return message.reply("❌ Folder does not exist.");
					}
				} catch (error) {
					return message.reply("❌ Error clearing folder: " + error);
				}
			}
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g")
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		else
			formSet.setGlobal = false;

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		const folderPath = 'scripts/cmds/prefix';

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const files = await fs.readdir(folderPath);

        const attachments = [];
        
        for (const file of files) {
        const filePath = path.join(folderPath, file);
        const fileStream = fs.createReadStream(filePath);
        attachments.push(fileStream);
        }

        const messageContent = {
        attachment: attachments
        };

		if (event.body) {
		  // List of prefixes to check
		  const prefixesToCheck = ["neko", "prefix"];
	
		  const lowercasedMessage = event.body.toLowerCase();
	  
		  if (prefixesToCheck.includes(lowercasedMessage.trim())) {
			return () => {
			  return message.reply({ body: getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID) ), attachment: messageContent.attachment});
			};
		  }
		}
	  }
};
