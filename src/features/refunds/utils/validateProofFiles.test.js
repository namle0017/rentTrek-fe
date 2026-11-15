import { describe, expect, it } from 'vitest';
import {
  PROOF_ACCEPT,
  PROOF_MAX_BYTES,
  PROOF_MAX_FILES,
  validateProofFiles,
} from './validateProofFiles';

const makeFile = (name = 'a.png', type = 'image/png', size = 1024) => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('validateProofFiles', () => {
  it('exposes the agreed limits', () => {
    expect(PROOF_MAX_FILES).toBe(3);
    expect(PROOF_MAX_BYTES).toBe(5 * 1024 * 1024);
    expect(PROOF_ACCEPT).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('requires at least one file by default', () => {
    expect(validateProofFiles([])).toEqual({
      isValid: false,
      error: 'Vui lòng đính kèm ít nhất 1 ảnh chứng từ',
    });
    expect(validateProofFiles(undefined).isValid).toBe(false);
  });

  it('accepts an empty list when not required', () => {
    expect(validateProofFiles([], { required: false })).toEqual({ isValid: true, error: null });
  });

  it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (type) => {
    expect(validateProofFiles([makeFile('p', type)]).isValid).toBe(true);
  });

  it('accepts exactly 3 files and rejects 4', () => {
    const three = [makeFile('1.png'), makeFile('2.png'), makeFile('3.png')];
    expect(validateProofFiles(three).isValid).toBe(true);
    const result = validateProofFiles([...three, makeFile('4.png')]);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it.each(['application/pdf', 'image/gif', 'text/plain', ''])('rejects type "%s"', (type) => {
    const result = validateProofFiles([makeFile('bad', type)]);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('bad');
  });

  it('accepts a file of exactly 5MB and rejects one byte more', () => {
    expect(validateProofFiles([makeFile('ok.png', 'image/png', PROOF_MAX_BYTES)]).isValid).toBe(true);
    const result = validateProofFiles([makeFile('big.png', 'image/png', PROOF_MAX_BYTES + 1)]);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('big.png');
  });

  it('accepts a FileList-like iterable', () => {
    expect(validateProofFiles(new Set([makeFile()])).isValid).toBe(true);
  });
});
