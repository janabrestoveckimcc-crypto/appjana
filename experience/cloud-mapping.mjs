// Pure presentation mapping for the existing prototype screens. No local awards.
const categories={zdravstvo:['Zdravstvo','Health'],racuni:['Računi','Bills'],ugovori:['Ugovori','Contracts'],vozilo:['Vozilo','Vehicle'],osobni_dokumenti:['Osobni dokumenti','Identity documents'],skola_vrtic:['Škola i vrtić','School and nursery'],karte_dogadaji:['Karte i događaji','Tickets and events'],bonovi:['Bonovi','Vouchers'],ostalo:['Ostalo','Other']};
export function cloudCategories(language='hr'){
 return Object.entries(categories).map(([id,names])=>({id,name:names[language==='en'?1:0],parentId:null}));
}
function localParts(instant){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant));
 const get=type=>parts.find(part=>part.type===type)?.value;
 return {date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`};
}
export function mapCloudTask(row,documents=[]){
 const document=documents.find(document=>document.id===row.document_id);
 return {...row,...localParts(row.start_at??row.due_date),status:row.status==='done'?'completed':row.status==='open'?'pending':'missed',importance:Math.min(3,row.tier),difficulty:Math.min(3,row.tier),categoryId:document?.category??'ostalo',proofPolicy:'none',proofPossible:false,proof:null,cloud:true};
}
export function mapCloudDocument(row){
 return {...row,name:row.title,mime:row.mime_type,size:0,createdAt:row.created_at,categoryId:row.category,expiresOn:row.expiry_date?localParts(row.expiry_date).date:null,fileHash:row.file_hash,pinned:false,cloud:true};
}
export function applyCloudSnapshot(state,snapshot){
 state.tasks=snapshot.tasks.map(task=>mapCloudTask(task,snapshot.documents));
 state.documents=snapshot.documents.map(mapCloudDocument);
 state.hp=snapshot.profile.hp;state.mapIndex=snapshot.profile.map_index;state.presence=snapshot.profile.presence;
 state.position=Math.floor(state.hp/10)+1;state.xp=snapshot.totalHP;state.cloud=true;
 return state;
}
