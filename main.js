const { Bot, InputFile, InlineKeyboard } = require("grammy");
const fs = require("fs");
const ytdl = require("ytdl-core");
require("dotenv").config();

const botToken = process.env.TOKEN; //* Your bot token
const bot = new Bot(botToken);

bot.command("start", (ctx) => {
  ctx.reply(
    `Welcome to the bot ${ctx.from.first_name} 👋\nI'm bot that downloads videos from Youtube\nSend the video link you want to download`,
    {
      parse_mode: "Markdown",
    }
  );
});
bot.command("help", (ctx) => {
  ctx.reply(`This bot made by Nodejs`);
});

const myInlineKeyboard = new InlineKeyboard()
  .text("🎞 Video", "video")
  .text("🎵 Audio", "audio")
  .row();

bot.on("message::url", (ctx) => {
  ctx.reply("Choose your format 👇", { reply_markup: myInlineKeyboard });
  // const text = ctx.msg.text;
  global.Link = ctx.msg.text;
  global.messageId = ctx.msg.message_id;
});

bot.on("callback_query:data", async (ctx) => {
  // console.log(global.Link);
  const videoLink = global.Link;
  const messageId = ctx.msg.message_id;
  const otherMessageId = global.messageId;
  const chatId = ctx.from.id;
  console.log(ctx.callbackQuery.data);
  if (ctx.callbackQuery.data === "video") {
    setTimeout(() => {
      ctx.api.deleteMessage(chatId, otherMessageId + 1);
    }, 1800);
    ctx.reply("Downloading...\n*Please wait!*", { parse_mode: "Markdown" });
    setTimeout(() => {
      ytdl
        .getInfo(videoLink)
        .then((info) => {
          // ctx.editMessageReplyMarkup()
          const format = ytdl.chooseFormat(info.formats, {
            quality: "highest",
          });
          const outputFilePath = `${info.videoDetails.title}.mp4`;
          const outputStream = fs.createWriteStream(outputFilePath);

          ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);
          outputStream.on("finish", () => {
            console.log(`Finished downloading: ${outputFilePath}`);
            ctx.api.deleteMessage(chatId, messageId + 1);
            ctx.replyWithVideo(
              new InputFile(fs.createReadStream(outputFilePath)),
              {
                caption: `[This video downloaded](${videoLink}) by *@save_youtb_bot*`,
                parse_mode: "Markdown",
                duration: info.videoDetails.lengthSeconds,
                // thumbnail: info.videoDetails.thumbnails[4].url,
                width: info.videoDetails.embed.width,
                height: info.videoDetails.embed.height,
              }
            );
            (err) => {
              ctx.reply("Error");
            };
          });
        })
        .catch((err) => {
          console.log(err),
            ctx.api.deleteMessage(chatId, messageId + 1),
            ctx.reply(
              "You're sended invalid link❌\nPlease check link and try again"
            );
        });
    }, 3000);
  } else if (ctx.callbackQuery.data === "audio") {
    setTimeout(() => {
      ctx.api.deleteMessage(chatId, otherMessageId + 1);
    }, 1800);
    ctx.reply("Downloading...\n*Please wait!*", { parse_mode: "Markdown" });
    setTimeout(() => {
      ytdl
        .getInfo(videoLink)
        .then((info) => {
          const format = ytdl.chooseFormat(info.formats, {
            quality: "highestaudio",
          });
          const outputFilePath = `${info.videoDetails.title}.mp3`;
          const outputStream = fs.createWriteStream(outputFilePath);

          ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);
          outputStream.on("finish", () => {
            console.log(`Finished downloading: ${outputFilePath}`);
            // ctx.api.deleteMessage(chatId, messageId + 1);
            ctx.api.sendAudio(
              chatId,
              new InputFile(fs.createReadStream(outputFilePath)),
              {
                caption: `[This video downloaded](${videoLink}) by *@save_youtb_bot*`,
                parse_mode: "Markdown",
                title: `[@save_youtb_bot] ${outputFilePath}`,
                duration: info.videoDetails.lengthSeconds,
                thumbnail: info.videoDetails.thumbnails[4].url,
              }
            );
            (err) => {
              ctx.reply("Error");
            };
          });
        })
        .catch((err) => {
          console.log(err),
            ctx.api.deleteMessage(chatId, messageId + 1),
            ctx.reply("Invalid video URL❌\nPlease check URL and try again");
        });
    }, 3000);
  }
});

bot.on("message", (ctx) => {
  ctx.reply(
    `"${ctx.msg.text}" command not found!\nSend /help command to get all information about the bot`
  );
});

bot
  .start()
  .then(() => console.log("Bot is running"))
  .catch((err) => console.error(err));
