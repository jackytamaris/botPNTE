import fs from "fs/promises";
import pkg from "whatsapp-web.js";
import { pnteIA } from "./ia/openai.js";
import { newActionBot } from "./db/users.js";
const { MessageMedia } = pkg;

async function greetingStiker(userId, client, text) {
  const stickerPath = "./asset/ai-robot.webp";
  try {
    await fs.access(stickerPath);
    const stickerMedia = MessageMedia.fromFilePath(stickerPath);

    await client.sendMessage(userId, stickerMedia, {
      sendMediaAsSticker: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await pnteIA(userId, text);

    await client.sendMessage(userId, response);

    await newActionBot(userId, 2);  // 2 = FAQ


  } catch (err) {
    console.error("❌ No se encontró el archivo del sticker:", err);
    await client.sendMessage(userId, "⚠️ No se encontró el sticker.");
  }
}

export { greetingStiker };