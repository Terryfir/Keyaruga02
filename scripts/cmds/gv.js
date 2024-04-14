const { google } = require("googleapis");
const dotenv = require("dotenv");
const stream = require("stream");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const ffmpeg = require('fluent-ffmpeg');
const installer = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(installer.path);

dotenv.config({ override: true });

const API_KEY = "AIzaSyCMNN7MN-KCaiBPIc6rATi7wYOgb3CQGZY";
const model = "gemini-1.5-pro-latest";
const GENAI_DISCOVERY_URL = `https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta&key=${API_KEY}`;

let lastVideoUrl = null; 
let videoUrl;
let uid;
let framesDir;

function setUID(newUID) {
  uid = newUID;
}

function getFramesDir() {
  return `frame/${uid}`;
}

async function checkAndCreateFramesDir() {
  framesDir = getFramesDir();
  console.log(uid);

  return new Promise((resolve, reject) => {
    fs.access(framesDir, fs.constants.F_OK, (err) => {
      if (err) {
        fs.mkdir(framesDir, { recursive: true }, (err) => {
          if (err) {
            console.error('Error creating directory:', err);
            reject(err);
          } else {
            console.log('Directory created successfully');
            resolve();
          }
        });
      } else {
        console.log('Directory already exists');
        resolve();
      }
    });
  });
}

async function downloadVideo(videoUrl, uid) {
  const response = await fetch(videoUrl);
  const videoDir = path.join('video', `${uid}`);
  const videoPath = path.join(videoDir, `${uid}.mp4`);

  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const writer = fs.createWriteStream(videoPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return videoPath;
}

async function extractAudio(videoPath) {
  const audioDir = path.join('audio', `${uid}`);
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const audioPath = path.join(audioDir, `${uid}.mp3`);

    ffmpeg(videoPath)
      .outputOptions([
        '-vn',
        '-acodec libmp3lame', 
        '-b:a 128k',
      ])
      .output(audioPath)
      .on('end', () => {
        console.log('Audio extraction complete!');
        resolve({ videoPath, audioPath });
      })
      .on('error', (err) => {
        console.error('Error extracting audio:', err);
        reject(err);
      })
      .run();
  });
}




async function extractFrames(videoPath, framesDir) {
  const frameFiles = [];

  const existingFrames = fs.readdirSync(framesDir);
  if (existingFrames.length > 0 && videoUrl.trim() === lastVideoUrl?.trim()) {
    console.log("Using existing frames from the frames directory.");
    existingFrames.forEach((frame) => {
      frameFiles.push({ path: path.join(framesDir, frame) });
    });
    return frameFiles;
  }

  function secondsToHMS(seconds) {
    const pad = (num) => ("0" + num).slice(-2);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, async (err, metadata) => {
      if (err) {
        console.error('Error probing video:', err);
        reject(err);
        return;
      }

      const duration = metadata.format.duration;
      const totalFrames = Math.ceil(duration * 2);

      for (let i = 1; i <= totalFrames; i++) {
        const timestampInSeconds = i / 2; 
        const timestamp = secondsToHMS(timestampInSeconds);

        const frameFilePath = path.join(framesDir, `${timestamp}.png`);

        await new Promise((resolve, reject) => {
          ffmpeg(videoPath)
            .on('error', (err) => {
              console.error('Error extracting frames:', err);
              reject(err);
            })
            .on('end', resolve)
            .screenshots({
              count: 1,
              folder: framesDir,
              filename: `${timestamp}.png`,
              timestamps: [timestamp],
            });
        });

        console.log(`Extracted frame ${i}/${totalFrames} at timestamp ${timestamp}`);
        frameFiles.push({
          path: frameFilePath,
          timestamp: timestamp
        });
      }

      console.log('Frames extracted successfully');
      resolve();
    });
  });

  return frameFiles;
}

async function getTextGeminiFromVideo(prompt, temperature, frameFiles, audioPath, uid) {
  const timestampsFilePath = `${uid}_timestamps.json`;

  let savedTimestamps = {};
  try {
    savedTimestamps = JSON.parse(fs.readFileSync(timestampsFilePath, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading timestamps:', err);
    }
  }

  const genaiService = await google.discoverAPI({ url: GENAI_DISCOVERY_URL });
  const auth = new google.auth.GoogleAuth().fromAPIKey(API_KEY);

  const fileData = [];

  if (frameFiles.length > 0) {
    console.log("Uploading existing frames from the frames directory.");
    fileData.push(
      ...(await Promise.all(
        frameFiles.map(async (frame) => {
          const timestamp = savedTimestamps[frame.path] || frame.timestamp;
          savedTimestamps[frame.path] = timestamp;

          const imageBase64 = fs.readFileSync(frame.path, { encoding: 'base64' });
          const bufferStream = new stream.PassThrough();
          bufferStream.end(Buffer.from(imageBase64, "base64"));

          const media = {
            mimeType: "image/png",
            body: bufferStream,
          };

          const displayName = `${path.basename(frame.path)}_${timestamp}`;

          const createFileResponse = await genaiService.media.upload({
            media: media,
            auth: auth,
            requestBody: { file: { displayName: displayName } },
          });

          const file = createFileResponse.data.file;
          console.log("Uploaded File Information:");
          console.log(file);

          return { file_uri: file.uri, mime_type: file.mimeType };
        })
      ))
    );
  }

  if (audioPath) {
    console.log("Uploading audio file.");
    const audioBase64 = fs.readFileSync(audioPath, { encoding: 'base64' });
    const audioBufferStream = new stream.PassThrough();
    audioBufferStream.end(Buffer.from(audioBase64, "base64"));

    const audioMedia = {
      mimeType: "audio/mpeg", 
      body: audioBufferStream,
    };

    const createAudioFileResponse = await genaiService.media.upload({
      media: audioMedia,
      auth: auth,
      requestBody: { file: { displayName: path.basename(audioPath) } },
    });

    const audioFile = createAudioFileResponse.data.file;
    console.log("Uploaded Audio File Information:");
    console.log(audioFile);

    fileData.push({ file_uri: audioFile.uri, mime_type: audioFile.mimeType });
  }

  var timeStamp = frameFiles.map(frame => savedTimestamps[frame.path]).join(',');

  var promptWithTimestamp = `timestamp= ${timeStamp} : ${prompt}`;

  console.log("Prompt with Timestamps:");
  console.log(promptWithTimestamp);

  const contents = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptWithTimestamp }, ...fileData.map((data) => ({ file_data: data }))],
      },
    ],
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
    generation_config: {
      maxOutputTokens: 4096,
      temperature: temperature || 0.5,
      topP: 0.8,
    },
  };

  const generateContentResponse = await genaiService.models.generateContent({
    model: `models/${model}`,
    requestBody: contents,
    auth: auth,
  });

  fs.writeFileSync(timestampsFilePath, JSON.stringify(savedTimestamps));

  return generateContentResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
}


