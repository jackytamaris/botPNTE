import { getDataUser, newActionBot, updateUserStatus } from "./db/users.js";
import { newRequest, checkActiveRequest } from "./db/requests.js";

const sessions = new Map();

export async function adviser(userId, client) { 
  const context = { userId, client };

  if (await hasActiveRequest(context)) return;

  await initializeSession(context);
  await handleUserFlow(context);
}

async function hasActiveRequest({ userId, client }) {
  if (await checkActiveRequest(userId)) {
    await client.sendMessage(
      userId, 
      "📩 Tu solicitud ya está en curso. Un asesor te contactará lo antes posible."
    );
    return true;
  }
  return false;
}

async function initializeSession({ userId, client }) {

    client.removeAllListeners('message');
  
  if (!sessions.has(userId)) {
    sessions.set(userId, { number_document: null, name: null, details: null });
  }
}

async function handleUserFlow(context) {
  const { userId } = context;
  let userData = await getDataUser(userId);
  const session = sessions.get(userId);

  context.session = session;

  if (!userData.number_document) {
    await requestDocument(context);
  } else if (!userData.name) {
    session.number_document = userData.number_document;
    await requestName(context);
  } else {
    session.number_document = userData.number_document;
    session.name = userData.name;
    await requestDetails(context);
  }
}

async function requestDocument({ userId, client, session }) {
  try {
    let userData = await getDataUser(userId);

    if (userData.status === 'inactive') {
      await updateUserStatus(userId, 'active');
      await client.sendMessage(
        userId,
        "Me alegra que estés de vuelta. Para conectar con un asesor del programa Tu Empresa, por favor ingresa tu número de documento:"
      );
      return; // Salimos de la función después de enviar el mensaje combinado
    }
  } catch (error) {
    console.log("Error en requestDocument:", error);
  }

  // Este mensaje solo se envía para usuarios activos que no tienen documento registrado
  if (!session.number_document) {
    await client.sendMessage(
      userId,
      "Para conectar con un asesor del programa Tu Empresa, por favor ingresa tu número de documento:"
    );
  }

  return new Promise((resolve) => {
    const messageHandler = async (msg) => {
      if (msg.from !== userId) return;
      
      client.off('message', messageHandler);
      session.number_document = msg.body;

      try {
        let userData = await getDataUser(userId);
        
        // Eliminamos esta parte redundante que causaba la duplicación
        if (userData.status === 'active') {
          resolve(await confirmDocument({ userId, client, session }));
        }
      } catch (error) {
        console.log("Error al procesar documento:", error);
        resolve();
      }
    };

    client.on('message', messageHandler);
  });
}

async function confirmDocument({ userId, client, session }) {
  await client.sendMessage(
    userId,
    `Confirmas que tu número de documento es ${session.number_document}? Responde con "si" o "no".`
  );

  return new Promise((resolve) => {
    const messageHandler = async (msg) => {
      if (msg.from !== userId) return;
      
      client.off('message', messageHandler);
      
      if (msg.body.toLowerCase() === "si") {
        await client.sendMessage(userId, "Continuemos.");
        resolve(await requestName({ userId, client, session }));
      } else {
        session.number_document = null;
        resolve(await requestDocument({ userId, client, session }));
      }
    };

    client.on('message', messageHandler);
  });
}

async function requestName({ userId, client, session }) {
  await client.sendMessage(userId, "Por favor, indícanos cuál es tu nombre:");

  return new Promise((resolve) => {
    const messageHandler = async (msg) => {
      if (msg.from !== userId) return;
      
      client.off('message', messageHandler);
      session.name = msg.body;
      resolve(await confirmName({ userId, client, session }));
    };

    client.on('message', messageHandler);
  });
}

async function confirmName({ userId, client, session }) {
  await client.sendMessage(
    userId,
    `Confirmas que tu nombre es ${session.name}? Responde con "si" o "no".`
  );

  return new Promise((resolve) => {
    const messageHandler = async (msg) => {
      if (msg.from !== userId) return;
      
      client.off('message', messageHandler);
      
      if (msg.body.toLowerCase() === "si") {
        resolve(await requestDetails({ userId, client, session }));
      } else {
        resolve(await requestName({ userId, client, session }));
      }
    };

    client.on('message', messageHandler);
  });
}

async function requestDetails({ userId, client, session }) {
  const user = await getDataUser(userId);
  await client.sendMessage(
    userId,
    `${user.name || session.name}, indícanos el motivo de tu consulta:`
  );

  return new Promise((resolve) => {
    const messageHandler = async (msg) => {
      if (msg.from !== userId) return;
      
      client.off('message', messageHandler);
      session.details = msg.body;
      resolve(await completeRegistration({ userId, client, session }));
    };

    client.on('message', messageHandler);
  });
}

async function completeRegistration({ userId, client, session }) {
  await client.sendMessage(
    userId,
    "Un asesor se pondrá en contacto contigo pronto. ⏰"
  );
  
  await newRequest(userId, session.details);
  sessions.delete(userId);

  return await newActionBot(userId, 2);
}

export { sessions };