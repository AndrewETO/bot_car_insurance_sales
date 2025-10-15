const fs = require("fs");
const path = require("path");
const axios = require("axios");
const mindee = require("mindee");
require("dotenv/config");

const mindeeClient = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY });

function start_script(name) {
  return `Hi, ${name}, I am Car Insurance bot! 
A'll be happy to assist you with car insurance purchasing!
Would you like to proceed further?`;
}

/**
 * Обработка документа, отправленного пользователем.
 * Сохраняет файл, отправляет в Mindee OCR и возвращает распознанный текст.
 */
async function handleDocument(ctx, token) {
  try {
    const file = ctx.message.document;

    // 1️⃣ Проверка формата
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mime_type)) {
      return ctx.reply("⚠️ Пожалуйста, отправь PDF, JPG или PNG документ.");
    }

    // 2️⃣ Получаем ссылку на файл
    const fileData = await ctx.telegram.getFile(file.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.file_path}`;
    const fileName = file.file_name || "document.pdf";

    // 3️⃣ Скачиваем документ
    const tempDir = path.join(__dirname, "..", "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, fileName);

    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "arraybuffer",
    });
    fs.writeFileSync(filePath, response.data);

    await ctx.reply("📥 Документ получен. Распознаю...");

    // 4️⃣ Отправляем в Mindee (универсальное OCR)
    const inputDoc = mindeeClient.docFromPath(filePath);

    // ⚙️ Универсальный OCR (распознает текст без конкретной модели)
    const apiResponse = await mindeeClient.parse(inputDoc);

    // 5️⃣ Формируем ответ
    const result = apiResponse?.document?.inference?.pages
      ?.map((p) => p?.content)
      ?.join("\n\n");

    if (result && result.trim().length > 0) {
      const chunks = result.match(/.{1,4000}/gs); // ограничение Telegram
      for (const chunk of chunks) {
        await ctx.reply("📋 Распознанный текст:\n" + chunk);
      }
    } else {
      await ctx.reply("🤔 Не удалось распознать текст. Попробуй фото получше или другой формат.");
    }

    // 6️⃣ Удаляем временный файл
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("❌ Ошибка при обработке документа:", err.message);
    if (err.response?.data) console.error("🧩 Ответ Mindee:", err.response.data);
    await ctx.reply("⚠️ Не удалось распознать документ. Проверь формат и качество изображения.");
  }
}

module.exports = { start_script, handleDocument };
