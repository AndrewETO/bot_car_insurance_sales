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

async function handleDocument(ctx, token) {
  try {
    const file = ctx.message.document;

    // 1️⃣ Проверка типа файла
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mime_type)) {
      return ctx.reply(
        "⚠️ Пожалуйста, отправь PDF, JPG или PNG файл паспорта."
      );
    }

    const fileId = file.file_id;
    const fileName = file.file_name || "document.pdf";

    // 2️⃣ Получаем URL файла на серверах Telegram
    const fileData = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.file_path}`;

    // 3️⃣ Скачиваем файл во временную папку
    const tempDir = path.join(__dirname, "..", "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, fileName);

    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "arraybuffer",
    });
    fs.writeFileSync(filePath, response.data);

    await ctx.reply("📄 Документ получен. Распознаю данные...");

    // 4️⃣ Отправляем файл в Mindee (паспортная модель)
    const apiResponse = await mindeeClient
      .docFromPath(filePath)
      .parse(mindee.product.PassportV1);

    // 5️⃣ Извлекаем нужные данные
    const prediction = apiResponse.document.inference.prediction;
    const givenNames = prediction.given_names?.join(" ") || "не найдено";
    const surnames = prediction.surnames?.join(" ") || "не найдено";
    const documentNumber = prediction.document_number || "не найден";

    // 6️⃣ Отправляем ответ пользователю
    await ctx.reply(
      `🧾 Результаты распознавания:\n` +
        `👤 Имя: ${givenNames}\n` +
        `🧍‍♂️ Фамилия: ${surnames}\n` +
        `#️⃣ Номер документа: ${documentNumber}`
    );

    // 7️⃣ Удаляем временный файл
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("❌ Ошибка при обработке документа:", err);
    await ctx.reply("Не удалось распознать документ. Проверь формат и качество изображения.");
  }
}

module.exports = { start_script, handleDocument };