function createDirectoryStructure(videoDir, framesDir) {
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }
}



function loadLastVideoUrl(uid) {
  const filePath = path.join('uids', `${uid}_urls.json`);
  try {
    const data = fs.readFileSync(filePath);
    const urls = JSON.parse(data);
    return urls[0]; 
  } catch (error) {
    return null;
  }
}

function saveLastVideoUrl(uid, videoUrl) {
  const filePath = path.join('uids', `${uid}_urls.json`);
  const urls = [videoUrl]; 
  fs.writeFileSync(filePath, JSON.stringify(urls));
}


function deleteFrames(framesDir) {
  const files = fs.readdirSync(framesDir);
  for (const file of files) {
    fs.unlinkSync(path.join(framesDir, file));
  }
}

async function describeVideo(videoUrl, prompt, reply = false, uid) {
  let lastVideoUrl = loadLastVideoUrl(uid);
  let frameFiles = [];
  let audioPath;

  if (videoUrl.trim() !== lastVideoUrl?.trim()) {
    deleteFrames(framesDir);
    lastVideoUrl = videoUrl;
    saveLastVideoUrl(uid, videoUrl);
    const videoPath = await downloadVideo(videoUrl, uid);
    ({ audioPath } = await extractAudio(videoPath));
    frameFiles = await extractFrames(videoPath, framesDir);
  } else {
    console.log("Using existing frames from the frames directory.");
    const existingFrames = fs.readdirSync(framesDir);
    const videoPath = await downloadVideo(videoUrl, uid);
    ({ audioPath } = await extractAudio(videoPath));
    if (existingFrames.length > 0) {
      existingFrames.forEach((frame) => {
        frameFiles.push({ path: path.join(framesDir, frame), filename: frame });
      });

    }
  }

  const description = await getTextGeminiFromVideo(prompt, 0.5, frameFiles, audioPath);
  return description;
}

module.exports = {
    config: {
        name: "gv",
        version: "1.1.10",
        author: "Shikaki",
        countDown: 10,
        role: 0,
        description: { en: "text and video input and text outout using Google Gemini 1.5 pro" },
        guide: { en: "{pn} <question>\n\nreply this to any video\n{pn} <if any additional question>" },
        category: "ai",
    },
    onStart: async function ({ api, message, event, args, commandName }) {
            prompt = args.join(" ");
            uid = event.senderID;
            setUID(uid);
            await checkAndCreateFramesDir();
            if (event.type === "message_reply") {
                api.setMessageReaction("⌛", event.messageID, () => { }, true);
                try {
                    videoUrl = event.messageReply.attachments[0]?.url;
                    if (videoUrl) {
                        let description = await describeVideo(videoUrl, prompt, true, uid)
                        message.reply(description, (err, info) => {
                            if (!err) {
                                global.GoatBot.onReply.set(info.messageID, {
                                    commandName,
                                    messageID: info.messageID,
                                    author: event.senderID,
                                });
                            }
                        });
                        api.setMessageReaction("✅", event.messageID, () => { }, true);
                    }
                    else {
                        message.reply("Video URL not found");
                    }
                } catch (error) {
                    message.reply(`${error.message}`);
                    api.setMessageReaction("❌", event.messageID, () => { }, true);
                };
            }
        else {
            return;
        }
    },
    onReply: async function ({ api, message, event, Reply, args }) {
        prompt = args.join(" ");
        uid = event.senderID;
        setUID(uid);
        await checkAndCreateFramesDir();
        let question = args.join(" ");
        let { author, commandName } = Reply;
        let currentVideoUrl = loadLastVideoUrl(uid)
        console.log(loadLastVideoUrl(uid));
        console.log(currentVideoUrl);
        if (event.senderID !== author) return;
        api.setMessageReaction("⌛", event.messageID, () => { }, true);
        try {
            prompt = question.trim() === "" ? "" : question;

            let description = await describeVideo(currentVideoUrl, prompt, true, uid);
            message.reply(description, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID,
                    });
                }
            });
            api.setMessageReaction("✅", event.messageID, () => { }, true);
        } catch (error) {
            message.reply(`${error.message}`);
            api.setMessageReaction("❌", event.messageID, () => { }, true);
        };
    }

}
