import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createCustomDraft,
  createPresetDraft,
  formatAmount,
  setFanRange,
  setMultiplier,
  setOrdinary,
  setPassDealerOnDraw,
  setPaymentMode,
  setPlayerFormat,
  setTrackDealer,
} from '../rules/setup.ts';
import { formatWinPreview, previewWin, recordDraw, recordWin } from './hand.ts';
import { addReserve, commitBoard, formatDealerBadge, formatWind, startSession, undoLatest } from './session.ts';
import type { Wind } from './types.ts';

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
    assert.equal(next.dealerId, idOf(next, '乙家'));
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈南風');
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
    assert.equal(next.dealerId, idOf(next, '乙家'));
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈南風');
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
    assert.equal(recorded.dealerId, idOf(recorded, '乙家'));
    assert.equal(formatDealerBadge(recorded.dealerMark), '莊');

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
    let session = withDealer(startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']), '丙家');
    session = recordWin(session, { winnerId: idOf(session, '甲家'), fan: 3, discarderId: idOf(session, '丙家') });
    assert.equal(balance(session, '甲家'), '3');
    assert.equal(balance(session, '乙家'), '0');
    assert.equal(balance(session, '丙家'), '-3');
    assert.equal(session.dealerId, idOf(session, '甲家'));
    assert.equal(formatWind(session.roundWind, session.seatWind), '東圈南風');

    session = recordWin(session, { winnerId: idOf(session, '丙家'), fan: 3, discarderId: null });
    assert.equal(balance(session, '甲家'), '1');
    assert.equal(balance(session, '乙家'), '-2');
    assert.equal(balance(session, '丙家'), '1');
    assert.equal(session.dealerId, idOf(session, '乙家'));
    assert.equal(formatDealerBadge(session.dealerMark), '莊');
    assert.equal(formatWind(session.roundWind, session.seatWind), '東圈西風');

    session = recordWin(session, { winnerId: idOf(session, '乙家'), fan: 4, discarderId: null });
    assert.equal(balance(session, '甲家'), '-3');
    assert.equal(balance(session, '乙家'), '6');
    assert.equal(balance(session, '丙家'), '-3');
    assert.equal(session.dealerId, idOf(session, '乙家'));
    assert.equal(formatDealerBadge(session.dealerMark), '連1');
    assert.equal(formatWind(session.roundWind, session.seatWind), '東圈西風');
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

describe('一炮多響', () => {
  it('pays each 全銃 winner their ordinary amount and the discarder the sum', () => {
    const session = four('51', setFanRange(createPresetDraft('3fan4-full'), 3, 13));
    const input = {
      winnerId: idOf(session, '丁家'),
      fan: 9,
      discarderId: idOf(session, '乙家'),
      also: [
        { playerId: idOf(session, '甲家'), fan: 8 },
        { playerId: idOf(session, '丙家'), fan: 3 },
      ],
    };
    const preview = previewWin(session, input);
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['9番分數 256', '總分 256']);
    const next = recordWin(session, input);
    assert.equal(balance(next, '甲家'), '128');
    assert.equal(balance(next, '乙家'), '-388');
    assert.equal(balance(next, '丙家'), '4');
    assert.equal(balance(next, '丁家'), '256');
    assert.equal(player(next, '甲家').wins, 1);
    assert.equal(player(next, '丙家').wins, 1);
    assert.equal(player(next, '丁家').wins, 1);
    assert.equal(player(next, '乙家').discards, 1);
    assert.equal(player(next, '丁家').selfDraws, 0);
    assert.equal(next.handCount, 1);
    assert.equal(next.dealerId, session.dealerId);
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈東風');
    assert.deepEqual(undoLatest(next).ledger, []);
  });

  it('uses the demonstrated two-winner 半銃 nets', () => {
    const rules = setPaymentMode(setFanRange(createPresetDraft('51-full'), 3, 13), 'half-discard');
    const session = four('51', rules);
    const input = {
      winnerId: idOf(session, '丁家'),
      fan: 7,
      discarderId: idOf(session, '丙家'),
      also: [{ playerId: idOf(session, '乙家'), fan: 6 }],
    };
    const preview = previewWin(session, input);
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['7番分數 256', '總分 224']);
    const other = previewWin(session, { ...input, winnerId: idOf(session, '乙家'), fan: 6, also: [{ playerId: idOf(session, '丁家'), fan: 7 }] });
    assert.equal(other?.total, '64');
    const next = recordWin(session, input);
    assert.equal(balance(next, '丁家'), '224');
    assert.equal(balance(next, '乙家'), '64');
    assert.equal(balance(next, '丙家'), '-192');
    assert.equal(balance(next, '甲家'), '-96');
  });

  it('does not score a three-winner 半銃 split or a three-player 一炮多響', () => {
    const half = four('51', setPaymentMode(setFanRange(createPresetDraft('51-full'), 3, 8), 'half-discard'));
    assert.equal(
      previewWin(half, {
        winnerId: idOf(half, '丁家'),
        fan: 7,
        discarderId: idOf(half, '丙家'),
        also: [
          { playerId: idOf(half, '乙家'), fan: 6 },
          { playerId: idOf(half, '甲家'), fan: 5 },
        ],
      }),
      null,
    );
    const three = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    assert.equal(
      previewWin(three, {
        winnerId: idOf(three, '甲家'),
        fan: 3,
        discarderId: idOf(three, '丙家'),
        also: [{ playerId: idOf(three, '乙家'), fan: 4 }],
      }),
      null,
    );
  });
});

