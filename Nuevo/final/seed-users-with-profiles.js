// seed-users-with-profiles.js
import "dotenv/config"; // carga automáticamente las variables de .env
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Variables de entorno (asegúrate de tenerlas en tu .env)
const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!VITE_SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env",
  );
}

const supabase = createClient(VITE_SUPABASE_URL, SERVICE_ROLE_KEY);

async function createUsers() {
  const users = [
    { email: "user1@example.com", password: "Password123!", role: "user" },
    { email: "user2@example.com", password: "Password123!", role: "user" },
    { email: "admin@example.com", password: "Password123!", role: "admin" },
    // añade más usuarios aquí
  ];

  for (const u of users) {
    // Crear usuario en Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (error) {
      console.error(`Error creando ${u.email}:`, error.message);
      continue;
    }

    const userId = data.user.id;
    const qr = randomUUID();

    // Insertar perfil asociado
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email: u.email,
      role: u.role,
      qr_code: qr,
      visits: 0,
    });

    if (profileError) {
      console.error(
        `Error creando perfil para ${u.email}:`,
        profileError.message,
      );
    } else {
      console.log(
        `Usuario y perfil creados: ${u.email} (id: ${userId}, role: ${u.role})`,
      );
    }
  }
}

createUsers();
