const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "del",
		aliases: ["d"],
		version: "1.0",
		author: "Raphael",
		countDown: 5,
		role: 2,
		shortDescription: "Delete file and folders",
		longDescription: "Delete file",
		category: "owner",
		guide: "{pn}"
	},


  onStart: async function ({ args, message,event}) {
 const permission = ["100081631170408"];
    if (!permission.includes(event.senderID)) {
      message.reply("You don't have enough permission to use this command. Only Certified Liar can do it.");
      return;
    }
    const commandName = args[0];

    if (!commandName) {
      return message.reply("Type the file name..");
    }

    const filePath = path.join(__dirname, '..', 'cmds', `${commandName}`);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        message.reply(`✅ | A command file has been deleted ${commandName} !!`);
      } else {
        message.reply(`command file ${commandName} unavailable!!`);
      }
    } catch (err) {
      console.error(err);
      message.reply(`Cannot be deleted because ${commandName}: ${err.message}`);
    }
  }
};