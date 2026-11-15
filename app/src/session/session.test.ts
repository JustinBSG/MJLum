import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft, setPassDealerOnDraw, setPlayerFormat, setTrackDealer } from '../rules/setup.ts';
import { recordDraw } from './hand.ts';
import {
  addReserve,
  canStart,
  commitBoard,
  formatBalance,
  formatDealerBadge,
  formatWind,
  ledgerLabels,
  ledgerLines,
  seatedPlayerIds,
  selectDealer,
  setProgressDisplay,
  startSession,
  substitute,
  undoLatest,
} from './session.ts';

const startedAt = '2026-11-15T02:00:00.000Z';

describe('starting a session', () => {
  it('seats four named players at 0 with 東圈東風 and a plain 莊', () => {
    const rules = createCustomDraft();
    const names = ['甲家', '乙家', '丙家', '丁家'];
    assert.equal(canStart(rules, ['甲家', ' ', '丙家', '丁家'], 0), false);
    assert.equal(canStart(rules, names, null), false);

    const session = startSession({ rules, names, dealerIndex: 3, startedAt });
    assert.equal(session.seats.length, 4);
    assert.equal(session.players.every((player) => player.balance === '0'), true);
    assert.equal(session.dealerId, session.players[3]?.id);
    assert.equal(formatDealerBadge(session.dealerMark), '莊');
    assert.equal(formatWind(session.roundWind, session.seatWind), '東圈東風');
    assert.equal(session.handCount, 0);
    assert.equal(session.pool, '0');
    assert.deepEqual(session.players.map((player) => player.avatar), ['甲', '乙', '丙', '丁']);
  });

  it('seats three players and hides the dealer when tracking is off', () => {
    const rules = setTrackDealer(setPlayerFormat(createCustomDraft(), 'three'), false);
    const session = startSession({
      rules,
      names: ['甲家', '乙家', '丙家'],
      dealerIndex: null,
      startedAt,
    });
    assert.equal(session.seats.length, 3);
    assert.equal(session.dealerId, null);
  });
});

describe('roster and dealer', () => {
  it('keeps the leaving player’s balance and does not give it to the substitute', () => {
    const session = scoredSession();
    const reserve = addReserve(session, '戊家');
    const incoming = reserve.players.at(-1);
    const leaving = reserve.players[1];
    assert.ok(incoming);
    assert.equal(seatedPlayerIds(reserve).includes(incoming.id), false);

    const next = substitute(reserve, incoming.id, 1);
    const departed = next.players.find((player) => player.id === leaving?.id);
    const seated = next.players.find((player) => player.id === incoming.id);
    assert.equal(departed?.balance, '8');
    assert.equal(seated?.balance, '0');
    assert.equal(seatedPlayerIds(next).includes(departed?.id ?? ''), false);
    assert.equal(next.seats[1]?.playerId, incoming.id);
  });

  it('resets 連N without turning it into 冧N, and does not move 圈風', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const marked = commitBoard(started, '連莊', {
      ...started,
      dealerMark: { kind: 'consecutive', count: 2 },
      roundWind: 'south',
      seatWind: 'north',
    });
    const dealerId = marked.dealerId;
    assert.ok(dealerId);
    const reset = selectDealer(marked, dealerId, true);
    assert.equal(formatDealerBadge(reset.dealerMark), '莊');
    assert.equal(formatWind(reset.roundWind, reset.seatWind), '南圈北風');

    const draw = commitBoard(reset, '冧', { ...reset, dealerMark: { kind: 'draw', count: 1 } });
    const stillDraw = selectDealer(draw, dealerId, true);
    assert.equal(formatDealerBadge(stillDraw.dealerMark), '冧1');
    assert.equal(formatDealerBadge({ kind: 'consecutive', count: 1 }), '連1');
  });

  it('undoes only the latest entry and restores the previous board', () => {
    const started = scoredSession();
    const changed = commitBoard(started, '一局', {
      ...started,
      players: started.players.map((player, index) => ({ ...player, balance: index === 0 ? '4' : '-4' })),
      dealerId: started.players[1]?.id ?? null,
      dealerMark: { kind: 'consecutive', count: 1 },
      seatWind: 'south',
      handCount: 1,
    });
    assert.equal(changed.handCount, 1);
    const restored = undoLatest(changed);
    assert.equal(restored.players[1]?.balance, '8');
    assert.equal(restored.dealerId, started.dealerId);
    assert.equal(formatDealerBadge(restored.dealerMark), '莊');
    assert.equal(formatWind(restored.roundWind, restored.seatWind), '東圈東風');
    assert.equal(restored.handCount, 0);
    assert.deepEqual(ledgerLabels(restored, 'forward'), ['記分']);
    const opened = undoLatest(restored);
    assert.equal(opened.players[1]?.balance, '0');
    assert.deepEqual(opened.ledger, []);
    assert.equal(undoLatest(opened), opened);
    assert.deepEqual(ledgerLabels(changed, 'reverse'), ['一局', '記分']);
  });

  it('keeps a 過莊-off 流局 on 東圈1 with a 0 point row for each player', () => {
    const rules = setPassDealerOnDraw(createCustomDraft(), false);
    let session = startSession({
      rules,
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 3,
      startedAt,
    });
    session = recordDraw(session);
    session = recordDraw(session);
    const scores = ledgerLines(session, 'scores', 'forward').map((line) => line.text);
    assert.deepEqual(scores, [
      '東圈1',
      '甲家 0',
      '乙家 0',
      '丙家 0',
      '丁家 0',
      '甲家 0',
      '乙家 0',
      '丙家 0',
      '丁家 0',
    ]);
    assert.deepEqual(ledgerLines(session, 'events', 'forward').map((line) => line.text), ['流局', '流局']);
    assert.equal(ledgerLines(session, 'combined', 'reverse')[0]?.text, '東圈1');
    assert.equal(ledgerLines(session, 'combined', 'reverse')[1]?.text, '流局');
  });

  it('keeps a progress-display change off the score ledger', () => {
    const started = scoredSession();
    const shown = setProgressDisplay(started, 'hand-count');
    assert.equal(shown.progressDisplay, 'hand-count');
    assert.equal(shown.ledger.length, started.ledger.length);
    assert.equal(formatBalance(shown.players[0]?.balance ?? '0'), '0');
  });
});

function scoredSession() {
  const started = startSession({
    rules: createCustomDraft(),
    names: ['甲家', '乙家', '丙家', '丁家'],
    dealerIndex: 0,
    startedAt,
  });
  return commitBoard(started, '記分', {
    ...started,
    players: started.players.map((player, index) => ({ ...player, balance: index === 1 ? '8' : '0' })),
  });
}
