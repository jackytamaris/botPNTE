import { createNewUser, getDataUser, newActionBot, updateUserStatus } from "./db/users.js";
import { showGreeting, showOptions, stateRequest } from "./greeting.js";
import { greetingStiker } from "./greetingstiker.js";
import { pnteIA } from "./ia/openai.js";
import { adviser } from "./adviserrequest.js";

async function getIntent(text, userId, client) {
  
  let user = await getDataUser(userId);

  // Registro
  if (!user) {
    handleNewUser(userId, client);
    return;
  }

  if (user.status === 'inactive') {
    
    await greetingStiker(userId, client, text);
    await newActionBot(userId, 2);
    return await updateUserStatus(userId, 'active');

    // await updateUserStatus(user.phone, 'active');
    // await newActionBot(user.phone, 5);
    // user = await getDataUser(userId);

  }

  // if (user.status === 'active') {
  switch (user.action_id) {
    case 1: {
      const estado = stateRequest.get(userId);

      if (!estado) {
        stateRequest.set(userId, "esperando_opcion");
      }
      
      if (estado === "esperando_opcion") {
        return await showOptions(userId, text, client);;
      }

      return await showGreeting(userId, client);
    }

    case 2:
      return await pnteIA(userId, text);

    case 3:
      return await adviser(userId, client);
  }
};

async function handleNewUser(userId, client) {
  await createNewUser(userId);
  await newActionBot(userId, 1);
  await showGreeting(userId, client);
}

export { getIntent };