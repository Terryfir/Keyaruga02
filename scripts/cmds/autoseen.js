module.exports = {
  config: {
    name: "autoseen",
    version: "1.0",
    author: "Shikaki",
    countDown: 15,
    role: 0,
    shortDescription: "",
    longDescription: "",
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ()
  {},
  onChat: async function ({ api }) {
    api.markAsReadAll();
  }
}
