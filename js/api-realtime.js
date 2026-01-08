// Nexus API - Versión con WebSockets para sincronización real
class NexusAPI {
    constructor() {
        this.db = null;
        this.ws = null;
        this.user = null;
        this.isOnline = false;
        this.peers = new Map(); // Conexiones P2P
        this.initDB();
    }

    // Inicializar IndexedDB
    async initDB() {
        this.db = new Dexie("NexusDB");
        this.db.version(1).stores({
            videos: '++id, title, description, videoUrl, type, author, authorName, authorAvatar, authorColor, likes, comments, views, createdAt',
            stories: '++id, imageUrl, author, authorName, authorAvatar, authorColor, createdAt, expiresAt',
            chats: '++id, from, fromName, fromAvatar, to, toName, content, type, fileUrl, createdAt, read',
            users: '++id, name, email, pfp, color, followers, following, createdAt',
            likes: '++id, videoId, userId, createdAt',
            follows: '++id, followerId, followingId, createdAt'
        });
    }

    // Inicializar WebSockets con Pusher Channels (recomendado)
    async initWebSockets() {
        try {
            // Configurar Pusher Channels (CAMBIA TU_KEY por tu real key)
            Pusher.logToConsole = true;
            
            // 🔑 CONFIGURADA CON TU KEY REAL DE PUSHER
            this.pusher = new Pusher('f4c950af11e441409886', {
                cluster: 'us2',
                forceTLS: true
            });
            
            // Suscribirse al canal principal de Nexus
            this.channel = this.pusher.subscribe('nexus-global');
            
            // Eventos de videos
            this.channel.bind('new_video', (data) => {
                console.log('📹 Nuevo video recibido:', data);
                this.handleRealtimeUpdate({ type: 'new_video', video: data });
            });
            
            // Eventos de likes
            this.channel.bind('new_like', (data) => {
                console.log('❤️ Nuevo like recibido:', data);
                this.handleRealtimeUpdate({ type: 'new_like', like: data });
            });
            
            // Eventos de follows
            this.channel.bind('new_follow', (data) => {
                console.log('👥 Nuevo follow recibido:', data);
                this.handleRealtimeUpdate({ type: 'new_follow', follow: data });
            });
            
            // Eventos de comentarios
            this.channel.bind('new_comment', (data) => {
                console.log('💬 Nuevo comentario recibido:', data);
                this.handleRealtimeUpdate({ type: 'new_comment', comment: data.comment, videoId: data.videoId });
            });
            
            // Eventos de stories
            this.channel.bind('new_story', (data) => {
                console.log('📸 Nuevo story recibido:', data);
                this.handleRealtimeUpdate({ type: 'new_story', story: data });
            });
            
            // Eventos de eliminación
            this.channel.bind('delete_video', (data) => {
                console.log('🗑️ Video eliminado:', data);
                this.handleRealtimeUpdate({ type: 'delete_video', videoId: data.videoId });
            });
            
            // Eventos de estado de usuarios
            this.channel.bind('user_status', (data) => {
                console.log('👤 Usuario conectado:', data);
            });
            
            this.isOnline = true;
            console.log('🌍 Conectado a Pusher Channels - Sincronización global activa');
            
            // Notificar que este usuario se conectó
            this.broadcastUserStatus();
            
        } catch (error) {
            console.log('❌ Error con Pusher Channels, usando fallback:', error);
            this.isOnline = false;
            // Fallback a WebSocket local
            this.initLocalWebSocket();
        }
    }
    
    // Fallback WebSocket local
    initLocalWebSocket() {
        try {
            this.ws = new WebSocket('wss://echo.websocket.org');
            
            this.ws.onopen = () => {
                console.log('Conectado al servidor WebSocket local');
                this.isOnline = true;
                this.broadcastUserStatus();
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealtimeUpdate(data);
            };

            this.ws.onclose = () => {
                console.log('Desconectado del WebSocket');
                this.isOnline = false;
                setTimeout(() => this.initLocalWebSocket(), 5000);
            };

        } catch (error) {
            console.log('WebSocket no disponible, modo offline');
            this.isOnline = false;
        }
    }

    // Manejar actualizaciones en tiempo real
    async handleRealtimeUpdate(data) {
        switch (data.type) {
            case 'new_video':
                await this.syncVideo(data.video);
                break;
            case 'new_like':
                await this.syncLike(data.like);
                break;
            case 'new_follow':
                await this.syncFollow(data.follow);
                break;
            case 'new_comment':
                await this.syncComment(data.comment);
                break;
            case 'new_story':
                await this.syncStory(data.story);
                break;
        }
    }

    // Sincronizar video
    async syncVideo(videoData) {
        try {
            const existing = await this.db.videos.where('id').equals(videoData.id).first();
            if (!existing) {
                await this.db.videos.add(videoData);
                this.notifyNewContent('video', videoData);
            }
        } catch (error) {
            console.error('Error sincronizando video:', error);
        }
    }

    // Sincronizar like
    async syncLike(likeData) {
        try {
            const existing = await this.db.likes.where('videoId').equals(likeData.videoId).and(like => like.userId === likeData.userId).first();
            if (!existing) {
                await this.db.likes.add(likeData);
                // Actualizar contador de likes del video
                const video = await this.db.videos.where('id').equals(likeData.videoId).first();
                if (video) {
                    video.likes = (video.likes || []).concat(likeData.userId);
                    await this.db.videos.update(video.id, { likes: video.likes });
                }
            }
        } catch (error) {
            console.error('Error sincronizando like:', error);
        }
    }

