import OpenAI from "openai";
import fs from "fs/promises";
import { getHistorial, saveMessage } from "../db/messages.js";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const historialUsuarios = new Map();


async function gptPrompt(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
    });

    const respuestaAI = response.choices[0].message.content.trim();

    return respuestaAI;
  } catch (error) {
    console.error("❌ Error en OpenAI:", error);
    return "Lo siento, hubo un error al procesar tu mensaje con ChatGPT.";
  }
}



async function pnteIA(userId, message) {
  try {

    await saveMessage(userId, message, "user");
    const historialUser = await getHistorial(userId, 5);

    const prompt = await fs.readFile("./prompt/guiaPNTE.txt", "utf-8");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }, ...historialUser],
    });

    const respuestaAI = response.choices[0].message.content
      .trim()
      .toLowerCase();

    await saveMessage(userId, respuestaAI, "bot");

    return respuestaAI;
  } catch (error) {
    console.error("❌ Error en OpenAI:", error);
    return "Lo siento, hubo un error al procesar tu mensaje con ChatGPT.";
  }
}



// 📌 Función para interactuar con ChatGPT
async function chatGPT(userId, message, prompt) {
  if (!historialUsuarios.has(userId)) {
    historialUsuarios.set(userId, []);
  }

  const historial = historialUsuarios.get(userId);
  historial.push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt }, // Usa el prompt correcto
        ...historial,
      ],
    });

    console.log("HISTORIAL ====>", historial);

    const respuestaAI = response.choices[0].message.content.trim();
    historial.push({ role: "assistant", content: respuestaAI });

    return respuestaAI;
  } catch (error) {
    console.error("❌ Error en OpenAI:", error);
    return "Lo siento, hubo un error al procesar tu mensaje con ChatGPT.";
  }
}

export { pnteIA };
