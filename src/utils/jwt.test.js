import { describe, expect, it } from 'vitest';
import { USER_ROLE } from '@/constants/enums';
import { extractUserFromToken } from './jwt';

const makeToken = (payload) => `x.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.y`;

describe('extractUserFromToken', () => {
  it('lấy chuỗi đầu khi BE phát trùng claim (email dạng mảng)', () => {
    const user = extractUserFromToken(
      makeToken({ sub: 'u1', email: ['a@b.vn', 'a@b.vn'], role: 'Customer' }),
    );
    expect(user).toEqual({ userId: 'u1', email: 'a@b.vn', fullName: 'a@b.vn', role: USER_ROLE.CUSTOMER });
  });
});
