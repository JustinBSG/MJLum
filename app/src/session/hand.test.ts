import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createCustomDraft,
  createPresetDraft,
  formatAmount,
  setFanRange,
  setMultiplier,
  setOrdinary,
  setJackpotContribution,
  setJackpotEnabled,
  setPassDealerOnDraw,
  setPaymentMode,
  setPlayerFormat,
  setTrackDealer,
} from '../rules/setup.ts';
import { eligibleJackpotIds, formatWinPreview, previewWin, recordDraw, recordWin, splitJackpot, winRefusal } from './hand.ts';
import { addReserve, commitBoard, formatDealerBadge, formatWind, startSession, substitute, undoLatest } from './session.ts';
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

  it('does not score an unrecorded fan, and splits a three-player 半銃 into 2/3 and 1/3', () => {
    const three = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    assert.equal(previewWin(three, { winnerId: idOf(three, '甲家'), fan: 7, discarderId: idOf(three, '丙家') }), null);
    const halfThree = startNamed(setPaymentMode(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), 'half-discard'), [
      '甲家',
      '乙家',
      '丙家',
    ]);
    const next = recordWin(halfThree, { winnerId: idOf(halfThree, '甲家'), fan: 3, discarderId: idOf(halfThree, '丙家') });
    assert.equal(balance(next, '甲家'), '3');
    assert.equal(balance(next, '丙家'), '-2');
    assert.equal(balance(next, '乙家'), '-1');
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

  it('pays the 3番4半辣上（三人） self-draw from two opponents at ×1.50', () => {
    const session = startNamed(createPresetDraft('3fan4-half-three'), ['甲家', '乙家', '丙家']);
    const preview = previewWin(session, { winnerId: idOf(session, '甲家'), fan: 3, discarderId: null });
    assert.equal(preview?.total, '9/2');
    assert.equal(preview?.deltas.find((item) => item.playerId === idOf(session, '乙家'))?.delta, '-9/4');
    assert.equal(preview?.deltas.find((item) => item.playerId === idOf(session, '丙家'))?.delta, '-9/4');
    const next = recordWin(session, { winnerId: idOf(session, '甲家'), fan: 3, discarderId: null });
    assert.equal(balance(next, '甲家'), '9/2');
    assert.equal(balance(next, '乙家'), '-9/4');
  });

  it('scores 例牌 at 滿糊 without adding another multiplier', () => {
    const session = four('custom');
    const next = recordWin(session, {
      winnerId: idOf(session, '乙家'),
      fan: 3,
      discarderId: null,
      limitHand: true,
    });
    assert.equal(balance(next, '乙家'), '192');
    assert.equal(player(next, '乙家').fanSum, 8);
    assert.equal(player(next, '乙家').wins, 1);
    assert.equal(next.ledger.at(-1)?.label, '8番 例牌 自摸');
    assert.equal(
      previewWin(session, {
        winnerId: idOf(session, '乙家'),
        fan: 3,
        discarderId: null,
        limitHand: true,
        falseWin: true,
      }),
      null,
    );
  });

  it('splits a three-player 自摸 by the rules multiplier', () => {
    const session = startNamed(setPlayerFormat(createCustomDraft(), 'three'), ['甲家', '乙家', '丙家']);
    const preview = previewWin(session, { winnerId: idOf(session, '甲家'), fan: 3, discarderId: null });
    assert.equal(preview?.total, '6');
    assert.equal(preview?.deltas.find((item) => item.playerId === idOf(session, '乙家'))?.delta, '-3');
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

  it('uses the checked 半銃 multi nets for three winners and a three-player double', () => {
    let rules = setPaymentMode(createCustomDraft(), 'half-discard');
    rules = setOrdinary(setOrdinary(setOrdinary(rules, 3, '2048'), 4, '16'), 5, '128');
    const fourHands = four('custom', rules);
    const triple = recordWin(fourHands, {
      winnerId: idOf(fourHands, '乙家'),
      fan: 3,
      discarderId: idOf(fourHands, '甲家'),
      also: [
        { playerId: idOf(fourHands, '丙家'), fan: 4 },
        { playerId: idOf(fourHands, '丁家'), fan: 5 },
      ],
    });
    assert.equal(balance(triple, '乙家'), '2012');
    assert.equal(balance(triple, '丙家'), '-528');
    assert.equal(balance(triple, '丁家'), '-388');
    assert.equal(balance(triple, '甲家'), '-1096');

    let threeRules = setPaymentMode(setPlayerFormat(createCustomDraft(), 'three'), 'half-discard');
    threeRules = setOrdinary(setOrdinary(threeRules, 3, '3'), 4, '384');
    const three = startNamed(threeRules, ['甲家', '乙家', '丙家']);
    const double = recordWin(three, {
      winnerId: idOf(three, '乙家'),
      fan: 4,
      discarderId: idOf(three, '甲家'),
      also: [{ playerId: idOf(three, '丙家'), fan: 3 }],
    });
    assert.equal(balance(double, '甲家'), '-258');
    assert.equal(balance(double, '丙家'), '-125');
    assert.equal(balance(double, '乙家'), '383');
  });

  it('passes 莊 when a 一炮多響 leaves the dealer out of the winners', () => {
    const session = withDealer(four('custom'), '甲家', 'south', 'west');
    const primed = {
      ...session,
      players: session.players.map((item) => (item.name === '乙家' ? { ...item, dealerStreak: 4 } : item)),
    };
    const next = recordWin(primed, {
      winnerId: idOf(primed, '丁家'),
      fan: 3,
      discarderId: idOf(primed, '丙家'),
      also: [{ playerId: idOf(primed, '乙家'), fan: 4 }],
    });
    assert.equal(next.dealerId, idOf(next, '乙家'));
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(formatWind(next.roundWind, next.seatWind), '南圈北風');
    assert.equal(player(next, '乙家').dealerStreak, 0);
    assert.equal(player(next, '甲家').dealerStreak, 0);
  });

  it('keeps 莊 when the dealer wins a 一炮多響 even with a negative net', () => {
    let rules = setPaymentMode(createCustomDraft(), 'half-discard');
    rules = setOrdinary(setOrdinary(setOrdinary(rules, 3, '2048'), 4, '16'), 5, '128');
    const session = withDealer(four('custom', rules), '甲家', 'south', 'north');
    const next = recordWin(session, {
      winnerId: idOf(session, '甲家'),
      fan: 4,
      discarderId: idOf(session, '丁家'),
      also: [
        { playerId: idOf(session, '乙家'), fan: 3 },
        { playerId: idOf(session, '丙家'), fan: 5 },
      ],
    });
    assert.equal(balance(next, '甲家'), '-528');
    assert.equal(next.dealerId, idOf(next, '甲家'));
    assert.equal(formatDealerBadge(next.dealerMark), '連1');
    assert.equal(formatWind(next.roundWind, next.seatWind), '南圈北風');
    assert.equal(player(next, '甲家').dealerStreak, 1);
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

  it('multiplies each payment when 詐糊賠位自摸 is on and passes 莊 from the dealer', () => {
    const rules = setPaymentMode(setFanRange(createPresetDraft('51-full'), 3, 13), 'half-discard');
    const seated = startSession({
      rules,
      names: ['丁家', '丙家', '甲家', '乙家'],
      dealerIndex: 0,
      startedAt,
    });
    const session = withBalances(seated, { 甲家: '-3.75', 乙家: '-3.75', 丙家: '-135.5', 丁家: '143' });
    const input = {
      winnerId: idOf(session, '丁家'),
      fan: 13,
      discarderId: null,
      falseWin: true,
      falseWinAsSelfDraw: true,
    };
    const preview = previewWin(session, input);
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['-16384 × 1.50 × 3', '總分 -73728']);

    const next = recordWin(session, input);
    assert.equal(formatAmount(balance(next, '甲家')), '24572.25');
    assert.equal(formatAmount(balance(next, '乙家')), '24572.25');
    assert.equal(formatAmount(balance(next, '丙家')), '24440.5');
    assert.equal(balance(next, '丁家'), '-73585');
    assert.equal(balance(next, '甲家'), '98289/4');
    assert.equal(balance(next, '丙家'), '48881/2');
    assert.equal(player(next, '丁家').wins, 0);
    assert.equal(player(next, '丁家').selfDraws, 0);
    assert.equal(next.dealerId, idOf(next, '丙家'));
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈南風');
  });

  it('uses another 自摸倍數 in the 詐糊賠位自摸 total', () => {
    const rules = setMultiplier(setFanRange(createPresetDraft('51-full'), 3, 13), '2');
    const session = four('51', rules);
    const preview = previewWin(session, {
      winnerId: idOf(session, '甲家'),
      fan: 13,
      discarderId: null,
      falseWin: true,
      falseWinAsSelfDraw: true,
    });
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['-16384 × 2.00 × 3', '總分 -98304']);
    assert.equal(preview.deltas.find((item) => item.playerId === idOf(session, '乙家'))?.delta, '32768');
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

  it('pays a three-player 詐糊 from the selected fan and leaves an empty fan above 13', () => {
    const three = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    const off = recordWin(three, { winnerId: idOf(three, '甲家'), fan: 4, discarderId: null, falseWin: true });
    assert.equal(balance(off, '甲家'), '-12');
    assert.equal(balance(off, '乙家'), '6');
    assert.equal(balance(off, '丙家'), '6');
    assert.equal(player(off, '甲家').wins, 0);
    const half = startNamed(createPresetDraft('3fan4-half-three'), ['甲家', '乙家', '丙家']);
    const on = previewWin(half, {
      winnerId: idOf(half, '甲家'),
      fan: 8,
      discarderId: null,
      falseWin: true,
      falseWinAsSelfDraw: true,
    });
    assert.equal(on?.deltas.find((item) => item.playerId === idOf(half, '乙家'))?.delta, '36');
    assert.equal(on?.deltas.find((item) => item.playerId === idOf(half, '甲家'))?.delta, '-72');
    const started = four('custom');
    const session = { ...started, rules: setFanRange(started.rules, 3, 14) };
    assert.equal(previewWin(session, { winnerId: idOf(session, '甲家'), fan: 14, discarderId: null, falseWin: true }), null);
    const reserve = addReserve(wide51(), '戊家');
    const next = recordWin(reserve, { winnerId: idOf(reserve, '丁家'), fan: 13, discarderId: null, falseWin: true });
    assert.equal(balance(next, '戊家'), '0');
  });
});

describe('出銃者包自摸', () => {
  it('makes only the discarder pay the self-draw total and counts the hand as 自摸', () => {
    const rules = setPaymentMode(setOrdinary(setFanRange(createPresetDraft('51-full'), 3, 13), 3, '15'), 'half-discard');
    const session = withBalances(addReserve(four('51', rules), '戊家'), {
      甲家: '-15/4',
      乙家: '-15/4',
      丙家: '-15/2',
      丁家: '15',
    });
    const input = {
      winnerId: idOf(session, '丁家'),
      fan: 5,
      discarderId: idOf(session, '丙家'),
      discarderPaysSelfDraw: true,
    };
    const preview = previewWin(session, input);
    assert.ok(preview);
    assert.equal(preview.kind, 'self-draw');
    assert.deepEqual(formatWinPreview(preview), ['64 × 1.50', '總分 96']);

    const next = recordWin(session, input);
    assert.equal(formatAmount(balance(next, '甲家')), '-3.75');
    assert.equal(formatAmount(balance(next, '乙家')), '-3.75');
    assert.equal(formatAmount(balance(next, '丙家')), '-103.5');
    assert.equal(formatAmount(balance(next, '丁家')), '111');
    assert.equal(balance(next, '丙家'), '-207/2');
    assert.equal(balance(next, '戊家'), '0');
    assert.equal(player(next, '丁家').wins, 1);
    assert.equal(player(next, '丁家').selfDraws, 1);
    assert.equal(player(next, '丙家').discards, 0);
    assert.equal(next.ledger.at(-1)?.label, '5番 自摸');
    assert.equal(next.dealerId, idOf(next, '乙家'));
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈南風');
  });

  it('makes one three-player payer cover 包自摸 and still rejects a 包自摸 一炮多響', () => {
    const three = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    const covered = recordWin(three, {
      winnerId: idOf(three, '甲家'),
      fan: 5,
      discarderId: idOf(three, '丙家'),
      discarderPaysSelfDraw: true,
    });
    assert.equal(balance(covered, '甲家'), '16');
    assert.equal(balance(covered, '丙家'), '-16');
    assert.equal(balance(covered, '乙家'), '0');
    assert.equal(player(covered, '甲家').selfDraws, 1);
    assert.equal(player(covered, '丙家').discards, 0);
    const half = startNamed(createPresetDraft('3fan4-half-three'), ['甲家', '乙家', '丙家']);
    const spicy = previewWin(half, {
      winnerId: idOf(half, '甲家'),
      fan: 8,
      discarderId: idOf(half, '乙家'),
      discarderPaysSelfDraw: true,
    });
    assert.equal(spicy?.total, '36');
    const session = four('51', setFanRange(createPresetDraft('51-full'), 3, 13));
    assert.equal(
      previewWin(session, {
        winnerId: idOf(session, '丁家'),
        fan: 5,
        discarderId: idOf(session, '丙家'),
        discarderPaysSelfDraw: true,
        also: [{ playerId: idOf(session, '乙家'), fan: 4 }],
      }),
      null,
    );
  });
});

describe('出銃者包輸', () => {
  it('makes only the discarder pay the ordinary amount', () => {
    const rules = setPaymentMode(setOrdinary(setFanRange(createPresetDraft('51-full'), 3, 13), 3, '15'), 'half-discard');
    const session = withBalances(four('51', rules), {
      甲家: '-15/4',
      乙家: '-15/4',
      丙家: '-207/2',
      丁家: '111',
    });
    const input = {
      winnerId: idOf(session, '丁家'),
      fan: 4,
      discarderId: idOf(session, '丙家'),
      discarderPaysLoss: true,
    };
    const preview = previewWin(session, input);
    assert.ok(preview);
    assert.equal(preview.kind, 'discard');
    assert.deepEqual(formatWinPreview(preview), ['食糊分數 32', '總分 32']);

    const next = recordWin(session, input);
    assert.equal(formatAmount(balance(next, '甲家')), '-3.75');
    assert.equal(formatAmount(balance(next, '乙家')), '-3.75');
    assert.equal(formatAmount(balance(next, '丙家')), '-135.5');
    assert.equal(formatAmount(balance(next, '丁家')), '143');
    assert.equal(balance(next, '丙家'), '-271/2');
    assert.equal(player(next, '丁家').wins, 1);
    assert.equal(player(next, '丁家').selfDraws, 0);
    assert.equal(player(next, '丙家').discards, 1);
    assert.equal(next.ledger.at(-1)?.label, '4番 食糊');
  });

  it('does not score both 包 toggles or a 包輸 一炮多響, and one three-player payer covers 包輸', () => {
    const rules = setPaymentMode(setFanRange(createPresetDraft('51-full'), 3, 13), 'half-discard');
    const session = four('51', rules);
    const both = {
      winnerId: idOf(session, '丁家'),
      fan: 4,
      discarderId: idOf(session, '丙家'),
      discarderPaysSelfDraw: true,
      discarderPaysLoss: true,
    };
    assert.equal(previewWin(session, both), null);
    assert.equal(
      previewWin(session, {
        winnerId: idOf(session, '丁家'),
        fan: 4,
        discarderId: idOf(session, '丙家'),
        discarderPaysLoss: true,
        also: [{ playerId: idOf(session, '乙家'), fan: 5 }],
      }),
      null,
    );
    const three = startNamed(setPlayerFormat(createPresetDraft('3fan4-full'), 'three'), ['甲家', '乙家', '丙家']);
    const covered = recordWin(three, {
      winnerId: idOf(three, '甲家'),
      fan: 4,
      discarderId: idOf(three, '丙家'),
      discarderPaysLoss: true,
    });
    assert.equal(balance(covered, '甲家'), '6');
    assert.equal(balance(covered, '丙家'), '-6');
    assert.equal(balance(covered, '乙家'), '0');
    assert.equal(player(covered, '丙家').discards, 1);
  });
});

describe('Jackpot 流局', () => {
  it('takes 10 from each seated player and stacks a second 流局 to 80', () => {
    const rules = setJackpotContribution(setJackpotEnabled(createCustomDraft(), true), '10');
    const seated = startSession({
      rules,
      names: ['丙家', '甲家', '乙家', '丁家'],
      dealerIndex: 0,
      startedAt,
    });
    const session = withDealer(
      withBalances(seated, { 甲家: '98289/4', 乙家: '98289/4', 丙家: '48881/2', 丁家: '-73585' }),
      '丙家',
      'east',
      'south',
    );
    const next = recordDraw(session);
    assert.equal(formatAmount(balance(next, '甲家')), '24562.25');
    assert.equal(formatAmount(balance(next, '乙家')), '24562.25');
    assert.equal(formatAmount(balance(next, '丙家')), '24430.5');
    assert.equal(balance(next, '丁家'), '-73595');
    assert.equal(next.pool, '40');
    assert.equal(next.dealerId, idOf(next, '甲家'));
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈西風');
    assert.equal(next.ledger.at(-1)?.label, '流局');

    const second = recordDraw(next);
    assert.equal(formatAmount(balance(second, '甲家')), '24552.25');
    assert.equal(formatAmount(balance(second, '乙家')), '24552.25');
    assert.equal(formatAmount(balance(second, '丙家')), '24420.5');
    assert.equal(balance(second, '丁家'), '-73605');
    assert.equal(second.pool, '80');
    assert.equal(second.dealerId, idOf(second, '乙家'));
    assert.equal(formatWind(second.roundWind, second.seatWind), '東圈北風');
    const restored = undoLatest(second);
    assert.equal(restored.pool, '40');
    assert.equal(balance(restored, '丁家'), '-73595');
  });

  it('stacks three 流局 from 東圈東風 until the pool is 120', () => {
    const rules = setJackpotContribution(setJackpotEnabled(createCustomDraft(), true), '10');
    let session = startSession({
      rules,
      names: ['丁家', '甲家', '丙家', '乙家'],
      dealerIndex: 0,
      startedAt,
    });
    session = recordDraw(session);
    session = recordDraw(session);
    session = recordDraw(session);
    assert.equal(balance(session, '甲家'), '-30');
    assert.equal(balance(session, '乙家'), '-30');
    assert.equal(balance(session, '丙家'), '-30');
    assert.equal(balance(session, '丁家'), '-30');
    assert.equal(session.pool, '120');
    assert.equal(session.dealerId, idOf(session, '乙家'));
    assert.equal(formatWind(session.roundWind, session.seatWind), '東圈北風');
  });

  it('does not charge a reserve and leaves a zero contribution unchanged', () => {
    const rules = setJackpotContribution(setJackpotEnabled(createCustomDraft(), true), '10');
    const next = recordDraw(addReserve(four('custom', rules), '戊家'));
    assert.equal(balance(next, '戊家'), '0');
    assert.equal(balance(next, '甲家'), '-10');
    assert.equal(next.pool, '40');

    const zero = recordDraw(four('custom', setJackpotEnabled(createCustomDraft(), true)));
    assert.equal(balance(zero, '甲家'), '0');
    assert.equal(zero.pool, '0');
  });

  it('still raises 冧 when 流局時過莊 is off', () => {
    const rules = setJackpotContribution(setJackpotEnabled(setPassDealerOnDraw(createCustomDraft(), false), true), '10');
    const session = withDealer(four('custom', rules), '丁家');
    const next = recordDraw(session);
    assert.equal(session.dealerId, idOf(session, '丁家'));
    assert.equal(next.dealerId, idOf(next, '丁家'));
    assert.equal(formatDealerBadge(next.dealerMark), '冧1');
    assert.equal(formatWind(next.roundWind, next.seatWind), '東圈東風');
    assert.equal(balance(next, '丁家'), '-10');
    assert.equal(next.pool, '40');
  });
});

describe('贏取Jackpot', () => {
  it('adds the pool to a 13-fan 自摸 and leaves that amount out of the opponents’ payments', () => {
    const rules = setJackpotEnabled(setFanRange(createPresetDraft('51-full'), 3, 13), true);
    const session = withPool(four('51', rules), '80');
    const input = { winnerId: idOf(session, '丁家'), fan: 13, discarderId: null, takeJackpot: true };
    const preview = previewWin(session, input);
    assert.ok(preview);
    assert.deepEqual(formatWinPreview(preview), ['16384 × 1.50 + Jackpot 80', '總分 24656']);
    assert.equal(preview.deltas.find((item) => item.playerId === idOf(session, '甲家'))?.delta, '-8192');

    const next = recordWin(session, input);
    assert.equal(balance(next, '丁家'), '24656');
    assert.equal(balance(next, '甲家'), '-8192');
    assert.equal(balance(next, '乙家'), '-8192');
    assert.equal(balance(next, '丙家'), '-8192');
    assert.equal(next.pool, '0');
    assert.equal(player(next, '丁家').selfDraws, 1);
    const restored = undoLatest(next);
    assert.equal(restored.pool, '80');
    assert.equal(balance(restored, '丁家'), '0');
  });

  it('does not award a 詐糊 or a 一炮多響', () => {
    const rules = setJackpotEnabled(setFanRange(createPresetDraft('51-full'), 3, 13), true);
    const session = withPool(four('51', rules), '80');
    assert.equal(
      previewWin(session, {
        winnerId: idOf(session, '丁家'),
        fan: 13,
        discarderId: null,
        falseWin: true,
        takeJackpot: true,
      }),
      null,
    );
    assert.equal(
      previewWin(session, {
        winnerId: idOf(session, '丁家'),
        fan: 5,
        discarderId: idOf(session, '丙家'),
        also: [{ playerId: idOf(session, '乙家'), fan: 4 }],
        takeJackpot: true,
      }),
      null,
    );
    assert.equal(session.pool, '80');
  });
});

describe('平分Jackpot', () => {
  it('pays an equal share to each of the four seated players and leaves 莊 in place', () => {
    const rules = setJackpotEnabled(createCustomDraft(), true);
    const session = withPool(
      withDealer(
        withBalances(four('custom', rules), { 甲家: '-50', 乙家: '-50', 丙家: '-50', 丁家: '-50' }),
        '丙家',
        'south',
        'south',
      ),
      '200',
    );
    const next = splitJackpot(session, seatedIds(session));
    assert.equal(balance(next, '甲家'), '0');
    assert.equal(balance(next, '乙家'), '0');
    assert.equal(balance(next, '丙家'), '0');
    assert.equal(balance(next, '丁家'), '0');
    assert.equal(next.pool, '0');
    assert.equal(next.dealerId, idOf(next, '丙家'));
    assert.equal(formatDealerBadge(next.dealerMark), '莊');
    assert.equal(formatWind(next.roundWind, next.seatWind), '南圈南風');
    assert.equal(next.handCount, session.handCount);
    assert.equal(next.ledger.at(-1)?.label, '平分Jackpot');
    const restored = undoLatest(next);
    assert.equal(restored.pool, '200');
    assert.equal(balance(restored, '丙家'), '-50');
  });

  it('splits the whole pool across a chosen subset and leaves a never-seated reserve out', () => {
    const rules = setJackpotEnabled(createCustomDraft(), true);
    const session = withPool(withBalances(addReserve(four('custom', rules), '戊家'), { 戊家: '7' }), '200');
    const seated = seatedIds(session);
    const reserveId = idOf(session, '戊家');
    assert.equal(eligibleJackpotIds(session).includes(reserveId), false);
    assert.equal(splitJackpot(session, [reserveId, ...seated.slice(0, 2)]), session);
    const pair = splitJackpot(session, seated.slice(0, 2));
    assert.equal(balance(pair, '甲家'), '100');
    assert.equal(balance(pair, '乙家'), '100');
    assert.equal(balance(pair, '丙家'), '0');
    assert.equal(balance(pair, '戊家'), '7');
    assert.equal(pair.pool, '0');
    const three = withPool(
      startNamed(setJackpotEnabled(setPlayerFormat(createCustomDraft(), 'three'), true), ['甲家', '乙家', '丙家']),
      '200',
    );
    const shared = splitJackpot(three, seatedIds(three));
    assert.equal(balance(shared, '甲家'), '200/3');
    const swapped = substitute(session, reserveId, 0);
    assert.equal(eligibleJackpotIds(swapped).includes(idOf(swapped, '甲家')), false);
    assert.equal(splitJackpot(swapped, [idOf(swapped, '甲家')]), swapped);

    const video = withPool(four('custom', rules), '80');
    const chosen = [idOf(video, '甲家'), idOf(video, '丙家')];
    const paid = splitJackpot(video, chosen);
    assert.equal(balance(paid, '甲家'), '40');
    assert.equal(balance(paid, '丙家'), '40');
    assert.equal(balance(paid, '乙家'), '0');
    assert.equal(paid.pool, '0');
    assert.equal(splitJackpot(video, []), video);
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

describe('fan bounds', () => {
  it('refuses a fan below 起糊 and caps a fan above 滿糊 at the 滿糊 amount', () => {
    const session = four('custom');
    const low = { winnerId: idOf(session, '丙家'), fan: 2, discarderId: idOf(session, '乙家') };
    assert.equal(previewWin(session, low), null);
    assert.equal(winRefusal(session.rules, [2]), '番數不足');
    assert.equal(recordWin(session, low), session);

    const high = { winnerId: idOf(session, '丙家'), fan: 14, discarderId: idOf(session, '乙家') };
    const preview = previewWin(session, high);
    assert.ok(preview);
    assert.equal(preview.scoringFan, 8);
    assert.equal(preview.ordinary, '128');
    assert.equal(formatWinPreview(preview)[0], '按8番計');
    const next = recordWin(session, high);
    assert.equal(player(next, '丙家').fanSum, 8);
    assert.equal(player(next, '乙家').discardFanSum, 8);
    assert.equal(next.ledger.at(-1)?.label, '14番 食糊');
  });
});

describe('normal-hand counts', () => {
  it('adds one hand, one 出銃, and each winner’s own fan', () => {
    const session = four('custom');
    const next = recordWin(session, {
      winnerId: idOf(session, '乙家'),
      fan: 3,
      discarderId: idOf(session, '甲家'),
      also: [{ playerId: idOf(session, '丙家'), fan: 8 }],
    });
    assert.equal(player(next, '甲家').discards, 1);
    assert.equal(player(next, '甲家').discardFanSum, 11);
    assert.equal(player(next, '乙家').fanSum, 3);
    assert.equal(player(next, '丙家').fanSum, 8);
    assert.equal(player(next, '丁家').hands, 1);
    assert.equal(player(next, '丁家').wins, 0);
    assert.equal(player(next, '甲家').bestDealerStreak, 0);
  });

  it('does not count 詐糊 toward H, and a non-dealer 詐糊 continues 留莊', () => {
    const session = four('custom');
    const next = recordWin(session, {
      winnerId: idOf(session, '丁家'),
      fan: 5,
      discarderId: null,
      falseWin: true,
    });
    assert.equal(player(next, '甲家').hands, 0);
    assert.equal(player(next, '丁家').wins, 0);
    assert.equal(player(next, '甲家').dealerStreak, 1);
    assert.equal(player(next, '甲家').bestDealerStreak, 1);
  });

  it('counts a 流局 with 過莊 off as 留莊', () => {
    const rules = setPassDealerOnDraw(createCustomDraft(), false);
    let session = withDealer(four('custom', rules), '丁家');
    session = recordDraw(session);
    session = recordDraw(session);
    session = recordDraw(session);
    assert.equal(player(session, '丁家').hands, 3);
    assert.equal(player(session, '丁家').bestDealerStreak, 3);
    assert.equal(player(session, '甲家').bestDealerStreak, 0);
  });
});

describe('入原玩家帳', () => {
  it('posts the substitute’s money to the original player and keeps the win statistic', () => {
    const started = addReserve(four('custom'), '戊家');
    const reserveId = idOf(started, '戊家');
    const seated = substitute(started, reserveId, 0, true);
    const next = recordWin(seated, { winnerId: reserveId, fan: 3, discarderId: idOf(seated, '乙家') });
    assert.equal(balance(next, '甲家'), '4');
    assert.equal(balance(next, '戊家'), '0');
    assert.equal(balance(next, '乙家'), '-4');
    assert.equal(player(next, '戊家').wins, 1);
    assert.equal(player(next, '甲家').wins, 0);
  });
});

function wide51() {
  return four('51', setFanRange(createPresetDraft('51-full'), 3, 13));
}

function seatedIds(session: ReturnType<typeof startNamed>): string[] {
  return session.seats.flatMap((seat) => (seat.playerId ? [seat.playerId] : []));
}

function withPool(session: ReturnType<typeof startNamed>, pool: string) {
  return commitBoard(session, '彩池', {
    players: session.players,
    seats: session.seats,
    dealerId: session.dealerId,
    dealerMark: session.dealerMark,
    roundWind: session.roundWind,
    seatWind: session.seatWind,
    handCount: session.handCount,
    pool,
  });
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
