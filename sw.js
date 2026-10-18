/* Service worker de Casa Holanda.
 *
 * Solo guarda la app en sí, para que abra sin cobertura. Los datos no se
 * cachean aquí a propósito: una respuesta de Supabase guardada en el caché
 * del navegador se serviría como si fuera fresca y nadie sabría que está
 * mirando algo viejo. De eso se encarga la app, que guarda su última copia
 * aparte y dice la hora a la que la cogió.
 */
var CACHE = "casa-v1";

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(["./", "./index.html"]); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;                        // escrituras, nunca del caché
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return;         // Supabase y las fotos van a la red

  /* Primero la red, para que un despliegue nuevo llegue en cuanto sale; el
     caché solo entra cuando no hay cobertura. Al revés la casa se quedaría
     con una versión vieja hasta vaciar el navegador. */
  e.respondWith(
    fetch(req).then(function(r){
      if(r && r.ok){
        var copia = r.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copia); });
      }
      return r;
    }).catch(function(){
      return caches.match(req).then(function(m){ return m || caches.match("./index.html"); });
    })
  );
});
