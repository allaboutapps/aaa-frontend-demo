"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["/aaa-frontend-demo/index.html","09a8ebdb293de93d0fe3b6ec0061d428"],["/aaa-frontend-demo/static/css/main.35792f2b.css","15df641e2db51e8f50a9278e8e11f221"],["/aaa-frontend-demo/static/js/0.00206cfb.chunk.js","58dd8d43991a89545194d4ac627ebd78"],["/aaa-frontend-demo/static/js/main.469601a0.js","401d0666e8e45ced979cef0188f14840"],["/aaa-frontend-demo/static/media/logo.5d5d9eef.svg","5d5d9eefa31e5e13a6610d9fa7a283bb"],["/aaa-frontend-demo/static/media/roboto-v15-latin-300.16ddb154.woff2","16ddb1541046ada9b90cacf4adec839a"],["/aaa-frontend-demo/static/media/roboto-v15-latin-300.1edaa6e5.svg","1edaa6e50c2302bf0221d252e1caebb4"],["/aaa-frontend-demo/static/media/roboto-v15-latin-300.c3547b2e.eot","c3547b2ec6f5eb324b44d8a0c6b2dd31"],["/aaa-frontend-demo/static/media/roboto-v15-latin-300.ecce92d0.woff","ecce92d0b0ff17197f29e7db6397bf0a"],["/aaa-frontend-demo/static/media/roboto-v15-latin-500.2a52a20f.eot","2a52a20f9a56010ec5d985abe9bebcc9"],["/aaa-frontend-demo/static/media/roboto-v15-latin-500.57af64fc.woff","57af64fc644194101c1593abea164433"],["/aaa-frontend-demo/static/media/roboto-v15-latin-500.bb474f16.woff2","bb474f16c9f76f522d656d66aa4a220e"],["/aaa-frontend-demo/static/media/roboto-v15-latin-500.f1d811cd.svg","f1d811cdfaea49c969500d4bbe52251b"],["/aaa-frontend-demo/static/media/roboto-v15-latin-regular.16e1d930.woff","16e1d930cf13fb7a956372044b6d02d0"],["/aaa-frontend-demo/static/media/roboto-v15-latin-regular.3d3a5358.svg","3d3a53586bd78d1069ae4b89a3b9aa98"],["/aaa-frontend-demo/static/media/roboto-v15-latin-regular.7e367be0.woff2","7e367be02cd17a96d513ab74846bafb3"],["/aaa-frontend-demo/static/media/roboto-v15-latin-regular.9f916e33.eot","9f916e330c478bbfa2a0dd6614042046"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=a),t.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(a){return new Response(a,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,a,t,n){var r=new URL(e);return n&&r.pathname.match(n)||(r.search+=(r.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(t)),r.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var t=new URL(a).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,a){var t=new URL(e);return t.hash="",t.search=t.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return a.every(function(a){return!a.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),t.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],t=e[1],n=new URL(a,self.location),r=createCacheKey(n,hashParamName,t,/\.\w{8}\./);return[n.toString(),r]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(a){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(t){if(!a.has(t)){var n=new Request(t,{credentials:"same-origin"});return fetch(n).then(function(a){if(!a.ok)throw new Error("Request for "+t+" returned a response with status "+a.status);return cleanResponse(a).then(function(a){return e.put(t,a)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var a=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(t){return Promise.all(t.map(function(t){if(!a.has(t.url))return e.delete(t)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var a,t=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(a=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,"index.html"),a=urlsToCacheKeys.has(t));!a&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(t=new URL("/aaa-frontend-demo/index.html",self.location).toString(),a=urlsToCacheKeys.has(t)),a&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(a){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,a),fetch(e.request)}))}});