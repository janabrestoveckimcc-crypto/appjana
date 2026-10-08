import {z} from 'npm:zod@4';
// SRS 9.2: extraction identifies printed dates; arithmetic belongs to rules.ts.
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;});
export const extractedDocument=z.object({
 category:z.enum(['zdravstvo','racuni','ugovori','vozilo','osobni_dokumenti','skola_vrtic','karte_dogadaji','bonovi','ostalo']),
 title:z.string().min(1).max(300),document_date:date.nullable(),expiry_date:date.nullable(),
 key_fields:z.array(z.object({label:z.string().max(100),value:z.string().max(1000)}).strict()).max(50),
 follow_up:z.object({found:z.boolean(),interval_months:z.number().int().min(1).max(1200).nullable(),exact_date:date.nullable(),source_text:z.string().max(4000)}).strict(),
 suggested_tier:z.number().int().min(1).max(5),confidence:z.number().min(0).max(1),
}).strict();
export const extractionResponseSchema={type:'OBJECT',properties:{
 category:{type:'STRING',enum:['zdravstvo','racuni','ugovori','vozilo','osobni_dokumenti','skola_vrtic','karte_dogadaji','bonovi','ostalo']},
 title:{type:'STRING'},document_date:{type:'STRING',nullable:true},expiry_date:{type:'STRING',nullable:true},
 key_fields:{type:'ARRAY',items:{type:'OBJECT',properties:{label:{type:'STRING'},value:{type:'STRING'}},required:['label','value']}},
 follow_up:{type:'OBJECT',properties:{found:{type:'BOOLEAN'},interval_months:{type:'INTEGER',nullable:true},exact_date:{type:'STRING',nullable:true},source_text:{type:'STRING'}},required:['found','interval_months','exact_date','source_text']},
 suggested_tier:{type:'INTEGER'},confidence:{type:'NUMBER'}},required:['category','title','document_date','expiry_date','key_fields','follow_up','suggested_tier','confidence']};
