const fs = require("fs");

global.fff = [];

module.exports = {
  config: {
    name: "pokebal",
    aliases: ["pokecoins", "pokecoin", "pbal", "pcoin", "pcoins", "pokebalance"],
    version: "1.2",
    author: "nemo21712",
    countDown: 20,
    role: 0,
    shortDescription: {
      en: "view your PokéCoins"
    },
    longDescription: {
      en: "view your PokéCoins or the PokéCoins of the tagged person"
    },
    category: "🐍 Pokémon",
    guide: {
      en: "{pn}: view your PokéCoins" +
        "\n{pn} <@tag>: view the PokéCoins of the tagged person"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const pokeBalFilePath = 'pokeBal.json';

    if (!fs.existsSync(pokeBalFilePath)) {
      fs.writeFileSync(pokeBalFilePath, '[]');
    }

    const mentionedUID = Object.keys(event.mentions)[0];
    const targetUID = mentionedUID || (args[0] && args[0].replace(/[@<>]/g, '')) || event.senderID;

    const userName = (await api.getUserInfo(targetUID))[targetUID].name;

    const pokeData = JSON.parse(fs.readFileSync(pokeBalFilePath, "utf8"));

    let userIndex = -1;

    for (let i = 0; i < pokeData.length; i++) {
      if (pokeData[i].uid == targetUID) {
        userIndex = i;
        break;
      }
    }

    if (userIndex === -1) {
      global.fff.push({ uid: targetUID, money: 0 });
      fs.writeFileSync(pokeBalFilePath, JSON.stringify(pokeData), "utf8");
      userIndex = pokeData.length - 1;
    }

    const pokeBalance = pokeData[userIndex] ? pokeData[userIndex].money : 0;

    const formattedPokeBalance = parseFloat(pokeBalance);
    if (!isNaN(formattedPokeBalance)) {
      return message.reply(`❏ Name:  ${userName}\n\n❏ PokéCoins: P${formatNumberWithFullForm(formattedPokeBalance)}`);
    } else {
      return message.reply("❏ Your Poké balance is not a valid number 🥲");
    }
  }
};

// Function to format a number with full forms (e.g., 1 Thousand, 133 Million, 76.2 Billion)
function formatNumberWithFullForm(number) {
  const fullForms = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
    "Sextillion",
    "Septillion",
    "Octillion",
    "Nonillion",
    "Decillion",
    "Undecillion",
    "Duodecillion",
    "Tredecillion",
    "Quattuordecillion",
    "Quindecillion",
    "Sexdecillion",
    "Septendecillion",
    "Octodecillion",
    "Novemdecillion",
    "Vigintillion",
    "Unvigintillion",
    "Duovigintillion",
    "Tresvigintillion",
    "Quattuorvigintillion",
    "Quinvigintillion",
    "Sesvigintillion",
    "Septemvigintillion",
    "Octovigintillion",
    "Novemvigintillion",
    "Trigintillion",
    "Untrigintillion",
    "Duotrigintillion",
    "Googol",
  ];

  // Calculate the full form of the number (e.g., Thousand, Million, Billion)
  let fullFormIndex = 0;
  while (number >= 1000 && fullFormIndex < fullForms.length - 1) {
    number /= 1000;
    fullFormIndex++;
  }

  // Format the number with two digits after the decimal point
  const formattedNumber = number.toFixed(2);

  // Add the full form to the formatted number
  return `${formattedNumber} ${fullForms[fullFormIndex]}`;
}