    // Sincronizar follow
    async syncFollow(followData) {
        try {
            const existing = await this.db.follows.where('followerId').equals(followData.followerId).and(follow => follow.followingId === followData.followingId).first();
            if (!existing) {
                await this.db.follows.add(followData);
                // Actualizar contadores de seguidores
                const follower = await this.db.users.where('email').equals(followData.followerId).first();
                const following = await this.db.users.where('email').equals(followData.followingId).first();
                
                if (follower) {
                    follower.following = (follower.following || 0) + 1;
                    await this.db.users.update(follower.id, { following: follower.following });
                }
                
                if (following) {
                    follower.followers = (following.followers || 0) + 1;
                    await this.db.users.update(following.id, { followers: following.followers });
                }
            }
        } catch (error) {
            console.error('Error sincronizando follow:', error);
        }
    }

    // Broadcast de acciones (global con Pusher)
    broadcast(type, data) {
        if (this.isOnline) {
            // Intentar con Pusher primero
            if (this.pusher && this.channel) {
                this.channel.trigger(type, data);
                console.log(`Broadcast global via Pusher: ${type}`, data);
            } 
            // Fallback a WebSocket local
            else if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type, ...data }));
                console.log(`Broadcast local via WebSocket: ${type}`, data);
            }
        }
    }

    // Broadcast de estado de usuario
    broadcastUserStatus() {
        if (this.user) {
            this.broadcast('user_status', {
                user: this.user,
                timestamp: Date.now()
            });
        }
    }

    // Notificar nuevo contenido
    notifyNewContent(type, data) {
        // Evento personalizado para actualizar UI
        window.dispatchEvent(new CustomEvent('nexus:new_content', {
            detail: { type, data }
        }));
    }

    // Métodos de API
    async getCurrentUser() {
        return this.user;
    }

    async setUser(userData) {
        this.user = userData;
        localStorage.setItem('nexus_v9_user', JSON.stringify(userData));
    }

    async logout() {
        this.user = null;
        localStorage.removeItem('nexus_v9_user');
        if (this.ws) {
            this.ws.close();
        }
    }

    // Upload de video
    async uploadVideo(videoData) {
        try {
            const id = await this.db.videos.add(videoData);
            const video = await this.db.videos.get(id);
            
            // Broadcast a otros usuarios
            this.broadcast('new_video', { video });
            
            return video;
        } catch (error) {
            throw error;
        }
    }

    // Dar like a video
    async likeVideo(videoId, userId) {
        try {
            const likeData = {
                videoId,
                userId,
                createdAt: Date.now()
            };
            
            await this.db.likes.add(likeData);
            
            // Actualizar video
            const video = await this.db.videos.where('id').equals(videoId).first();
            if (video) {
                video.likes = (video.likes || []).concat(userId);
                await this.db.videos.update(video.id, { likes: video.likes });
            }
            
            // Broadcast
            this.broadcast('new_like', { like: likeData });
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Seguir usuario
    async followUser(followerId, followingId) {
        try {
            const followData = {
                followerId,
                followingId,
                createdAt: Date.now()
            };
            
            await this.db.follows.add(followData);
            
            // Actualizar contadores
            const follower = await this.db.users.where('email').equals(followerId).first();
            const following = await this.db.users.where('email').equals(followingId).first();
            
            if (follower) {
                follower.following = (follower.following || 0) + 1;
                await this.db.users.update(follower.id, { following: follower.following });
            }
            
            if (following) {
                following.followers = (following.followers || 0) + 1;
                await this.db.users.update(following.id, { followers: following.followers });
            }
            
            // Broadcast
            this.broadcast('new_follow', { follow: followData });
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Comentar video
    async commentVideo(videoId, commentData) {
        try {
            const video = await this.db.videos.where('id').equals(videoId).first();
            if (video) {
                video.comments = (video.comments || []).concat(commentData);
                await this.db.videos.update(video.id, { comments: video.comments });
                
                // Broadcast
                this.broadcast('new_comment', { comment: commentData, videoId });
                
                return true;
            }
        } catch (error) {
            throw error;
        }
    }

    // Obtener videos
    async getVideos() {
        return await this.db.videos.orderBy('createdAt').reverse().toArray();
    }

    // Obtener usuarios
    async getUsers() {
        return await this.db.users.toArray();
    }

    // Obtener stories
    async getStories() {
        const now = Date.now();
        return await this.db.stories.where('expiresAt').above(now).reverse().toArray();
    }

    // Eliminar video
    async deleteVideo(videoId) {
        try {
            await this.db.videos.delete(videoId);
            
            // Broadcast
            this.broadcast('delete_video', { videoId });
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuarios
    async searchUsers(query) {
        const users = await this.db.users.toArray();
        return users.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Obtener perfil de usuario
    async getUserProfile(email) {
        const user = await this.db.users.where('email').equals(email).first();
        if (user) {
            const videos = await this.db.videos.where('author').equals(email).toArray();
            const followers = await this.db.follows.where('followingId').equals(email).toArray();
            const following = await this.db.follows.where('followerId').equals(email).toArray();
            
            return {
                ...user,
                videos,
                followersCount: followers.length,
                followingCount: following.length,
                followers: followers.map(f => f.followerId),
                following: following.map(f => f.followingId)
            };
        }
        return null;
    }
}

// Crear instancia global
const nexusAPI = new NexusAPI();

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NexusAPI;
} else {
    window.NexusAPI = NexusAPI;
    window.nexusAPI = nexusAPI;
}
