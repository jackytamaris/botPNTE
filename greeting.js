import { newActionBot } from "./db/users.js";
import { greetingStiker } from "./greetingstiker.js";
import { pnteIA } from "./ia/openai.js";
import { adviser } from "./adviserrequest.js";


const stateRequest = new Map();


async function menuOptions(tipo) {
  if (tipo === "menu") {
    return "Tengo estas opciones para ayudarte ❤️ \n \n1️⃣ Información sobre formalización\n2️⃣ Costos y beneficios\n3️⃣ Dónde y cómo formalizar\n4️⃣ Preguntar al Asistente Virtual \n5️⃣ Contactar con un asesor empresarial del Programa\n\nPor favor, responde con el número de la opción que deseas.";
  }
  return "No hay información disponible.";
}

async function showGreeting(userId, client) {

  const greetingMessage = "¡Hola! 😊 Soy el asistente virtual del PNTE, estoy aquí para ayudarte a formalizar tu negocio en Perú. ¿En qué puedo asistirte hoy? 🏢✨";
  await client.sendMessage(userId, greetingMessage);

  setTimeout(async () => {
    let opciones = await menuOptions("menu");
    await client.sendMessage(userId, opciones);
  }, 1000);

  stateRequest.set(userId, "esperando_opcion");

}


async function showOptions(userId, text, client) {
  switch (text.trim()) {
    case "1":
      await newActionBot(userId, 2);
      await client.sendMessage(
        userId,
        await pnteIA(userId, "Me brindas información sobre que es la formalización")
      );
      break;
    case "2":
      await newActionBot(userId, 2);
      await client.sendMessage(
        userId,
        await pnteIA(userId, "¿Cuáles son los costos y beneficios?")
      );
      break;
    case "3":
      await newActionBot(userId, 2);
      await client.sendMessage(
        userId,
        await pnteIA(userId, "Dónde y cómo formalizar mi empresa?")
      );
      break;

    case "4":
      await greetingStiker(userId, client, 'Me puedes ayudar');
      break;

    case "5":
      await newActionBot(userId, 3);
      await adviser(userId, client);
      break;

    default:
      await client.sendMessage(
        userId,
        // " No entendí tu opción. Escribe el número de la opción que deseas (1, 2, 3, 4 o 5)."
        "👆 Elige una de las opciones para continuar."
      );
      return;
  }

  stateRequest.delete(userId);
}

export { showGreeting, stateRequest, showOptions };
