import {describe,it,expect} from 'vitest';
import {addMonths,followUpDates,zagrebDate,toZagrebInstant,taskHP,mapProgress,resolveDate} from './rules';
describe('document follow-up dates',()=>{
 it('uses the six-month SRS example',()=>expect(followUpDates('2026-07-15',{found:true,interval_months:6,exact_date:null})).toEqual({due_date:'2027-01-15',remind_at:'2026-10-15'}));
 it('clamps month ends, including leap years',()=>{expect(addMonths('2026-08-31',6)).toBe('2027-02-28');expect(addMonths('2023-08-31',6)).toBe('2024-02-29');});
 it('subtracts exactly 30 calendar days for expiry',()=>expect(followUpDates(null,{found:true,interval_months:null,exact_date:'2026-11-10'})).toEqual({due_date:'2026-11-10',remind_at:'2026-10-11'}));
 it('does not invent a missing reference date or follow-up',()=>{expect(followUpDates(null,{found:true,interval_months:6,exact_date:null})).toBeNull();expect(followUpDates('2026-07-15',{found:false,interval_months:6,exact_date:null})).toBeNull();});
 it('uses whole months plus 15 days for a half-month reminder',()=>expect(followUpDates('2026-01-31',{found:true,interval_months:3,exact_date:null})).toEqual({due_date:'2026-04-30',remind_at:'2026-03-15'}));
 it('keeps Zagreb calendar dates across DST',()=>{expect(toZagrebInstant('2026-10-24','10:00')).toBe('2026-10-24T08:00:00.000Z');expect(toZagrebInstant('2026-10-26','10:00')).toBe('2026-10-26T09:00:00.000Z');expect(zagrebDate('2026-10-07T22:30:00Z')).toBe('2026-10-08');});
 it('rejects impossible dates',()=>expect(()=>addMonths('2026-02-30',1)).toThrow());
});
describe('HP rules',()=>{
 it('matches the 29 HP SRS example',()=>expect(taskHP({tier:4,dueDate:'2026-10-13',today:'2026-10-08',streak:4,proof:true})).toBe(29));
 it('applies boundary factors and no-proof factor',()=>{const base={tier:4,dueDate:'2026-10-11',streak:0,proof:false};expect(taskHP({...base,today:'2026-10-08'})).toBe(7);expect(taskHP({...base,today:'2026-10-09'})).toBe(6);expect(taskHP({...base,today:'2026-10-11'})).toBe(6);expect(taskHP({...base,today:'2026-10-12'})).toBe(3);});
 it('caps streak and preserves minimum one HP',()=>{expect(taskHP({tier:4,dueDate:'2026-10-08',today:'2026-10-08',streak:99,proof:true})).toBe(30);expect(taskHP({tier:1,dueDate:'2026-10-07',today:'2026-10-08',streak:0,proof:false})).toBe(1);});
 it('carries surplus and maps HP to fields',()=>{expect(mapProgress(98,1,7)).toEqual({hp:5,map_index:2,field:1});expect(mapProgress(19,1,1)).toEqual({hp:20,map_index:1,field:3});});
});
describe('chat date normalization',()=>{
 it('resolves next Thursday in code',()=>expect(resolveDate('u četvrtak','2026-10-08')).toBe('2026-10-15'));
 it('resolves weeks and tomorrow',()=>{expect(resolveDate('za 2 tjedna','2026-10-08')).toBe('2026-10-22');expect(resolveDate('tomorrow','2026-10-08')).toBe('2026-10-09');});
});
