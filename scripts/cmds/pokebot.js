const fs = require('fs');
const axios = require('axios');

global.poke = {};
global.fff = [];

function writeJSONFile(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

module.exports = {
    config: {
        name: "pokebot",
        version: "1.3.2",
        author: "Shikaki & Ausum for data & Special thanks to Samir for the idea and basic code structure!",
        countDown: 5,
        role: 0,
        shortDescription: "Run the Pokémon bot",
        longDescription: "Run the Pokémon bot and play a simple Pokémon game",
        category: "🐍 Pokémon",
        guide: {
            en: "{pn} -> This will tell you whether pokébot is on or off.\n\n{pn} on -> This will turn on the pokébot.\n\n{pn} off -> This will turn off the pokébot",
        },

        pokeboton: "✅ Pokébot is already enabled here.\n\nTo disable it, use:\n{pn}pokebot off",
        pokebotoff: "❌ Pokébot is currently disabled here.\n\nTo enable it, use:\n{pn}pokebot on",
    },

    onStart: async function ({ message, event, threadsData, args, prefix }) {
        var pokedb;
        try {
            pokedb = JSON.parse(fs.readFileSync('pokedb.json', 'utf8'));
        } catch (err) {
            fs.writeFileSync('pokedb.json', '{}');
            pokedb = {};
        }

        let pokebot = await threadsData.get(event.threadID, "settings.pokebot");

        if (pokebot === undefined) {
            await threadsData.set(event.threadID, true, "settings.pokebot");
        }

        console.log(await threadsData.get(event.threadID, "settings.pokebot"));

        if (!args[0]) {
            const pokebot = await threadsData.get(event.threadID, "settings.pokebot");
            if (pokebot) {
                return message.reply(module.exports.config.pokeboton.replace(/{pn}/g, prefix));
            } else {
                return message.reply(module.exports.config.pokebotoff.replace(/{pn}/g, prefix));
            }
        }

        if (args[0].toLowerCase() === "on") {
            if (!pokedb.hasOwnProperty(event.threadID)) {
                pokedb[event.threadID] = { taken: [], usdata: {} };

                await threadsData.set(event.threadID, true, "settings.pokebot");

                try {
                    const githubData = await axios.get('https://raw.githubusercontent.com/theone2277/pokos/main/pokeData');
                    const pokos = githubData.data;
                    
                    const numberOfPokemon = pokos.length;
                    
                    writeJSONFile('pokos.json', pokos);
                    
                    if (pokos.length !== numberOfPokemon) {
                        return message.reply(`✅ Pokébot has been turned on successfully.\n\n😎 Pokébot data has been updated successfully. \nCurrently, there are ${numberOfPokemon} Pokémon. Please use this command every week or a few weeks to set the latest updated Pokémon data.`);
                    } else {
                        return message.reply(`✅ Pokébot has been turned on successfully.\n\n🥲 No new Pokémon data has been updated. \nCurrently, there are ${numberOfPokemon} Pokémon.`);
                    }                
                } catch (error) {
                    console.error('Error fetching Pokémon data:', error.message);
                }

                fs.writeFile('pokedb.json', JSON.stringify(pokedb), (err) => {
                    if (err) return console.error(err);
                });
            } else {
                return message.reply("✅ Pokébot is already enabled here.");
            }
        } else if (args[0].toLowerCase() === "off") {
            await threadsData.set(event.threadID, false, "settings.pokebot");
            return message.reply("❌ Pokébot has been turned off here.");
        }
    },

    onChat: async function ({ threadsData, event, message, commandName }) {
        var pokos;
        var pokedb;
    
        try {
            pokos = JSON.parse(fs.readFileSync('pokos.json', 'utf8'));
        } catch (err) {
            fs.writeFileSync('pokos.json', '[]');
            pokos = [];
        }
    
        try {
            pokedb = JSON.parse(fs.readFileSync('pokedb.json', 'utf8'));
        } catch (err) {
            fs.writeFileSync('pokedb.json', '{}');
            pokedb = {};
        }
    
        const pokebot = await threadsData.get(event.threadID, "settings.pokebot");
        if (!pokebot)
            return;
    
        if (!pokedb[event.threadID]) {
            pokedb[event.threadID] = { taken: [], usdata: {} };
        }
    
        if (!global.poke.hasOwnProperty(event.threadID)) {
            global.poke[event.threadID] = 1;
        }
        global.poke[event.threadID]++;
        if (global.poke[event.threadID] == 5) {
            let time = 5; // Change the time value to 5 for 5 minutes
            console.log(`Waifu timer started for ${time} minutes`);
            setTimeout(async function () {
                let ind = getRandom(pokos, pokedb[event.threadID].taken);
                try {
                    const form = {
                        body: "A wild Pokemon appeared! Add them to your Pokemon collection by replying with the Pokemon name.",
                        attachment: await global.utils.getStreamFromURL(pokos[ind].image),
                    };
                    message.send(form, (err, info) => {
                        global.fff.push(info.messageID);
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName,
                            mid: info.messageID,
                            name: pokos[ind].name,
                            ind: ind,
                        });
                        global.poke[event.threadID] = 0;
                    });
                } catch (e) {
                    console.log(e);
                    message.reply('Server busy. Please try again later.');
                }
            }, time * 60000);
        }
    },    

onReply: async function ({ event, api, Reply, message, getLang }) {
    var pokos;
    var pokedb;

    try {
        pokos = JSON.parse(fs.readFileSync('pokos.json', 'utf8'));
    } catch (err) {
        fs.writeFileSync('pokos.json', '[]');
        pokos = [];
    }

    try {
        pokedb = JSON.parse(fs.readFileSync('pokedb.json', 'utf8'));
    } catch (err) {
        fs.writeFileSync('pokedb.json', '{}');
        pokedb = {};
    }

    if (!pokedb[event.threadID]) {
        pokedb[event.threadID] = { taken: [], usdata: {} };
    }

    if (isSimilar(event.body.toLowerCase(), Reply.name.toLowerCase(), 2)) {
        message.unsend(Reply.mid);
        pokedb[event.threadID].taken.push(Reply.ind);

        if (!pokedb[event.threadID].usdata.hasOwnProperty(event.senderID)) {
            pokedb[event.threadID].usdata[event.senderID] = [];
        }

        pokedb[event.threadID].usdata[event.senderID].push(Reply.name);
        fs.writeFile('pokedb.json', JSON.stringify(pokedb), (err) => {
            if (err) return console.error(err);
        });

        message.reply({
            body: "Well done! " + Reply.name + " is now in your Pokedex.",
            attachment: await global.utils.getStreamFromURL(pokos[Reply.ind].image),
        });
    } else {
        message.send("Wrong answer.");
    }
},   
};

function getRandomInt(arra) {
    return Math.floor(Math.random() * arra.length);
}

function getRandom(arra, excludeArrayNumbers) {
    let randomNumber;

    if (!Array.isArray(excludeArrayNumbers)) {
        randomNumber = getRandomInt(arra);
        return randomNumber;
    }

    do {
        randomNumber = getRandomInt(arra);
    } while ((excludeArrayNumbers || []).includes(randomNumber));

    return randomNumber;
}
function isSimilar(str1, str2, maxIncorrect) {
    if (str1.length !== str2.length) {
        return false;
    }

    let incorrectCount = 0;
    for (let i = 0; i < str1.length; i++) {
        if (str1[i].toLowerCase() !== str2[i].toLowerCase()) {
            incorrectCount++;
            if (incorrectCount > maxIncorrect) {
                return false;
            }
        }
    }

    return true;
}
