import { pool } from "./pool.js";

export async function getHistorial(userId, limite = 3) {
  try {

    const query = `
      SELECT sender, message 
      FROM messages 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?`;

    const [rows] = await pool.query(query, [userId, limite]);

    return rows.reverse().map(row => ({
      role: row.sender === "user" ? "user" : "assistant",
      content: row.message
    }));

  } catch (error) {

    console.error("❌ Error al obtener historial:", error.message);

    return [];
  }
}

export async function saveMessage(userId, message, sender) {
  try {
    const query =
      "INSERT INTO messages (user_id, message, sender) VALUES (?, ?, ?)";
    await pool.query(query, [userId, message, sender]);
    console.log(`💾 Mensaje guardado en la BD (${sender}):`, message);
  } catch (error) {
    console.error("❌ Error al guardar mensaje:", error.message);
  }
}