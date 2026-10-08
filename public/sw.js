/* Notification-only worker. No fetch handler and no private data caching. */
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()??{};}catch{}
 event.waitUntil(self.registration.showNotification(typeof data.title==='string'?data.title:'relAI',{
  body:typeof data.body==='string'?data.body:'relAI',icon:'/icons/app-icon.png',badge:'/icons/app-icon.png',
  tag:typeof data.tag==='string'?data.tag:undefined,data:{url:typeof data.url==='string'?data.url:'/'}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  let target=new URL('/',self.location.origin);try{const requested=new URL(event.notification.data?.url??'/',self.location.origin);if(requested.origin===self.location.origin)target=requested;}catch{}
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){if(new URL(client.url).origin===target.origin){await client.navigate(target.href);return client.focus();}}
  return self.clients.openWindow(target.href);
 })());
});
