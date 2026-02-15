# Guía de Despliegue en Vercel - LupaComún

Sigue estos pasos dentro de tu cuenta de [Vercel](https://vercel.com/dashboard).

### Paso 1: Importar el Proyecto
1. En tu Dashboard de Vercel, haz clic en el botón azul **"Add New..."** y elige **"Project"**.
2. En la lista de repositorios de GitHub, busca el que dice **`businessholmeschile-bot/lupacomun-oficial`**.
3. Haz clic en el botón azul **"Import"**.

---

### Paso 2: Configurar Variables de Entorno (FUNDAMENTAL)
Antes de darle al botón "Deploy", baja hasta encontrar una sección que dice **"Environment Variables"**. Debes agregar estas dos:

1. **Primera Variable:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://rvebqpxrqkjteldthnkp.supabase.co`

2. **Segunda Variable:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2ZWJxcHhycWtqdGVsZHRobmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzgzNDEsImV4cCI6MjA4NjY1NDM0MX0.tciwZ-WuYpbZj8tgd91SwKAze0dz9glbFzrQCGsIs0A`

*Haz clic en el botón **"Add"** después de poner cada una.*

---

### Paso 3: Desplegar
- Haz clic en el botón azul **"Deploy"** al final de la página.
- Espera un minuto hasta que veas los fuegos artificiales de Vercel.

---

### Paso 4: Conectar tu Dominio lupacomun.cl
1. Una vez que termine el despliegue, verás tu nuevo proyecto. Haz clic en la pestaña **"Settings"** (arriba).
2. En el menú de la izquierda, elige **"Domains"**.
3. Escribe `lupacomun.cl` en el cuadro de texto y dale a **"Add"**.
4. Te preguntará si quieres agregar también la versión `www.lupacomun.cl`. Elige la opción recomendada (que redirige una a la otra).

---

### Verificación Final
- Entra a [https://lupacomun.cl](https://lupacomun.cl).
- Baja hasta el final de la página (Footer).
- A la derecha del texto de "Derechos Reservados", verás un puntito/link invisible.
- Haz clic ahí para entrar a tu Dashboard privado.
