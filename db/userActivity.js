import { pool } from "./pool.js";
import { updateUserStatus } from "./users.js";
import { stateRequest } from "../greeting.js";
import { sessions } from "../adviserrequest.js";
import { newActionBot } from "../db/users.js";

// const INACTIVITY_TIMEOUT = 1 * 60 * 1000;
// const CHECK_INTERVAL = 60 * 1000;
// const INACTIVITY_TIMEOUT = 60 * 1000; // 5 segundos
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;
const CHECK_INTERVAL = 5 * 1000; // 30 segundos

let inactivityCheckInterval;

export async function checkInactiveSessions(client) {
  try {
    
    const [activeUsers] = await pool.execute(
      `SELECT phone FROM users 
       WHERE status = 'active' 
       AND last_interaction < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [INACTIVITY_TIMEOUT / 60000]
    );

    for (const user of activeUsers) {
      console.log(`⏳ Cerrando sesión inactiva para: ${user.phone}`);
      
      try {
        await client.sendMessage(
          user.phone,
          "⏳ Cerramos la sesión por inactividad. Escríbenos cuando lo necesites. ¡Estamos para ayudar!\n\n🔻 Sesión terminada"
        );

        await updateUserStatus(user.phone, 'inactive');
        await newActionBot(user.phone, 2);
        
        // Cerrar solicitudes pendientes del usuario
        await pool.execute(
          `UPDATE requests SET status = 'rejected' 
           WHERE user_id = ? AND status = 'pending'`,
          [user.phone]
        );
        
        console.log(`✅ Sesión cerrada para: ${user.phone}`);
        // stateRequest.delete(user.phone);
        // if (sessions.has(user.phone)) {
        //   console.log("destroy", user);
        //   sessions.set(user.phone, { number_document: null, name: null, details: null });
        // }

      } catch (error) {
        console.error(`❌ Error al cerrar sesión de ${user.phone}:`, error.message);
      }
    }
  } catch (error) {
    console.error("❌ Error en checkInactiveSessions:", error.message);
  }
}

export function startInactivityChecker(client) {
  if (inactivityCheckInterval) {
    clearInterval(inactivityCheckInterval);
  }
  
  inactivityCheckInterval = setInterval(
    () => checkInactiveSessions(client), 
    CHECK_INTERVAL
  );
  console.log("🔄 Iniciado verificador de inactividad");
}


export function stopInactivityChecker() {
  if (inactivityCheckInterval) {
    clearInterval(inactivityCheckInterval);
    console.log("🛑 Detenido verificador de inactividad");
  }
}

export async function updateLastInteraction(userId) {
  try {
    await pool.execute(
      `UPDATE users SET last_interaction = NOW() WHERE phone = ?`,
      [userId]
    );
  } catch (error) {
    console.error("❌ Error al actualizar last_interaction:", error.message);
  }
}
