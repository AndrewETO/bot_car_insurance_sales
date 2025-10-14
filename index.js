const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const { start_script } = require("./bot_scripts");
require("dotenv/config");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN is not set");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply(start_script(ctx.from.first_name)));
bot.help((ctx) => ctx.reply("Type something"));
bot.command("menu", (ctx) => ctx.reply(
    "Choose action: ",
    Markup.keyboard([
        ['Send passport', 'Send vehicle identification document']
    ])
    .resize()
));
bot.hears('Send passport', (ctx) => ctx.reply("You've sent a passport"));
bot.hears('Send vehicle identification document', (ctx) => ctx.reply("You've sent a vehicle identification document"));
bot.on("text", (ctx) => ctx.reply(`Your text is: ${ctx.message.text}`));
bot.on("document", (ctx) => ctx.reply("Document received.") )
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
