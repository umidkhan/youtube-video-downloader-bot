const axios = require("axios");
const { Bot, InputFile } = require("grammy");
const fs = require("fs");
const ytdl = require("ytdl-core");
require("dotenv").config();

const botToken = process.env.TOKEN; //! Your bot token
const bot = new Bot(botToken);

bot.command("start", (ctx) => {
  ctx.reply(`Welcome to the bot ${ctx.from.first_name} 👋`, {parse_mode: "Markdown"});
});

bot.on("message::url", (ctx) => {
  ctx.reply("Downloading...\n*Please wait!*", { parse_mode: "Markdown" });
  const text = ctx.msg.text;
  const messageId = ctx.msg.message_id;
  const chatId = ctx.from.id;

  setTimeout(() => {
    ytdl
      .getInfo(text)
      .then((info) => {
        const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
        const outputFilePath = `${info.videoDetails.title}.mp4`;
        const outputStream = fs.createWriteStream(outputFilePath);

        ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);
        outputStream.on("finish", () => {
          console.log(`Finished downloading: ${outputFilePath}`);
          ctx
            .replyWithVideo(
              new InputFile(fs.createReadStream(outputFilePath)),
              { caption: "by @" }
            )
            .catch((err) => {
              ctx.reply("Error!"), console.error(err);
            });
        });
        ctx.api.deleteMessage(chatId, messageId + 1);
        console.log(outputFilePath);
      })
      .catch(
        (err) => console.error(err),
        ctx.reply("I can't download this video!")
      );
  }, 3000);
});

bot
  .start()
  .then(() => console.log("Bot is running"))
  .catch((err) => console.error(err));
