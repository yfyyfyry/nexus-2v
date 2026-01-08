# 🌍 Nexus v2.0 - Configuración Global

## 🚀 ¿Cómo hacer que se conecte gente de cualquier parte?

### 📋 Paso 1: Crear cuenta en Pusher (Gratis)

1. Ve a [pusher.com](https://pusher.com)
2. Regístrate (es gratis)
3. Crea un nuevo app:
   - **Nombre**: Nexus Social
   - **Cluster**: us2 (o el más cercano)
4. Copia tu **App Key**, **App ID**, **Secret**

### ⚙️ Paso 2: Configurar las keys

Edita el archivo `js/api-realtime.js`:

```javascript
// Cambia esta línea:
this.pusher = new Pusher('YOUR_PUSHER_KEY', {
    cluster: 'us2'
});

// Por esto con tus datos:
this.pusher = new Pusher('TU_REAL_KEY', {
    cluster: 'TU_CLUSTER'  // ej: us2, eu, ap1
});
```

### 🌐 Paso 3: Subir a GitHub Pages

```bash
cd C:\Users\lenovo\Desktop\nexus-v2
git init
git add .
git commit -m "Nexus v2.0 - Global con Pusher"
git remote add origin https://github.com/TU-USUARIO/nexus-v2.git
git push -u origin main
```

### 🚀 Paso 4: Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: Deploy from a branch → main
4. ¡Listo! Tu URL será: `https://TU-USUARIO.github.io/nexus-v2`

## 🌍 ¿Cómo funciona la sincronización global?

### 📱 Escenario real:
```
🇪🇸 Usuario en España sube video
   ↓
🌐 Pusher lo broadcastea globalmente
   ↓
🇲🇽 Usuario en México lo ve al instante
   ↓
🇯🇵 Usuario en Japón da like
   ↓
🇧🇷 Usuario en Brasil ve el like
```

### 🔄 ¿Qué se sincroniza en tiempo real?
- ✅ **Videos nuevos** (aparecen globalmente)
- ✅ **Likes** (se actualizan al instante)
- ✅ **Comentarios** (aparecen en todos los dispositivos)
- ✅ **Seguimientos** (se sincronizan globalmente)
- ✅ **Stories** (se ven en tiempo real)
- ✅ **Usuarios conectados** (se ve quién está online)

### 🌐 Límites del plan gratuito:
- **200 conexiones simultáneas** (más que suficiente)
- **200,000 mensajes/día** (más que suficiente)
- **Ilimitado** para desarrollo

### 📈 Para más usuarios:
Si necesitas más, los planes pagados son:
- **$20/mes** - 1,000 conexiones
- **$50/mes** - 5,000 conexiones
- **$200/mes** - 20,000 conexiones

## 🎯 ¡Listo para el mundo!

Una vez configurado:
1. **Cualquier persona** en cualquier país puede usar tu web
2. **Todo se sincroniza** en tiempo real
3. **Funciona como Instagram/TikTok** pero sin servidor propio

## 🛠️ Troubleshooting

### ❌ "No se conecta a Pusher"
- Verifica que la key sea correcta
- Revisa el cluster
- Abre la consola para ver errores

### ❌ "No se sincronizan los videos"
- Revisa que ambos usuarios estén en la misma URL
- Verifica la conexión a internet
- Abre la consola (F12) para ver logs

### ❌ "Error de CORS"
- GitHub Pages ya tiene CORS configurado
- Si usas otro servidor, configura CORS

## 🚀 ¡Éxito!

Tu Nexus ahora es una red social **GLOBAL** como TikTok/Instagram pero **100% gratuita** y sin necesidad de servidores caros! 🎉

**Comparte tu URL con el mundo y empieza a crecer!** 🌍
