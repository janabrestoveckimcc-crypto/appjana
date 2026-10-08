// Pure rules shared by Edge Functions and Vitest. All clocks are supplied by callers.
const DAY=86400000;
function dateValue(value:string):Date {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('INVALID_DATE');
 const d=new Date(value+'T12:00:00Z');
 if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)throw new Error('INVALID_DATE');
 return d;
}
export function addDays(value:string,days:number):string {
 const d=dateValue(value);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);
}
export function addMonths(value:string,months:number):string {
 if(!Number.isInteger(months))throw new Error('INVALID_INTERVAL');
 const d=dateValue(value),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);
 const end=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
 d.setUTCDate(Math.min(day,end));return d.toISOString().slice(0,10);
}
export function zagrebDate(instant:string|Date):string {
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(instant));
 const get=(type:string)=>parts.find(p=>p.type===type)!.value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function toZagrebInstant(date:string,time='09:00'):string {
 dateValue(date);if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('INVALID_TIME');
 const desired=Date.parse(date+'T'+time+':00Z');let guess=desired;
 const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<3;i++){
  const parts=formatter.formatToParts(new Date(guess));const get=(type:string)=>parts.find(p=>p.type===type)!.value;
  const displayed=Date.parse(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`);
  if(displayed===desired)return new Date(guess).toISOString();
  guess+=desired-displayed;
 }
 throw new Error('NONEXISTENT_LOCAL_TIME');
}
export function followUpDates(documentDate:string|null,follow:{found:boolean;interval_months:number|null;exact_date:string|null},expiryDate:string|null=null):{due_date:string;remind_at:string}|null {
 if(!follow.found)return null;
 const exact=follow.exact_date??expiryDate;
 if(exact){dateValue(exact);return {due_date:exact,remind_at:addDays(exact,-30)};}
 const months=follow.interval_months;
 if(!documentDate||!months)return null;
 if(!Number.isInteger(months)||months<1||months>1200)throw new Error('INVALID_INTERVAL');
 return {due_date:addMonths(documentDate,months),remind_at:addDays(addMonths(documentDate,Math.floor(months/2)),months%2?15:0)};
}
export function taskHP(input:{tier:number;dueDate:string;today:string;streak:number;proof:boolean}):number {
 const base=[0,2,5,10,20,30][input.tier];if(!base)throw new Error('INVALID_TIER');
 const days=Math.round((dateValue(input.dueDate).getTime()-dateValue(input.today).getTime())/DAY);
 const time=days>=3?1.2:days>=0?1:.5;
 return Math.max(1,Math.round(base*time*(input.proof?1:.3)*(1+Math.min(10,Math.max(0,input.streak))*.05)));
}
export function mapProgress(hp:number,mapIndex:number,award:number){
 const sum=hp+award;return {hp:sum%100,map_index:mapIndex+Math.floor(sum/100),field:Math.floor((sum%100)/10)+1};
}
export function resolveDate(value:string,today:string):string {
 dateValue(today);const text=value.trim().toLocaleLowerCase('hr');
 if(/^\d{4}-\d{2}-\d{2}$/.test(text)){dateValue(text);return text;}
 if(['danas','today'].includes(text))return today;
 if(['sutra','tomorrow'].includes(text))return addDays(today,1);
 if(['prekosutra','day after tomorrow'].includes(text))return addDays(today,2);
 const relative=text.match(/^(?:za|in)\s+(\d+)\s+(dan\w*|day\w*|tjed\w*|week\w*)$/);
 if(relative)return addDays(today,Number(relative[1])*(/^(tjed|week)/.test(relative[2])?7:1));
 const names=[['nedjelj','sunday'],['ponedjelj','monday'],['utor','tuesday'],['srijed','wednesday'],['četvrt','cetvrt','thursday'],['petak','friday'],['subot','saturday']];
 const weekday=names.findIndex(names=>names.some(name=>text.includes(name)));
 if(weekday>=0){const delta=(weekday-dateValue(today).getUTCDay()+7)%7;return addDays(today,delta||7);}
 throw new Error('UNCLEAR_DATE');
}
