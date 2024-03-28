const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};
const fs = require("fs");
module.exports = {
  config: {
    name: "welcome",
    version: "1.5",
    author: "NTKhang",
    category: "events"
  },

  langs: {
    vi: {},
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      welcomeMessage: "😈✅",
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage: `Good {session} {userName} `
    }
  },
  onLoad: async function () {
    const dataPath = __dirname + "/cache/approvedThreads.json";
    const pendingPath = __dirname + "/cache/pendingThreads.json";
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([]));
    }
    if (!fs.existsSync(pendingPath)) {
      fs.writeFileSync(pendingPath, JSON.stringify([]));
    }
  },
  onStart: async ({ threadsData, message, event, api, getLang }) => {
    const { threadID, messageID, senderID } = event;
    const dataPath = __dirname + "/cache/approvedThreads.json";
    const pendingPath = __dirname + "/cache/pendingThreads.json";
    let data = JSON.parse(fs.readFileSync(dataPath));
    let pending = JSON.parse(fs.readFileSync(pendingPath));
    let idBox = event.threadID || threadID;
    const threadData = await threadsData.get(idBox);
    const threadName = threadData.threadName;
    if (event.logMessageType == "log:subscribe")
      return async function () {
        const hours = getTime("HH");
        const { threadID } = event;
        const { nickNameBot } = global.GoatBot.config;
        const prefix = global.utils.getPrefix(threadID);
        const dataAddedParticipants = event.logMessageData.addedParticipants;
        // if new member is bot
        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
          if (nickNameBot) {
            if (!data.includes(idBox)) {
              api.sendMessage({ body: `🚫 | You added the bot without permission!!!!🖕🖕\n\nBot will automatically leave the gc in 30s\n\nYou will need to get approval from admin\n\nYou may contact admin in his gc,to join the gc type !support`, attachment: fs.createReadStream(`test.jpeg`)  }, idBox, () => {
                setTimeout(() => {
                  api.removeUserFromGroup(api.getCurrentUserID(), idBox);
                }, 30000);
              });
            } else {
              api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
              api.sendMessage({ body:  `✅ | Connected successfully!`, attachment: fs.createReadStream(`test2.jpeg`) }, idBox);
            }
            return;
          }
        }
        // if new member:
        if (!global.temp.welcomeEvent[threadID])
          global.temp.welcomeEvent[threadID] = {
            joinTimeout: null,
            dataAddedParticipants: []
          };

        global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
        clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

        global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
          const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
          const threadData = await threadsData.get(threadID);
          const dataBanned = threadData.data.banned_ban || [];
          if (threadData.settings.sendWelcomeMessage == false)
            return;
          const threadName = threadData.threadName;
          const userName = [],
            mentions = [];
          let multiple = false;

          if (dataAddedParticipants.length > 1)
            multiple = true;

          for (const user of dataAddedParticipants) {
            if (dataBanned.some((item) => item.id == user.userFbId))
              continue;
            userName.push(user.fullName);
            mentions.push({
              tag: user.fullName,
              id: user.userFbId
            });
          }
          // {userName}:   name of new member
          // {multiple}:
          // {boxName}:    name of group
          // {threadName}: name of group
          // {session}:    session of day
          if (userName.length == 0) return;
          let { welcomeMessage = getLang("defaultWelcomeMessage") } =
            threadData.data;
          const form = {
            mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
          };
          welcomeMessage = welcomeMessage
            .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
            .replace(/\{boxName\}|\{threadName\}/g, threadName)
            .replace(
              /\{multiple\}/g,
              multiple ? getLang("multiple2") : getLang("multiple1")
            )
            .replace(
              /\{session\}/g,
              hours <= 10
                ? getLang("session1")
                : hours <= 12
                  ? getLang("session2")
                  : hours <= 18
                    ? getLang("session3")
                    : getLang("session4")
            );

          form.body = welcomeMessage;

          if (threadData.data.welcomeAttachment) {
            const files = threadData.data.welcomeAttachment;
            const attachments = files.reduce((acc, file) => {
              acc.push(drive.getFile(file, "stream"));
              return acc;
            }, []);
            form.attachment = (await Promise.allSettled(attachments))
              .filter(({ status }) => status == "fulfilled")
              .map(({ value }) => value);
          }
          message.send(form);
          delete global.temp.welcomeEvent[threadID];
        }, 1500);
      };
  }
};
        
