import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createCustomDraft,
  createPresetDraft,
  formatAmount,
  setFanRange,
  setMultiplier,
  setOrdinary,
  setPaymentMode,
  setPlayerFormat,
} from '../rules/setup.ts';
import { formatWinPreview, previewWin, recordWin } from './hand.ts';
import { addReserve, commitBoard, formatWind, startSession, undoLatest } from './session.ts';

const startedAt = '2026-11-15T02:00:00.000Z';

describe('全銃 ordinary win', () => {
  it('moves only the ordinary amount from the discarder to the winner', () => {
    const session = withBalances(four('custom'), { 乙家: '-256', 丙家: '-240' });
    const winner = idOf(session, '丙家');
    const discarder = idOf(session, '乙家');
    const preview = previewWin(session, { winnerId: winner, fan: 5, discarderId: discarder });
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['食糊分數 16', '總分 16']);

    const next = recordWin(session, { winnerId: winner, fan: 5, discarderId: discarder });
    assert.equal(balance(next, '乙家'), '-272');
    assert.equal(balance(next, '丙家'), '-224');
    assert.equal(balance(next, '甲家'), '0');
    assert.equal(balance(next, '丁家'), '0');
    assert.equal(player(next, '丙家').wins, 1);
    assert.equal(player(next, '乙家').discards, 1);
    assert.equal(player(next, '丙家').selfDraws, 0);
    assert.equal(next.handCount, 1);
    assert.equal(next.dealerId, session.dealerId);
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈東風');
  });

  it('does not score an unrecorded fan or a three-player 半銃 discard', () => {
    const three = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    assert.equal(previewWin(three, { winnerId: idOf(three, '甲家'), fan: 7, discarderId: idOf(three, '丙家') }), null);
    const halfThree = startNamed(setPaymentMode(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), 'half-discard'), [
      '甲家',
      '乙家',
      '丙家',
    ]);
    assert.equal(
      previewWin(halfThree, { winnerId: idOf(halfThree, '甲家'), fan: 3, discarderId: idOf(halfThree, '丙家') }),
      null,
    );
  });
});

describe('four-player 半銃', () => {
  it('splits F into a half for the discarder and a quarter for each other seated player', () => {
    const rules = setPaymentMode(setOrdinary(createCustomDraft(), 3, '15'), 'half-discard');
    const session = four('custom', rules);
    const preview = previewWin(session, { winnerId: idOf(session, '丁家'), fan: 3, discarderId: idOf(session, '丙家') });
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['食糊分數 15', '總分 15']);

    const next = recordWin(session, { winnerId: idOf(session, '丁家'), fan: 3, discarderId: idOf(session, '丙家') });
    assert.equal(formatAmount(balance(next, '丁家')), '15');
    assert.equal(formatAmount(balance(next, '丙家')), '-7.5');
    assert.equal(formatAmount(balance(next, '甲家')), '-3.75');
    assert.equal(formatAmount(balance(next, '乙家')), '-3.75');
    assert.equal(balance(next, '甲家'), '-15/4');
    assert.equal(next.dealerId, session.dealerId);
  });

  it('uses the same quarter for the dealer and the other non-discarder', () => {
    const rules = setPaymentMode(setOrdinary(createCustomDraft(), 4, '32'), 'half-discard');
    const session = four('custom', rules);
    const recorded = recordWin(session, {
      winnerId: idOf(session, '乙家'),
      fan: 4,
      discarderId: idOf(session, '丁家'),
    });
    assert.equal(balance(recorded, '乙家'), '32');
    assert.equal(balance(recorded, '丁家'), '-16');
    assert.equal(balance(recorded, '甲家'), '-8');
    assert.equal(balance(recorded, '丙家'), '-8');
    assert.equal(recorded.dealerId, session.dealerId);

    const large = setPaymentMode(setFanRange(createPresetDraft('51-full'), 3, 13), 'half-discard');
    const wide = four('51', large);
    const eleven = recordWin(wide, { winnerId: idOf(wide, '乙家'), fan: 11, discarderId: idOf(wide, '丁家') });
    assert.equal(balance(eleven, '乙家'), '4096');
    assert.equal(balance(eleven, '丁家'), '-2048');
    assert.equal(balance(eleven, '甲家'), '-1024');
    assert.equal(balance(eleven, '丙家'), '-1024');
  });

  it('keeps a 12-fan 半銃 自摸 on the four-player self-draw split', () => {
    const rules = setPaymentMode(setFanRange(createPresetDraft('51-full'), 3, 13), 'half-discard');
    const session = four('51', rules);
    const next = recordWin(session, { winnerId: idOf(session, '丁家'), fan: 12, discarderId: null });
    assert.equal(balance(next, '丁家'), '12288');
    assert.equal(balance(next, '甲家'), '-4096');
    assert.equal(balance(next, '乙家'), '-4096');
    assert.equal(balance(next, '丙家'), '-4096');
  });

  it('does not charge a reserve', () => {
    const rules = setPaymentMode(setOrdinary(createCustomDraft(), 3, '15'), 'half-discard');
    const session = addReserve(four('custom', rules), '戊家');
    const next = recordWin(session, { winnerId: idOf(session, '丁家'), fan: 3, discarderId: idOf(session, '丙家') });
    assert.equal(balance(next, '戊家'), '0');
    assert.equal(formatAmount(balance(next, '甲家')), '-3.75');
  });
});

