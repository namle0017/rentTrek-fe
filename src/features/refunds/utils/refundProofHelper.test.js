import { describe, it, expect } from 'vitest';
import {
  packCancelReasonWithProofs,
  parseCancelReasonWithProofs,
  packAdminTransactionWithProof,
  parseAdminTransactionWithProof,
  CANCEL_CATEGORIES,
} from './refundProofHelper';

describe('refundProofHelper', () => {
  describe('packCancelReasonWithProofs', () => {
    it('đóng gói đầy đủ category, detail và proofUrls', () => {
      const packed = packCancelReasonWithProofs(
        'Medical',
        'Tôi bị chấn thương khớp gối',
        ['https://storage.vn/benh_an.jpg', 'https://storage.vn/mri.jpg']
      );
      expect(packed).toBe(
        '[Lý do: Medical] Tôi bị chấn thương khớp gối [Minh chứng: https://storage.vn/benh_an.jpg, https://storage.vn/mri.jpg]'
      );
    });

    it('hoạt động khi không có ảnh minh chứng', () => {
      const packed = packCancelReasonWithProofs('PersonalEmergency', 'Có việc bận đột xuất');
      expect(packed).toBe('[Lý do: PersonalEmergency] Có việc bận đột xuất');
    });

    it('hoạt động với giá trị rỗng/mặc định', () => {
      const packed = packCancelReasonWithProofs();
      expect(packed).toBe('[Lý do: Other]');
    });
  });

  describe('parseCancelReasonWithProofs', () => {
    it('tách chính xác chuỗi có cấu trúc chuẩn', () => {
      const raw =
        '[Lý do: ForceMajeure] Đèo bị sạt lở không thể di chuyển [Minh chứng: https://img.vn/sat_lo.jpg, https://img.vn/cam_duong.pdf]';
      const parsed = parseCancelReasonWithProofs(raw);
      expect(parsed.category).toBe('ForceMajeure');
      expect(parsed.categoryLabel).toBe(CANCEL_CATEGORIES.ForceMajeure);
      expect(parsed.detail).toBe('Đèo bị sạt lở không thể di chuyển');
      expect(parsed.proofUrls).toEqual([
        'https://img.vn/sat_lo.jpg',
        'https://img.vn/cam_duong.pdf',
      ]);
      expect(parsed.hasProofs).toBe(true);
    });

    it('tương thích ngược hoàn hảo với chuỗi text cũ chỉ có nội dung', () => {
      const raw = 'Khách bận lịch đột xuất không đi được';
      const parsed = parseCancelReasonWithProofs(raw);
      expect(parsed.category).toBe('Other');
      expect(parsed.detail).toBe('Khách bận lịch đột xuất không đi được');
      expect(parsed.proofUrls).toEqual([]);
      expect(parsed.hasProofs).toBe(false);
    });

    it('xử lý an toàn khi rawReason null hoặc undefined', () => {
      expect(parseCancelReasonWithProofs(null)).toEqual({
        category: 'Other',
        categoryLabel: CANCEL_CATEGORIES.Other,
        detail: '',
        proofUrls: [],
        hasProofs: false,
      });
    });
  });

  describe('packAdminTransactionWithProof & parseAdminTransactionWithProof', () => {
    it('đóng gói mã giao dịch và link ảnh biên lai', () => {
      const packed = packAdminTransactionWithProof(
        'VCB-20261113-8899',
        'https://storage.vn/unc_vcb.jpg'
      );
      expect(packed).toBe('VCB-20261113-8899#proof=https://storage.vn/unc_vcb.jpg');
    });

    it('đóng gói khi không có link ảnh biên lai', () => {
      const packed = packAdminTransactionWithProof('VCB-20261113-8899');
      expect(packed).toBe('VCB-20261113-8899');
    });

    it('tách chính xác chuỗi có kèm ảnh biên lai', () => {
      const raw = 'VCB-20261113-8899#proof=https://storage.vn/unc_vcb.jpg';
      const parsed = parseAdminTransactionWithProof(raw);
      expect(parsed.transactionId).toBe('VCB-20261113-8899');
      expect(parsed.proofUrl).toBe('https://storage.vn/unc_vcb.jpg');
      expect(parsed.hasProof).toBe(true);
    });

    it('tương thích ngược khi mã giao dịch cũ chỉ là text', () => {
      const raw = 'VCB-20261113-8899';
      const parsed = parseAdminTransactionWithProof(raw);
      expect(parsed.transactionId).toBe('VCB-20261113-8899');
      expect(parsed.proofUrl).toBe(null);
      expect(parsed.hasProof).toBe(false);
    });

    it('xử lý an toàn khi input null hoặc undefined', () => {
      expect(parseAdminTransactionWithProof(null)).toEqual({
        transactionId: '',
        proofUrl: null,
        hasProof: false,
      });
    });
  });
});

