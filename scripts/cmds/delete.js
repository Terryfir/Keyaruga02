const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "delete",
    aliases: ["d"],
    version: "1.6",
    author: "Subash",
    countDown: 1,
    role: 2,
    category: "utility",
    shortDescription: "Delete files and images",
    longDescription: "Clean cache & delete specific files or delete downloaded images.",
    
    guide: {
      en: "{pn} (Clean cache and temp files)\n {pn} <file.js> (Deletes specific command)\n {pn} images (Deletes downloaded images)"
    },
  },

  onStart: async function ({ args, api, event }) {
    const directoriesToDelete = ['cache', 'tmp'];
    const fileName = args[0];

    try {
      if (fileName === "images") {
        const imagesFolder = path.join('downloads', 'images');
        
        if (fs.existsSync(imagesFolder)) {
          const imageFiles = fs.readdirSync(imagesFolder);

          if (imageFiles.length === 0) {
            api.sendMessage("🚫 The 'downloads/images' folder is already empty.", event.threadID);
          } else {
            for (const imageFile of imageFiles) {
              const imagePath = path.join(imagesFolder, imageFile);
              fs.unlinkSync(imagePath);
            }
            api.sendMessage("✅ All downloaded images have been deleted.", event.threadID);
          }
        } else {
          api.sendMessage("❎ The 'downloads/images' folder does not exist.", event.threadID);
        }
      } else if (fileName) {
        const filePath = path.join(__dirname, fileName);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            api.sendMessage(`❎ | Failed to delete ${fileName}.`, event.threadID);
            return;
          }
          api.sendMessage(`✅ | Deleted successfully! ${fileName}`, event.threadID);
        });
      } else {
        console.log("Starting cleanup process...");
        for (const directory of directoriesToDelete) {
          const directoryPath = path.join(__dirname, directory);
          const files = fs.readdirSync(directoryPath);

          for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isFile()) {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filePath}`);
            }
          }
        }
        console.log("Cleanup process completed successfully!");

        const deletedFilesCount = directoriesToDelete.reduce((total, dir) => {
          const directoryPath = path.join(__dirname, dir);
          const files = fs.readdirSync(directoryPath);
          return total + files.length;
        }, 0);

        api.sendMessage(`✅|Deleted all caches and temp files \nfrom the system 💻 Directories|🗂.`, event.threadID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage(`An error occurred: ${err.message}`, event.threadID);
    }
  }
};