import {AppError} from './errors.ts';
import {MAIN_MODEL_ID,REQUEST_TIMEOUT_MS,serverConfig} from './config.ts';
import {currentTimeContext} from './context.ts';
import type {Language} from './errors.ts';
// No requests happen at import time. Invalid JSON gets exactly one retry.
export async function generateJSON<T>(input:{language:Language;tone:string;prompt:string;parts:unknown[];schema:unknown;parse:(value:unknown)=>T;now:Date}):Promise<T>{
 if(!serverConfig.geminiApiKey||!MAIN_MODEL_ID)throw new AppError('AI-0001');
 for(let attempt=0;attempt<2;attempt++){
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MAIN_MODEL_ID}:generateContent`,{
   method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':serverConfig.geminiApiKey},signal:AbortSignal.timeout(REQUEST_TIMEOUT_MS),
   body:JSON.stringify({systemInstruction:{parts:[{text:`${currentTimeContext(input.now,input.language)}\nUser language: ${input.language}. Tone: ${input.tone}.\n${input.prompt}`} ]},contents:[{role:'user',parts:input.parts}],generationConfig:{responseMimeType:'application/json',responseSchema:input.schema,maxOutputTokens:4096}}),
  });
  if(!response.ok){await response.body?.cancel();throw new AppError('AI-0002');}
  try{
   const envelope=await response.json();const candidate=envelope.candidates?.[0];
   if(candidate?.finishReason!=='STOP')throw new Error('INCOMPLETE');
   const text=candidate.content.parts.filter((p:{thought?:boolean})=>!p.thought).map((p:{text?:string})=>p.text??'').join('');
   return input.parse(JSON.parse(text));
  }catch{if(attempt===1)throw new AppError('AI-0004');}
 }
 throw new AppError('AI-0004');
}
