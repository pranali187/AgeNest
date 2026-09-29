import {describe,it,expect} from 'vitest';
import {leap,dim,P,U,cmp,diff,bday,isoWeek,doy,fromMs} from './dates.js';
const D=(y,m,d)=>({y,m,d});
describe('leap',()=>{it('rules',()=>{expect([1900,2000,2024,2100,2023].map(leap)).toEqual([false,true,true,false,false])});
 it('month lengths',()=>{expect(dim(2024,2)).toBe(29);expect(dim(2023,2)).toBe(28);expect(dim(2023,4)).toBe(30)})});
describe('diff',()=>{
 it('typical',()=>expect(diff(D(2001,3,15),D(2026,9,29))).toEqual({y:25,m:6,d:14}));
 it('same day',()=>expect(diff(D(2020,5,5),D(2020,5,5))).toEqual({y:0,m:0,d:0}));
 it('Jan 31 -> Feb 28',()=>expect(diff(D(2001,1,31),D(2001,2,28))).toEqual({y:0,m:0,d:28}));
 it('Feb 29 -> Feb 28 next year counts as birthday',()=>expect(diff(D(2000,2,29),D(2001,2,28))).toEqual({y:1,m:0,d:0}));
 it('Feb 29 -> Mar 1',()=>expect(diff(D(2000,2,29),D(2001,3,1))).toEqual({y:1,m:0,d:1}));
 it('Feb 29 -> Feb 29 leap',()=>expect(diff(D(2000,2,29),D(2004,2,29))).toEqual({y:4,m:0,d:0}));
 it('across year boundary',()=>expect(diff(D(2020,12,31),D(2021,1,1))).toEqual({y:0,m:0,d:1}))});
describe('helpers',()=>{
 it('bday Feb 29 rule',()=>{expect(bday(2001,D(2000,2,29)).d).toBe(28);expect(bday(2004,D(2000,2,29)).d).toBe(29)});
 it('day count over a leap year',()=>expect(cmp(D(2001,1,1),D(2000,1,1))/864e5).toBe(366));
 it('doy/week',()=>{expect(doy(D(2024,12,31))).toBe(366);expect(isoWeek(D(2021,1,3))).toBe(53)});
 it('date-only parsing is timezone-safe',()=>{expect(P('2001-03-15')).toEqual(D(2001,3,15));expect(fromMs(U(D(2001,3,15)))).toEqual(D(2001,3,15))})});
