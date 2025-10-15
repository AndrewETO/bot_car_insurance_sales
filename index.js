const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const { start_script, handleDocument } = require("./bot_scripts");
const mindee = require('mindee');
require("dotenv/config");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN is not set");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply(start_script(ctx.from.first_name), Markup.inlineKeyboard([
    Markup.button.callback('👍 Yes', 'like_yes'),
    Markup.button.callback('👎 No', 'like_no')
  ])));
bot.action('like_yes', ctx => ctx.reply('Please upload your passport'));
bot.action('like_no', ctx => ctx.reply('See you soon, good luck!'));
bot.on("document", (ctx) => handleDocument(ctx, token));
bot
  .launch()
  .then(() => console.log("Bot started (pooling)"))
  .catch((err) => {
    console.error("Failed to lounch bot: ", err);
  });

const app = express();
app.get("/", (req, res) => res.send("Bot is working!"));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is listening port ${PORT}`));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
