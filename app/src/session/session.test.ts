import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomDraft, setFanRange, setOrdinary, setPassDealerOnDraw, setPlayerFormat, setTrackDealer } from '../rules/setup.ts';
import { recordDraw, recordWin } from './hand.ts';
import {
  addReserve,
  canStart,
  claimOutbound,
  commitBoard,
  formatBalance,
  formatDealerBadge,
  formatWind,
  ledgerLabels,
  ledgerLines,
  markPoolTransfer,
  removePlayer,
  renamePlayer,
  reopenSession,
  seatedPlayerIds,
  selectDealer,
  setProgressDisplay,
  stageRules,
  startSession,
  substitute,
  swapSeats,
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
    const reset = selectDealer(marked, dealerId, true, false);
    assert.equal(formatDealerBadge(reset.dealerMark), '莊');
    assert.equal(formatWind(reset.roundWind, reset.seatWind), '南圈北風');

    const draw = commitBoard(reset, '冧', { ...reset, dealerMark: { kind: 'draw', count: 1 } });
    const stillDraw = selectDealer(draw, dealerId, true, false);
    assert.equal(formatDealerBadge(stillDraw.dealerMark), '冧1');
    assert.equal(formatDealerBadge({ kind: 'consecutive', count: 1 }), '連1');
  });

  it('sets 東圈東風 when 重新開始計算圈風 is on, and leaves it when off', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const marked = commitBoard(started, '圈風', {
      ...started,
      roundWind: 'south',
      seatWind: 'west',
    });
    const dealerId = marked.dealerId;
    assert.ok(dealerId);
    const kept = selectDealer(marked, dealerId, false, false);
    assert.equal(kept, marked);
    const restarted = selectDealer(marked, dealerId, false, true);
    assert.equal(formatWind(restarted.roundWind, restarted.seatWind), '東圈東風');
    assert.equal(undoLatest(restarted).roundWind, 'south');
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

describe('roster edits', () => {
  it('renames in place and leaves the earlier snapshot name', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const renamed = renamePlayer(started, started.players[0]?.id ?? '', '  甲甲  ');
    assert.equal(renamed.players[0]?.id, started.players[0]?.id);
    assert.equal(renamed.players[0]?.name, '甲甲');
    assert.equal(renamed.ledger.at(-1)?.before.players[0]?.name, '甲家');
    assert.equal(renamed.dealerId, started.dealerId);
  });

  it('removes only a reserve who never sat and has a zero balance', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const reserved = addReserve(started, '戊家');
    const reserve = reserved.players.at(-1);
    assert.ok(reserve);
    const removed = removePlayer(reserved, reserve.id);
    assert.equal(removed.players.some((player) => player.id === reserve.id), false);
    assert.equal(removePlayer(started, started.players[0]?.id ?? ''), started);
    const swapped = substitute(reserved, reserve.id, 0);
    assert.equal(removePlayer(swapped, reserve.id), swapped);
    const original = swapped.players.find((player) => player.name === '甲家');
    assert.ok(original);
    const returned = substitute(swapped, original.id, 0);
    assert.equal(removePlayer(returned, reserve.id), returned);
  });

  it('swaps two seats without moving money, 莊, or 圈風', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const swapped = swapSeats(started, 0, 1);
    assert.equal(swapped.seats[0]?.playerId, started.seats[1]?.playerId);
    assert.equal(swapped.seats[1]?.playerId, started.seats[0]?.playerId);
    assert.equal(swapped.dealerId, started.dealerId);
    assert.equal(swapped.roundWind, started.roundWind);
    assert.equal(swapped.players[0]?.balance, '0');
  });
});

describe('下一手玩法', () => {
  it('scores the next hand with the staged rules and keeps the earlier snapshot', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const winner = started.players[0]?.id ?? '';
    const discarder = started.players[1]?.id ?? '';
    const first = recordWin(started, { winnerId: winner, fan: 3, discarderId: discarder });
    assert.equal(first.players[0]?.balance, '4');
    const edited = stageRules(first, setOrdinary(first.rules, 3, '10'));
    assert.equal(edited.rules.rows.find((row) => row.fan === 3)?.ordinary, '4');
    const refused = recordWin(stageRules(first, setFanRange(first.rules, 5, 8)), {
      winnerId: winner,
      fan: 3,
      discarderId: discarder,
    });
    assert.equal(refused.rules.minFan, 3);
    assert.equal(refused.pendingRules?.minFan, 5);
    const second = recordWin(edited, { winnerId: winner, fan: 3, discarderId: discarder });
    assert.equal(second.rules.rows.find((row) => row.fan === 3)?.ordinary, '10');
    assert.equal(second.pendingRules, undefined);
    assert.equal(second.players[0]?.balance, '14');
    assert.equal(second.ledger.find((entry) => entry.label.startsWith('玩法'))?.before.players[0]?.balance, '4');
  });
});

describe('彩池轉入新局', () => {
  it('moves the pool onto the next session and leaves the old balances', () => {
    const started = startSession({
      rules: createCustomDraft(),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const funded = { ...started, pool: '40' };
    const marked = markPoolTransfer(funded);
    assert.equal(marked.pool, '0');
    assert.equal(marked.outboundPool, '40');
    assert.equal(marked.ledger.at(-1)?.label, '彩池轉入新局');
    assert.equal(marked.players[0]?.balance, '0');
    assert.equal(markPoolTransfer(started), started);
    const reopened = reopenSession(marked, startedAt, '40');
    assert.equal(reopened.pool, '40');
    assert.equal(reopened.id === marked.id, false);
    assert.equal(reopened.handCount, 0);
    const claimed = claimOutbound(reopenSession(marked, startedAt), [marked]);
    assert.equal(claimed.session.pool, '40');
    assert.equal(claimed.archive?.outboundPool, undefined);
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
