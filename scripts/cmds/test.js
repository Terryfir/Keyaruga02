module.exports = {
	config: {
		name: "test",
		version: "1.0",
		author: "NIB",
		countDown: 1,
		role: 0,
		shortDescription: "Enable/disable antiout",
		longDescription: "",
		category: "harem kings",
		guide: "{pn} {{[on | off]}}",
		envConfig: {
			deltaNext: 5
		}
	},
  

	onStart: async function ({ message, event, threadsData, args }) {
let antiout = await threadsData.get(event.threadID, "settings.acadmin");
		
			
    if(antiout === undefined){
      await threadsData.set(event.threadID, true, "settings.acadmin");
    }
    console.log(await threadsData.get(event.threadID, "settings.acadmin"))
		if (!["on", "off"].includes(args[0]))
			return message.reply("on or off")
		await threadsData.set(event.threadID, args[0] === "on", "settings.acadmin");
    
		return message.reply(`Is already ${args[0] === "on" ? "turn on" : "Turn off"}`);
	}



  
}