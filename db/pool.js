import mysql from "mysql2/promise";
import config from "./config.js";

const pool = mysql.createPool(config.database);

async function conectarDB(reintento = 5) {
  while (reintento > 0) {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Conectado a MySQL correctamente.");
      connection.release(); // 🔄 Liberar conexión después de verificar
      return;
    } catch (error) {
      console.error(`❌ Error al conectar a MySQL (${reintento} intentos restantes):`, error.message);
      reintento--;
      await new Promise((res) => setTimeout(res, 5000)); // Espera 5 segundos antes de reintentar
    }
  }
  console.error("❌ No se pudo conectar a MySQL después de varios intentos.");
  process.exit(1);
}

conectarDB();

export { pool };

