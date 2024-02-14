const { Bot, InputFile } = require("grammy");
const fs = require("fs");
const ytdl = require("ytdl-core");
const path = require("path");
require("dotenv").config();

const botToken = process.env.TOKEN; //* Your bot token
const bot = new Bot(botToken);

bot.command("start", (ctx) => {
  ctx.reply("Welcome " + ctx.from.first_name);
});

bot.on("message::url", (ctx) => {
  const text = ctx.msg.text;

  ytdl
    .getInfo(text)
    .then((info) => {
      const format = ytdl.chooseFormat(info.formats, {
        quality: "highest",
      });

      const outputFilePath = `${path.join(
        __dirname,
        info.videoDetails.title
      )}.mp4`;
      const outputStream = fs.createWriteStream(outputFilePath);

      ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);
      outputStream.on("finish", () => {
        console.log(`Finished downloading: ${outputFilePath}`);
        ctx.replyWithVideo(
          new InputFile(
            fs.createReadStream(outputFilePath, {
              caption: `[This video downloaded](${text}) by *@save_youtb_bot*`,
              parse_mode: "Markdown",
              duration: info.videoDetails.lengthSeconds,
              thumbnail: info.videoDetails.thumbnails[4].url,
              width: info.videoDetails.embed.width,
              height: info.videoDetails.embed.height,
            })
          )
        );
      });

      setTimeout(() => {
        fs.unlink(outputFilePath, (err) => {
          if (err) {
            throw err;
          } else {
            console.log("File deleted");
          }
        });
      }, 300000);
    })
    .catch((err) => console.log(err));
});

bot.start(() => {console.log("Bot started")})