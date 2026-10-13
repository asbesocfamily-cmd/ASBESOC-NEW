import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Timestamp } from 'firebase/firestore';
import { hasUnreadReply, latestReadReply } from '../src/firebase/chatReadState.ts';

const first = new Timestamp(100, 100000);
const next = new Timestamp(100, 200000);
const reply = (id, createdAt, extra = {}) => ({ id, createdAt, senderRole: 'admin', ...extra });

test('the notification and its count clear on read and return for a newer reply', () => {
  assert.equal(Number(hasUnreadReply(null)), 0);
  assert.equal(Number(hasUnreadReply({ lastAdminMessageAt: first })), 1);
  assert.equal(Number(hasUnreadReply({ lastAdminMessageAt: first, memberReadAt: first })), 0);
  assert.equal(Number(hasUnreadReply({ lastAdminMessageAt: next, memberReadAt: first })), 1);
  assert.equal(hasUnreadReply({ lastAdminMessageAt: first, memberReadAt: next }), false);
});

test('only loaded committed admin replies can be acknowledged, at full timestamp precision', () => {
  const loaded = reply('next', next);
  assert.equal(latestReadReply([
    reply('old', first), loaded,
    reply('pending', new Timestamp(101, 0), { pending: true }),
    reply('missing-time', null),
    reply('member', new Timestamp(102, 0), { senderRole: 'member' }),
    reply('ack', new Timestamp(103, 0), { senderRole: 'system' }),
  ]), loaded);
  assert.equal(latestReadReply([]), undefined);
});
