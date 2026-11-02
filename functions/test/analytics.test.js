import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEvent, safePage, summarizeEvents } from '../src/analyticsPolicy.js';
test('analytics strips arbitrary paths, sensitive queries and referrer paths', () => {
  const id='a'.repeat(8)+'-aaaa-aaaa-aaaa-'+'a'.repeat(12);
  const event=normalizeEvent({eventId:id,visitorId:id,sessionId:id,kind:'page',page:'/reset?secret=private',previous:'/dashboard/member-id',referrer:'https://example.org/private?email=private',device:'spoof',os:'secret',browser:'secret'});
  assert.equal(event.page,'/other');assert.equal(event.previous,'/dashboard');assert.equal(event.referrer,'example.org');assert.equal(event.device,'Other');
  assert.equal(safePage('/verify-certificate/private-id'),'/other');
  assert.throws(()=>normalizeEvent({kind:'password'}));
});
test('analytics accepts successful application events without accepting unknown event kinds', () => {
  const id='b'.repeat(8)+'-bbbb-bbbb-bbbb-'+'b'.repeat(12);
  assert.equal(normalizeEvent({eventId:id,visitorId:id,sessionId:id,kind:'application'}).kind,'application');
  assert.throws(()=>normalizeEvent({eventId:id,visitorId:id,sessionId:id,kind:'payment',amount:5000}));
});
test('analytics deduplicates browser/session estimates and bounds live activity',()=>{
  const now=Date.UTC(2026,9,26); const base={kind:'page',visitor:'v1',session:'s1',firstTime:true,member:false,time:now,page:'/',previous:'/about',referrer:'direct',device:'Desktop',browser:'Chrome',os:'Windows'};
  const result=summarizeEvents([base,{...base,page:'/about'},{...base,kind:'heartbeat'},{...base,session:'s2',firstTime:false,time:now-600000},{...base,kind:'signup',member:true},{...base,kind:'application',member:true}],now);
  assert.equal(result.visits,2);assert.equal(result.uniqueVisitors,1);assert.equal(result.pageviews,3);assert.equal(result.activeSessions,1);assert.equal(result.signups,1);assert.equal(result.returning,1);
  assert.equal(result.applications,1);assert.equal(result.daily[0].label,'2026-10-25');
  assert.equal(result.weekly.find(row=>row.label==='2026-10-19').count,1);
  assert.equal(result.weekly.find(row=>row.label==='2026-10-26').count,2);
  assert.equal(result.monthly.find(row=>row.label==='2026-10').count,3);
});
