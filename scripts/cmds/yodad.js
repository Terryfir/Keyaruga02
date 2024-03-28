module.exports = {
    config: {
        name: "Yo dad",
        version: "1.0",
        author: "choona",
        countDown: 5,
        role: 0,
        shortDescription: "Bot replies to hi message",
        longDescription: "Bot replies to hi message",
        category: "No prefix",
    },
onStart: async function(){}, 
onChat: async function({
    event,
    message,
    getLang
}) {
    if (event.body && event.body.toLowerCase() == "terry who is your dad") return message.reply("Certified liar is my dad😙");
}
};