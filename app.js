import "dotenv/config";
import pkg from "whatsapp-web.js"; // ✅ Importar como CommonJS
import qrcode from "qrcode-terminal";
import { getIntent } from "./nlp.js";
import { startInactivityChecker, updateLastInteraction } from './db/userActivity.js';


const { Client, LocalAuth } = pkg; // Extraer Client y LocalAuth

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("📱 Escanea este QR con WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("🚀 Cliente listo.");
  startInactivityChecker(client);
});

client.on("message", async (message) => {
  // console.log(`Mensaje recibido de ${message.from}: ${message.body}`);

  try {
    if (message.hasMedia && message.type === "audio") {
      await message.reply("🎙️ Aún no está habilitada la opción de mensajes de voz, amigo empresario. Por favor, escribe tu consulta 😊.");
      return;
    }

    await updateLastInteraction(message.from);

    const chat = await message.getChat();
    await chat.sendStateTyping();
    console.log("sendStateTyping");

    setTimeout(async () => {
      const respuesta = await getIntent(message.body, message.from, client); //  Aquí pasamos el client
      console.log("respuesta");
      if (respuesta) {
       
        await client.sendMessage(message.from, respuesta);
      }
    }, 2000);
    
  } catch (error) {
    console.error("❌ Error al enviar el mensaje:", error);
  }
});

// client.initialize();

async function startClient() {
  try {
    await client.initialize();
  } catch (error) {
    console.error("❌ Error al inicializar el cliente:", error.message);

    if (error.message.includes("Execution context was destroyed")) {
      console.log("🔁 Reintentando inicialización en 3 segundos...");
      setTimeout(startClient, 3000); // Retry simple
    }
  }
}

startClient();