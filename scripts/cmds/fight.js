const TIMEOUT_SECONDS = 120;

const ongoingFights = new Map();
const gameInstances = new Map();

module.exports = {
  config: {
    name: "fight",
    version: "1.0.1",
    author: "Shikaki",
    countDown: 10,
    role: 0,
    shortDescription: {
      vi: "",
      en: "Fight with your friends!",
    },
    longDescription: {
      vi: "",
      en: "Challenge your friends to a fight and see who wins!",
    },
    category: "🎮 Game",
    guide: "{prefix}fight @mention",
  },

  onStart: async function ({ event, message, api, usersData, args }) {
    const threadID = event.threadID;

    
    if (ongoingFights.has(threadID)) {
      return message.send("⚔️ A fight is already in progress in this group.");
    }

    const mention = Object.keys(event.mentions);

    if (mention.length !== 1) {
      return message.send("🤔 Please mention one person to start a fight with.");
    }

    const challengerID = event.senderID;
    const opponentID = mention[0];

    const challenger = await usersData.getName(challengerID);
    const opponent = await usersData.getName(opponentID);

    
    const fight = {
      participants: [],
      currentPlayer: null,
      threadID: threadID,
      startTime: null, 
    };

    fight.participants.push({
      id: challengerID,
      name: challenger,
      hp: 100, 
    });
    fight.participants.push({
      id: opponentID,
      name: opponent,
      hp: 100, 
    });

    
    const gameInstance = {
      fight: fight,
      lastAttack: null,
      lastPlayer: null,
      timeoutID: null, 
      turnMessageSent: false, 
    };

    
    gameInstance.fight.currentPlayer = Math.random() < 0.5 ? challengerID : opponentID;

    
    gameInstances.set(threadID, gameInstance);

    
    startFight(message, fight);

    
    startTimeout(threadID, message);
  },

  
  onChat: async function ({ event, message }) {
    const threadID = event.threadID;
  
    const gameInstance = gameInstances.get(threadID);
  
    if (!gameInstance || !gameInstance.fight) return;
  
    const currentPlayerID = gameInstance.fight.currentPlayer;
  
    // Check if the sender is part of the ongoing fight
    if (!gameInstance.fight.participants.some((p) => p.id === event.senderID)) {
      return;
    }
  
    const currentPlayer = gameInstance.fight.participants.find(
      (p) => p.id === currentPlayerID
    );
  
    const attack = event.body.trim().toLowerCase();
  
    const isCurrentPlayer = event.senderID === currentPlayerID;
  
    if (gameInstance.lastAttack !== null && !isCurrentPlayer) {
      message.reply(
        `😒 It's ${currentPlayer.name}'s turn currently. You can't attack until they make a move.`
      );
      return;
    }
  
    if (!isCurrentPlayer && gameInstance.lastPlayer.id === event.senderID) {
      message.send(
        `👎 It's ${currentPlayer.name}'s turn currently. You can't attack until they make a move.`
      );
      return;
    }
  
    if (!isCurrentPlayer) {
      if (!gameInstance.turnMessageSent) {
        const opponentName = gameInstance.fight.participants.find(
          (p) => p.id !== event.senderID
        ).name;
        const turnMessage = `It's ${currentPlayer.name}'s turn.`;
        message.prepare(turnMessage, event.senderID);
  
        gameInstance.turnMessageSent = true;
      }
      return;
    }

    
    if (attack === "forfeit") {
      const forfeiter = currentPlayer.name;
      const opponent = gameInstance.fight.participants.find(
        (p) => p.id !== currentPlayerID
      ).name;
      message.send(`🏃 ${forfeiter} forfeits the match! ${opponent} wins!`);
      endFight(threadID);
    } else if (["kick", "punch", "slap"].includes(attack)) {
      
      const damage = Math.random() < 0.1 ? 0 : Math.floor(Math.random() * 20 + 10);

      
      const opponent = gameInstance.fight.participants.find((p) => p.id !== currentPlayerID);
      opponent.hp -= damage;

      
      message.send(
        `🥊 ${currentPlayer.name} attacks ${opponent.name} with ${attack} and deals ${damage} damage.\n\nNow, ${opponent.name} has ${opponent.hp} HP, and ${currentPlayer.name} has ${currentPlayer.hp} HP.`
      );

      
      if (opponent.hp <= 0) {
        const winner = currentPlayer.name;
        const loser = opponent.name;
        message.send(`⏰ Time's up! The game is over. ${winner} wins! ${loser} is defeated.`);
        endFight(threadID);
      } else {
        
        gameInstance.fight.currentPlayer =
          currentPlayerID === gameInstance.fight.participants[0].id
            ? gameInstance.fight.participants[1].id
            : gameInstance.fight.participants[0].id;
        const newCurrentPlayer = gameInstance.fight.participants.find(p => p.id === gameInstance.fight.currentPlayer);

        
        gameInstance.lastAttack = attack;
        gameInstance.lastPlayer = currentPlayer;

        
        gameInstance.turnMessageSent = false;

        
        message.send(`🥲 It's ${newCurrentPlayer.name}'s turn currently.`);
      }
    } else {
      message.reply(
        "❌ Invalid attack! Use 'kick', 'punch', 'slap', or 'forfeit'."
      );
    }
  }

};


function startFight(message, fight) {
  ongoingFights.set(fight.threadID, fight);

  const currentPlayer = fight.participants.find(p => p.id === fight.currentPlayer);
  const opponent = fight.participants.find(p => p.id !== fight.currentPlayer);

  
  const attackList = ["kick", "punch", "slap", "forfeit"];
  
  message.send(
    `${currentPlayer.name} has challenged ${opponent.name} to a duel!\n\n${currentPlayer.name} has ${currentPlayer.hp} HP, and ${opponent.name} has ${opponent.hp} HP.\n\nIt's ${currentPlayer.name}'s turn currently.\n\nAvailable attacks: ${attackList.join(', ')}`
  );
}


function startTimeout(threadID, message) {
  const timeoutID = setTimeout(() => {
    const gameInstance = gameInstances.get(threadID);
    if (gameInstance) {
      const currentPlayer = gameInstance.fight.participants.find(
        (p) => p.id === gameInstance.fight.currentPlayer
      );
      const opponent = gameInstance.fight.participants.find(
        (p) => p.id !== gameInstance.fight.currentPlayer
      );
      const winner = currentPlayer.hp > opponent.hp ? currentPlayer : opponent;
      const loser = currentPlayer.hp > opponent.hp ? opponent : currentPlayer;

      message.send(
        `Time's up! The game is over. ${winner.name} has more HP, so ${winner.name} wins! ${loser.name} is defeated.`
      );

      
      endFight(threadID);
    }
  }, TIMEOUT_SECONDS * 1000); 

  
  gameInstances.get(threadID).timeoutID = timeoutID;
}


function endFight(threadID) {
  ongoingFights.delete(threadID);
  
  const gameInstance = gameInstances.get(threadID);
  if (gameInstance && gameInstance.timeoutID) {
    clearTimeout(gameInstance.timeoutID);
  }
  
  gameInstances.delete(threadID);
}