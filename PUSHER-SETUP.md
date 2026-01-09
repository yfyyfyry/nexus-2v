# 🚀 Configuración RÁPIDA de Pusher

## 📋 PASO 1: Obtener tu Key

1. Ve a **pusher.com** → Login
2. Dashboard → **"Create new app"**
3. App name: `Nexus Social`
4. Cluster: `us2`
5. Frontend: `JavaScript`
6. Click **"Create app"**

## 🔑 PASO 2: Copiar tu Key

Una vez creada, verás algo como:
```
App ID: 123456789
Key: abcdef123456789  ← COPIA ESTA
Secret: xyz789123
Cluster: us2
```

## ⚙️ PASO 3: Configurar en el código

Edita el archivo `js/api-realtime.js`:

**Busca esta línea (línea 32):**
```javascript
this.pusher = new Pusher('TU_KEY_AQUI', {
```

**Reemplaza por tu real key:**
```javascript
this.pusher = new Pusher('abcdef123456789', {
```

## 🌐 PASO 4: Probar localmente

1. Abre `index.html` en tu navegador
2. Abre la consola (F12)
3. Deberías ver: `"Conectado a Pusher - Sincronización global activa"`

## 🚀 PASO 5: Subir a GitHub

```bash
git add .
git commit -m "Configurar Pusher con key real"
git push origin main
```

## 🌍 PASO 6: Compartir tu URL

Tu web será: `https://tu-usuario.github.io/nexus-v2`

¡Listo! Ahora cualquiera en el mundo puede usar tu Nexus y todo se sincronizará en tiempo real. 🎉

## ✅ Verificación

Abre tu web en 2 pestañas:
1. Sube un video en la pestaña 1
2. Debería aparecer en la pestaña 2 al instante
3. Si funciona → ¡Pusher está configurado correctamente!

## 🆘️ Si no funciona

- Revisa que la key sea correcta
- Verifica el cluster (us2, eu, ap1)
- Abre la consola para ver errores
- Asegúrate de tener internet

¡Listo para el mundo! 🌍
