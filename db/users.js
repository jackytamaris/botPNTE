import { pool } from "./pool.js";


export async function getDataUser(userId) {
  try {
    const query = `
      SELECT * 
      FROM users 
      WHERE phone = ?`;

    const [rows] = await pool.execute(query, [userId]);

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("❌ Error al obtener el usuario:", error.message);
    return null;
  }
}


export async function createNewUser(phone) {
  try {
    const query = `
      INSERT IGNORE INTO users (name, lastname, type_document, number_document, phone)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Valores por defecto para los campos obligatorios
    await pool.query(query, [null, null, null, null, phone]);
    console.log(`✅ Usuario insertado si no existía: ${phone}`);
    return true;
  } catch (error) {
    console.error("❌ Error al insertar usuario:", error.message);
    return false;
  }
}


export async function newActionBot(userId, actionId) {
  try {
    const query = `
      UPDATE users 
      SET action_id = ?
      WHERE phone = ?
    `;

    const [result] = await pool.query(query, [actionId, userId]);

    if (result.affectedRows > 0) {
      console.log(`✅ action_id actualizado a ${actionId} para el usuario con phone: ${userId}`);
      return true;
    } else {
      console.warn(`⚠️ No se encontró usuario con phone: ${userId}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error al actualizar action_id:", error.message);
    return false;
  }
}


export async function updateUserStatus(userId, status) {
  try {
    const [result] = await pool.execute(
      `UPDATE users SET status = ? WHERE phone = ?`,
      [status, userId]
    );
    console.log(`✅ Estado del usuario ${userId} actualizado a: ${status}`);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("❌ Error al actualizar estado de usuario:", error.message);
    return false;
  }
}






