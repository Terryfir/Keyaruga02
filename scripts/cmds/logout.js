module.exports = {
  config: {
    name: "logout",
    version: "1.0",
    author: "Samir",
    countDown: 45,
    role: 0,
    shortDescription: "Logout Bot's Account",
    longDescription: "Logout Bot's Account",
    category: "owner",
    guide: "{p}{n}"
  },
  onStart: async function({ event, api }) {
  const permission = ["100083670401783"];
  if (!permission.includes(event.senderID)) {
    api.sendMessage("You don't have enough permission to use this command. Only lan can do it.", event.threadID, event.messageID);
    return;
  }
  api.sendMessage("Logging out...", event.threadID, event.messageID);
  api.logout();
}
};