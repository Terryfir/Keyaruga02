module.exports = {
 config: {
 name: "Dimpho",
 version: "1.0",
 author: "Strawhat Luffy",
 countDown: 5,
 role: 0,
 shortDescription: "non prefix vommand",
 longDescription: "non prefix .it shows my owner",
 category: "no prefix",
 }, 
 onStart: async function(){}, 
 onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "dimpho") {
 return message.reply({
 body: "what now🙄",
 });
 }
 }
}