describe('自摸', () => {
  it('pays a four-player total from the three seated opponents', () => {
    const session = four('51', setFanRange(createPresetDraft('51-full'), 3, 13));
    const winner = idOf(session, '甲家');
    const preview = previewWin(session, { winnerId: winner, fan: 8, discarderId: null });
    assert.ok(preview);
    assert.equal(preview.total, '768');
    assert.deepEqual(formatWinPreview(preview), ['512 × 1.50', '總分 768']);

    const next = recordWin(session, { winnerId: winner, fan: 8, discarderId: null });
    assert.equal(balance(next, '甲家'), '768');
    assert.equal(balance(next, '乙家'), '-256');
    assert.equal(balance(next, '丙家'), '-256');
    assert.equal(balance(next, '丁家'), '-256');
    assert.equal(player(next, '甲家').wins, 1);
    assert.equal(player(next, '甲家').selfDraws, 1);
    assert.equal(player(next, '乙家').discards, 0);
  });

  it('keeps 32/3 exact when the multiplier is 2', () => {
    const rules = setMultiplier(createCustomDraft(), '2');
    const session = four('custom', rules);
    const preview = previewWin(session, { winnerId: idOf(session, '丁家'), fan: 5, discarderId: null });
    assert.ok(preview);
    assert.equal(preview.total, '32');
    assert.equal(preview.deltas.find((item) => item.playerId === idOf(session, '甲家'))?.delta, '-32/3');
    assert.deepEqual(formatWinPreview(preview), ['16 × 2.00', '總分 32']);
  });

  it('does not charge a player who has left the table', () => {
    const started = four('custom');
    const reserve = addReserve(started, '戊家');
    const next = recordWin(reserve, { winnerId: idOf(reserve, '甲家'), fan: 5, discarderId: null });
    assert.equal(balance(next, '戊家'), '0');
    assert.equal(balance(next, '乙家'), '-8');
    assert.equal(player(next, '戊家').wins, 0);
  });

  it('uses the demonstrated three-player 3番4辣辣上 全銃 ×4/3 hands', () => {
    let session = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    const dealer = session.dealerId;
    session = recordWin(session, { winnerId: idOf(session, '甲家'), fan: 3, discarderId: idOf(session, '丙家') });
    assert.equal(balance(session, '甲家'), '3');
    assert.equal(balance(session, '乙家'), '0');
    assert.equal(balance(session, '丙家'), '-3');

    session = recordWin(session, { winnerId: idOf(session, '丙家'), fan: 3, discarderId: null });
    assert.equal(balance(session, '甲家'), '1');
    assert.equal(balance(session, '乙家'), '-2');
    assert.equal(balance(session, '丙家'), '1');

    session = recordWin(session, { winnerId: idOf(session, '乙家'), fan: 4, discarderId: null });
    assert.equal(balance(session, '甲家'), '-3');
    assert.equal(balance(session, '乙家'), '6');
    assert.equal(balance(session, '丙家'), '-3');
    assert.equal(session.dealerId, dealer);
    assert.equal(formatWind(session.roundWind, session.seatWind), '東圈東風');
    assert.equal(session.handCount, 3);
  });

  it('does not invent a three-player 自摸 split at another multiplier', () => {
    const session = startNamed(setPlayerFormat(createCustomDraft(), 'three'), ['甲家', '乙家', '丙家']);
    assert.equal(previewWin(session, { winnerId: idOf(session, '甲家'), fan: 3, discarderId: null }), null);
    const discard = previewWin(session, {
      winnerId: idOf(session, '甲家'),
      fan: 3,
      discarderId: idOf(session, '乙家'),
    });
    assert.equal(discard?.total, '4');
  });
});

describe('undo of a confirmed win', () => {
  it('restores the balances, counters, and hand count', () => {
    const session = four('custom');
    const recorded = recordWin(session, {
      winnerId: idOf(session, '甲家'),
      fan: 4,
      discarderId: idOf(session, '乙家'),
    });
    const restored = undoLatest(recorded);
    assert.equal(balance(restored, '甲家'), '0');
    assert.equal(player(restored, '甲家').wins, 0);
    assert.equal(player(restored, '乙家').discards, 0);
    assert.equal(restored.handCount, 0);
    assert.deepEqual(restored.ledger, []);
  });
});

function four(kind: 'custom' | '51', rules = kind === '51' ? createPresetDraft('51-full') : createCustomDraft()) {
  return startNamed(rules, ['甲家', '乙家', '丙家', '丁家']);
}

function startNamed(rules: ReturnType<typeof createCustomDraft>, names: string[]) {
  return startSession({ rules, names, dealerIndex: 0, startedAt });
}

function withBalances(session: ReturnType<typeof startNamed>, amounts: Record<string, string>) {
  return commitBoard(session, '記分', {
    ...session,
    players: session.players.map((player) => ({ ...player, balance: amounts[player.name] ?? player.balance })),
  });
}

function idOf(session: ReturnType<typeof startNamed>, name: string): string {
  const player = session.players.find((item) => item.name === name);
  assert.ok(player);
  return player.id;
}

function player(session: ReturnType<typeof startNamed>, name: string) {
  const found = session.players.find((item) => item.name === name);
  assert.ok(found);
  return found;
}

function balance(session: ReturnType<typeof startNamed>, name: string): string {
  return player(session, name).balance;
}
