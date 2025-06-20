// Service Worker para gerenciar notificações do To-Do-Ist
const CACHE_NAME = 'todo-ist-cache-v1';

// Recursos para armazenar em cache
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/sounds/bell.mp3',
  '/sounds/chime.mp3',
  '/sounds/ding.mp3',
  '/sounds/digital.mp3',
  '/sounds/notification.mp3',
  '/sounds/pomodoro.mp3'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {

        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Erro ao abrir cache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Deletar caches antigos que não estão na whitelist
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições de rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retornar resposta do cache
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('Erro ao buscar recurso:', error);
      })
  );
});

// Evento para mostrar notificações
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Notificação do To-Do-Ist',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'To-Do-Ist', options)
    );
  } catch (error) {
    // Fallback para texto simples se não for JSON
    const text = event.data.text();
    
    event.waitUntil(
      self.registration.showNotification('To-Do-Ist', {
        body: text,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    );
  }
});

// Evento para quando o usuário clica na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Tentar pegar URL personalizada dos dados ou usar a raiz
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsList) => {
      // Se já tem uma janela aberta, focar nela e navegar para a URL
      for (const client of clientsList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Se não tem janela aberta, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
}); 