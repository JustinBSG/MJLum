import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FAN_HELP_BODY, FAN_HELP_TITLE } from './fan-help.ts';

describe('番數? copy', () => {
  it('uses 現時設定下 and 這裏 with 裏', () => {
    assert.equal(FAN_HELP_TITLE, '現時設定下');
    assert.equal(FAN_HELP_BODY, '這裏只需輸入牌型番數');
    assert.equal(FAN_HELP_BODY.codePointAt(1), 0x88cf);
    assert.equal(FAN_HELP_BODY.includes('裡'), false);
  });
});