describe('連莊', () => {
  it('raises 連1, 連2, and 連3 while the dealer keeps winning on the same 圈風', () => {
    let session = withDealer(four('custom'), '丁家');
    for (const mark of ['連1', '連2', '連3']) {
      session = recordWin(session, { winnerId: idOf(session, '丁家'), fan: 3, discarderId: idOf(session, '甲家') });
      assert.equal(session.dealerId, idOf(session, '丁家'));
      assert.equal(formatDealerBadge(session.dealerMark), mark);
      assert.equal(formatWind(session.roundWind, session.seatWind), '東圈東風');
    }
    const restored = undoLatest(session);
    assert.equal(formatDealerBadge(restored.dealerMark), '連2');
    assert.equal(restored.dealerId, idOf(restored, '丁家'));
  });

  it('leaves a three-player dealer 自摸 on the same 圈風 with 連1', () => {
    const session = withDealer(startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']), '乙家');
    const next = recordWin(session, { winnerId: idOf(session, '乙家'), fan: 4, discarderId: null });
    assert.equal(next.dealerId, idOf(next, '乙家'));
    assert.equal(formatDealerBadge(next.dealerMark), '連1');
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈東風');
    assert.equal(balance(next, '乙家'), '8');
    assert.equal(balance(next, '甲家'), '-4');
    assert.equal(balance(next, '丙家'), '-4');
  });

  it('keeps the dealer and moves 北 莊 to the next round’s 東風', () => {
    const session = withDealer(four('custom'), '丁家', 'east', 'north');
    const next = recordWin(session, { winnerId: idOf(session, '丁家'), fan: 3, discarderId: idOf(session, '甲家') });
    assert.equal(next.dealerId, idOf(next, '丁家'));
    assert.equal(formatDealerBadge(next.dealerMark), '連1');
    assert.equal(formatWind(next.roundWind, next.seatWind), '南圈東風');
  });
});

describe('流局', () => {
  it('advances 莊 and 圈風 when 流局時過莊 is on and leaves the scores at 0', () => {
    const session = four('custom');
    const next = recordDraw(session);
    assert.equal(balance(next, '甲家'), '0');
    assert.equal(balance(next, '乙家'), '0');
    assert.equal(balance(next, '丙家'), '0');
    assert.equal(balance(next, '丁家'), '0');
    assert.equal(next.pool, '0');
    assert.equal(next.dealerId, idOf(next, '乙家'));
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈南風');
    assert.equal(next.handCount, 1);
    assert.equal(next.ledger.at(-1)?.label, '流局');
    const restored = undoLatest(next);
    assert.equal(restored.dealerId, idOf(restored, '甲家'));
    assert.equal(formatWind(restored.roundWind, restored.seatWind), '東圈東風');
    assert.equal(restored.handCount, 0);
  });

  it('keeps 莊 and 圈風 and raises 冧1 through 冧5 when 流局時過莊 is off', () => {
    const rules = setPassDealerOnDraw(createCustomDraft(), false);
    let session = withDealer(four('custom', rules), '丁家');
    for (const mark of ['冧1', '冧2', '冧3', '冧4', '冧5']) {
      session = recordDraw(session);
      assert.equal(session.dealerId, idOf(session, '丁家'));
      assert.equal(formatDealerBadge(session.dealerMark), mark);
      assert.equal(formatWind(session.roundWind, session.seatWind), '東圈東風');
      assert.equal(balance(session, '甲家'), '0');
      assert.equal(balance(session, '丁家'), '0');
    }
  });

  it('records a drawn hand without a dealer when tracking is off', () => {
    const session = startSession({
      rules: setTrackDealer(createCustomDraft(), false),
      names: ['甲家', '乙家', '丙家', '丁家'],
      dealerIndex: null,
      startedAt,
    });
    const next = recordDraw(session);
    assert.equal(next.dealerId, null);
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(next.handCount, 1);
    assert.equal(balance(next, '甲家'), '0');
  });
});

describe('詐糊', () => {
  it('pays the ordinary amount to each other seated player', () => {
    const session = withBalances(wide51(), { 甲家: '116', 乙家: '488', 丙家: '-508', 丁家: '-96' });
    const input = { winnerId: idOf(session, '丁家'), fan: 13, discarderId: null, falseWin: true };
    const preview = previewWin(session, input);
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['13番分數 詐糊 -16384 ×3', '總分 -49152']);

    const next = recordWin(session, input);
    assert.equal(balance(next, '甲家'), '16500');
    assert.equal(balance(next, '乙家'), '16872');
    assert.equal(balance(next, '丙家'), '15876');
    assert.equal(balance(next, '丁家'), '-49248');
    assert.equal(player(next, '丁家').wins, 0);
    assert.equal(player(next, '丁家').selfDraws, 0);
    assert.equal(player(next, '甲家').discards, 0);
    assert.equal(next.handCount, session.handCount + 1);
    assert.equal(next.ledger.at(-1)?.label, '13番 詐糊');
    assert.equal(next.dealerId, session.dealerId);
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈東風');
    const restored = undoLatest(next);
    assert.equal(balance(restored, '丁家'), '-96');
    assert.equal(restored.handCount, session.handCount);
  });

  it('still pays the full ordinary amount on a 半銃 table', () => {
    const rules = setPaymentMode(wide51().rules, 'half-discard');
    const session = four('51', rules);
    const next = recordWin(session, { winnerId: idOf(session, '丁家'), fan: 4, discarderId: null, falseWin: true });
    assert.equal(balance(next, '丁家'), '-96');
    assert.equal(balance(next, '甲家'), '32');
    assert.equal(balance(next, '乙家'), '32');
    assert.equal(balance(next, '丙家'), '32');
  });

  it('passes 莊 when the dealer declares 詐糊', () => {
    const session = withDealer(wide51(), '丁家');
    const next = recordWin(session, { winnerId: idOf(session, '丁家'), fan: 13, discarderId: null, falseWin: true });
    assert.equal(next.dealerId, idOf(next, '甲家'));
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈南風');
    assert.equal(balance(next, '丁家'), '-49152');
    assert.equal(balance(next, '甲家'), '16384');
  });

  it('does not score a three-player 詐糊 or an unrecorded fan', () => {
    const three = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    assert.equal(previewWin(three, { winnerId: idOf(three, '甲家'), fan: 4, discarderId: null, falseWin: true }), null);
    const session = four('custom');
    assert.equal(previewWin(session, { winnerId: idOf(session, '甲家'), fan: 13, discarderId: null, falseWin: true }), null);
    const reserve = addReserve(wide51(), '戊家');
    const next = recordWin(reserve, { winnerId: idOf(reserve, '丁家'), fan: 13, discarderId: null, falseWin: true });
    assert.equal(balance(next, '戊家'), '0');
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

function wide51() {
  return four('51', setFanRange(createPresetDraft('51-full'), 3, 13));
}

function withDealer(session: ReturnType<typeof startNamed>, name: string, roundWind: Wind = 'east', seatWind: Wind = 'east') {
  return commitBoard(session, '莊', {
    players: session.players,
    seats: session.seats,
    dealerId: idOf(session, name),
    dealerMark: { kind: 'plain' },
    roundWind,
    seatWind,
    handCount: session.handCount,
    pool: session.pool,
  });
}

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
