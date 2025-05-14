import { pool } from "./pool.js";

export async function newRequest(userId, details) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO requests (user_id, details) VALUES (?, ?)`,
      [userId, details]
    );
    console.log("✅ Detalle insertado con ID:", result.insertId);
    return true;
  } catch (error) {
    console.error("❌ Error al insertar detalle:", error.message);
    return false;
  }
}

export async function checkActiveRequest(userId) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM requests WHERE user_id = ? AND status IN ('pending', 'in_progress') LIMIT 1`,
      [userId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("❌ Error al verificar solicitudes activas:", error.message);
    return null;
  }
}