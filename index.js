const { Telegraf } = require("telegraf");
const express = require("express");
require("dotenv/config");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN is not set");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply(`Hi, ${ctx.from.first_name || "friend"}!`));
bot.help((ctx) => ctx.reply("Type something"));
bot.on('text', ctx => ctx.reply(`Ты написал: ${ctx.message.text}`));

bot
  .launch()
  .then(() => console.log("Bot started (pooling)"))
  .catch((err) => {
    console.error("Failed to lounch bot: ", err);
  });

const app = express()
app.get("/", (req, res) => res.send("Bot is working!"));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is listening port ${PORT}`))

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
