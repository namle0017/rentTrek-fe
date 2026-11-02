import {
  INITIAL_PAYMENTS,
  INITIAL_REFUND_POLICIES,
  INITIAL_REFUND_QUEUE,
} from './mockFinanceData';

const STORAGE_KEYS = {
  PAYMENTS: 'rentrek_mock_payments',
  REFUNDS: 'rentrek_mock_refunds',
  POLICIES: 'rentrek_mock_policies',
};

// Helper mô phỏng network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Cannot write to localStorage:', e);
  }
}

let paymentsState = loadStorage(STORAGE_KEYS.PAYMENTS, [...INITIAL_PAYMENTS]);
let refundQueueState = loadStorage(STORAGE_KEYS.REFUNDS, { ...INITIAL_REFUND_QUEUE });
let policiesState = loadStorage(STORAGE_KEYS.POLICIES, [...INITIAL_REFUND_POLICIES]);

export const mockFinanceService = {
  // Reset mock về ban đầu nếu cần
  resetMockData: () => {
    paymentsState = [...INITIAL_PAYMENTS];
    refundQueueState = { ...INITIAL_REFUND_QUEUE };
    policiesState = [...INITIAL_REFUND_POLICIES];
    saveStorage(STORAGE_KEYS.PAYMENTS, paymentsState);
    saveStorage(STORAGE_KEYS.REFUNDS, refundQueueState);
    saveStorage(STORAGE_KEYS.POLICIES, policiesState);
  },

  // 17.1. Danh sách toàn bộ giao dịch tài chính
  getAllPayments: async (params = {}) => {
    await delay();
    const {
      pageNumber = 1,
      pageSize = 10,
      paymentType,
      purpose,
      status,
      fromDate,
      toDate,
      search,
    } = params;

    let filtered = [...paymentsState];

    if (paymentType && paymentType !== 'All') {
      filtered = filtered.filter((item) => item.paymentType === paymentType);
    }
    if (purpose && purpose !== 'All') {
      filtered = filtered.filter((item) => item.purpose === purpose);
    }
    if (status && status !== 'All') {
      filtered = filtered.filter((item) => item.status === status);
    }
    if (search) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.orderCode?.toLowerCase().includes(q) ||
          item.providerTransactionId?.toLowerCase().includes(q) ||
          item.providerOrderId?.toLowerCase().includes(q),
      );
    }
    if (fromDate) {
      filtered = filtered.filter((item) => new Date(item.createdAt) >= new Date(fromDate));
    }
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => new Date(item.createdAt) <= end);
    }

    // Sắp xếp mới nhất lên đầu
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (pageNumber - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      statusCode: 200,
      message: 'Thành công',
      data: {
        items,
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize),
        totalItems,
        totalPages,
        hasPrevious: pageNumber > 1,
        hasNext: pageNumber < totalPages,
      },
    };
  },

  // Thống kê thẻ KPI giao dịch
  getPaymentStats: async () => {
    await delay(150);
    let totalCollectionSucceeded = 0;
    let totalRefundSucceeded = 0;
    let pendingCount = 0;
    let pendingAmount = 0;

    paymentsState.forEach((item) => {
      if (item.paymentType === 'Collection' && item.status === 'Succeeded') {
        totalCollectionSucceeded += item.amount;
      }
      if (item.paymentType === 'Refund' && item.status === 'Succeeded') {
        totalRefundSucceeded += Math.abs(item.amount);
      }
      if (item.status === 'Pending' || item.status === 'PendingApproval') {
        pendingCount += 1;
        pendingAmount += Math.abs(item.amount);
      }
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Thành công',
      data: {
        totalCollectionSucceeded,
        totalRefundSucceeded,
        netInflow: totalCollectionSucceeded - totalRefundSucceeded,
        pendingCount,
        pendingAmount,
      },
    };
  },

  // 17.2. Hàng đợi hoàn tiền & đối soát theo Tab
  getRefundQueue: async (tab = 'PendingApproval') => {
    await delay();
    const items = refundQueueState[tab] || [];
    return {
      success: true,
      statusCode: 200,
      message: 'Thành công',
      data: {
        tab,
        items,
        totalCount: items.length,
      },
    };
  },

  // 17.3. Duyệt hoàn tiền tự động qua SePay
  approveRefund: async (paymentId) => {
    await delay(500);
    const pendingList = refundQueueState.PendingApproval || [];
    const itemIndex = pendingList.findIndex((p) => p.paymentId === paymentId);

    if (itemIndex === -1) {
      throw {
        statusCode: 409,
        message: 'Khoản hoàn tiền không ở trạng thái Chờ duyệt (PendingApproval) hoặc đã được duyệt.',
        code: 'REFUND_NOT_APPROVABLE',
      };
    }

    const item = pendingList[itemIndex];
    pendingList.splice(itemIndex, 1);

    // Thêm vào danh sách Pending / History
    const approvedItem = {
      ...item,
      amount: -Math.abs(item.proposedRefund),
      providerRefundId: `SP-REF-${Date.now().toString().slice(-6)}`,
      sentAt: new Date().toISOString(),
      status: 'Pending',
    };
    refundQueueState.Pending.unshift(approvedItem);

    // Cập nhật dòng thanh toán trong bảng Payments
    const existingPayment = paymentsState.find((p) => p.paymentId === paymentId);
    if (existingPayment) {
      existingPayment.status = 'Pending';
      existingPayment.providerTransactionId = approvedItem.providerRefundId;
    } else {
      paymentsState.unshift({
        paymentId: item.paymentId,
        orderId: item.orderId,
        orderCode: item.orderCode,
        paymentType: 'Refund',
        purpose: 'TourFee',
        amount: -Math.abs(item.proposedRefund),
        receivedAmount: null,
        paymentMethod: 'BankTransfer',
        providerOrderId: null,
        providerTransactionId: approvedItem.providerRefundId,
        status: 'Pending',
        policyRuleDescription: item.policyRuleDescription,
        createdAt: new Date().toISOString(),
        processedAt: null,
      });
    }

    saveStorage(STORAGE_KEYS.REFUNDS, refundQueueState);
    saveStorage(STORAGE_KEYS.PAYMENTS, paymentsState);

    return {
      success: true,
      statusCode: 200,
      message: 'Duyệt lệnh hoàn tiền qua cổng SePay thành công',
      data: {
        paymentId: item.paymentId,
        orderCode: item.orderCode,
        amount: -Math.abs(item.proposedRefund),
        status: 'Pending',
        providerRefundId: approvedItem.providerRefundId,
      },
    };
  },

  // 17.4. Thử lại giao dịch hoàn tiền bị lỗi (Retry)
  retryRefund: async (paymentId) => {
    await delay(500);
    const failedList = refundQueueState.Failed || [];
    const target = failedList.find((p) => p.paymentId === paymentId);

    if (!target) {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy yêu cầu hoàn tiền lỗi.',
      };
    }

    if (target.retryCount >= 3) {
      throw {
        statusCode: 400,
        message: 'Đã thử lại tối đa 3 lần. Vui lòng chuyển sang hình thức hoàn thủ công ngoài hệ thống.',
        code: 'REFUND_RETRY_LIMIT_REACHED',
      };
    }

    target.retryCount += 1;
    target.lastAttemptAt = new Date().toISOString();

    // Giả lập: Nếu thử lại lần thứ 2 trở lên thì thành công chuyển sang History
    if (target.retryCount >= 2) {
      const idx = failedList.findIndex((p) => p.paymentId === paymentId);
      failedList.splice(idx, 1);

      refundQueueState.History.unshift({
        paymentId: target.paymentId,
        orderCode: target.orderCode,
        customerName: target.customerName,
        amount: target.amount,
        resolutionType: 'SePay Auto (Thử lại thành công)',
        referenceCode: `SP-RETRY-${Date.now().toString().slice(-6)}`,
        processedAt: new Date().toISOString(),
        status: 'Succeeded',
      });

      const payment = paymentsState.find((p) => p.paymentId === paymentId);
      if (payment) payment.status = 'Succeeded';
    }

    saveStorage(STORAGE_KEYS.REFUNDS, refundQueueState);
    saveStorage(STORAGE_KEYS.PAYMENTS, paymentsState);

    return {
      success: true,
      statusCode: 200,
      message: 'Đã gửi lệnh thử lại qua SePay',
      data: target,
    };
  },

  // 17.5. Đánh dấu đã hoàn thủ công ngoài hệ thống
  markManualRefund: async (paymentId, payload) => {
    await delay(400);
    const failedList = refundQueueState.Failed || [];
    const idx = failedList.findIndex((p) => p.paymentId === paymentId);

    if (idx === -1) {
      throw {
        statusCode: 400,
        message: 'Khoản hoàn không thuộc danh sách cần xử lý thủ công.',
        code: 'REFUND_NOT_MANUAL_ELIGIBLE',
      };
    }

    const item = failedList.splice(idx, 1)[0];

    refundQueueState.History.unshift({
      paymentId: item.paymentId,
      orderCode: item.orderCode,
      customerName: item.customerName,
      amount: item.amount,
      resolutionType: 'Manual Bank Transfer',
      referenceCode: payload.manualReference,
      notes: payload.note,
      processedAt: new Date().toISOString(),
      status: 'Succeeded',
    });

    const payment = paymentsState.find((p) => p.paymentId === paymentId);
    if (payment) {
      payment.status = 'Succeeded';
      payment.manualReference = payload.manualReference;
    }

    saveStorage(STORAGE_KEYS.REFUNDS, refundQueueState);
    saveStorage(STORAGE_KEYS.PAYMENTS, paymentsState);

    return {
      success: true,
      statusCode: 200,
      message: 'Đã ghi nhận hoàn tiền thủ công thành công',
      data: item,
    };
  },

  // 17.6. Chấp nhận khoản tiền chuyển đối soát (Reconcile Accept)
  reconcileAccept: async (orderId) => {
    await delay(500);
    const reconcileList = refundQueueState.NeedsReconciliation || [];
    const idx = reconcileList.findIndex((o) => o.orderId === orderId);

    if (idx === -1) {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy đơn hàng cần đối soát.',
      };
    }

    const order = reconcileList.splice(idx, 1)[0];

    // Nếu khách chuyển thừa tiền, tự động sinh 1 lệnh hoàn tiền thừa
    if (order.difference > 0) {
      paymentsState.unshift({
        paymentId: `pay-excess-${Date.now()}`,
        orderId: order.orderId,
        orderCode: order.orderCode,
        paymentType: 'Refund',
        purpose: 'TourFee',
        amount: -order.difference,
        receivedAmount: null,
        paymentMethod: 'BankTransfer',
        providerOrderId: null,
        providerTransactionId: `SP-REF-EXCESS-${Date.now().toString().slice(-4)}`,
        status: 'Pending',
        policyRuleDescription: 'Tự động hoàn phần tiền thừa sau đối soát',
        createdAt: new Date().toISOString(),
        processedAt: null,
      });
    }

    refundQueueState.History.unshift({
      orderId: order.orderId,
      orderCode: order.orderCode,
      customerName: order.customerName,
      amount: order.receivedAmount,
      resolutionType: 'Reconcile Accepted (Đã xác nhận đơn)',
      referenceCode: `RECON-ACC-${order.orderCode}`,
      processedAt: new Date().toISOString(),
      status: 'Succeeded',
    });

    saveStorage(STORAGE_KEYS.REFUNDS, refundQueueState);
    saveStorage(STORAGE_KEYS.PAYMENTS, paymentsState);

    return {
      success: true,
      statusCode: 200,
      message: `Đã xác nhận đơn hàng ${order.orderCode} và tự động sinh lệnh hoàn ${order.difference > 0 ? order.difference.toLocaleString('vi-VN') + ' đ thừa' : ''}`,
      data: order,
    };
  },

  // 17.7. Hoàn toàn bộ & Hủy đơn đối soát (Reconcile Refund Full)
  reconcileRefund: async (orderId) => {
    await delay(500);
    const reconcileList = refundQueueState.NeedsReconciliation || [];
    const idx = reconcileList.findIndex((o) => o.orderId === orderId);

    if (idx === -1) {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy đơn hàng cần đối soát.',
      };
    }

    const order = reconcileList.splice(idx, 1)[0];

    // Sinh giao dịch hoàn 100% tiền thực nhận
    paymentsState.unshift({
      paymentId: `pay-full-ref-${Date.now()}`,
      orderId: order.orderId,
      orderCode: order.orderCode,
      paymentType: 'Refund',
      purpose: 'TourFee',
      amount: -order.receivedAmount,
      receivedAmount: null,
      paymentMethod: 'BankTransfer',
      providerOrderId: null,
      providerTransactionId: `SP-REF-FULL-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      policyRuleDescription: 'Hoàn 100% tiền thực nhận do hủy đơn đối soát',
      createdAt: new Date().toISOString(),
      processedAt: null,
    });

    refundQueueState.History.unshift({
      orderId: order.orderId,
      orderCode: order.orderCode,
      customerName: order.customerName,
      amount: -order.receivedAmount,
      resolutionType: 'Reconcile Refund Full (Đã hoàn 100% & Đóng đơn)',
      referenceCode: `RECON-REF-${order.orderCode}`,
      processedAt: new Date().toISOString(),
      status: 'Succeeded',
    });

    saveStorage(STORAGE_KEYS.REFUNDS, refundQueueState);
    saveStorage(STORAGE_KEYS.PAYMENTS, paymentsState);

    return {
      success: true,
      statusCode: 200,
      message: `Đã hoàn trả toàn bộ ${order.receivedAmount.toLocaleString('vi-VN')} ₫ và hủy đơn ${order.orderCode}`,
      data: order,
    };
  },

  // 20.1. Danh sách chính sách hoàn tiền
  getRefundPolicies: async () => {
    await delay();
    return {
      success: true,
      statusCode: 200,
      message: 'Thành công',
      data: [...policiesState],
    };
  },

  // 20.3. Chi tiết chính sách & bảng quy tắc
  getRefundPolicyById: async (policyId) => {
    await delay(200);
    const policy = policiesState.find((p) => p.policyId === policyId);
    if (!policy) {
      throw { statusCode: 404, message: 'Chính sách hoàn tiền không tồn tại.' };
    }
    return {
      success: true,
      statusCode: 200,
      message: 'Thành công',
      data: policy,
    };
  },

  // 20.2. Tạo chính sách hoàn tiền mới
  createRefundPolicy: async (payload) => {
    await delay(400);
    const newPolicy = {
      policyId: `pol-${Date.now()}`,
      policyFamilyId: `fam-pol-${Date.now()}`,
      name: payload.name,
      policyType: payload.policyType || 'Tour',
      version: 1,
      effectiveFrom: payload.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveUntil: null,
      status: 'Active',
      activeTripsCount: 0,
      isLocked: false,
      createdBy: 'Namle Finance',
      rules: payload.rules || [
        {
          ruleId: `rule-${Date.now()}-1`,
          minHoursBefore: 72,
          refundPercentage: 80,
          description: 'Hủy trước 72 giờ: Hoàn 80%',
        },
        {
          ruleId: `rule-${Date.now()}-2`,
          minHoursBefore: 0,
          refundPercentage: 0,
          description: 'Dưới 72 giờ: Không hoàn tiền',
        },
      ],
    };
    policiesState.unshift(newPolicy);
    saveStorage(STORAGE_KEYS.POLICIES, policiesState);

    return {
      success: true,
      statusCode: 201,
      message: 'Tạo chính sách hoàn tiền mới thành công',
      data: newPolicy,
    };
  },

  // 20.4. Sửa chính sách hoàn tiền
  updateRefundPolicy: async (policyId, payload) => {
    await delay(300);
    const policy = policiesState.find((p) => p.policyId === policyId);
    if (!policy) throw { statusCode: 404, message: 'Không tìm thấy chính sách.' };

    if (policy.isLocked || policy.activeTripsCount > 0) {
      throw {
        statusCode: 409,
        message: 'Chính sách đã được áp dụng vào chuyến đi hoặc đơn hàng, không thể sửa trực tiếp. Vui lòng nhân bản phiên bản mới.',
        code: 'POLICY_ALREADY_IN_USE',
      };
    }

    Object.assign(policy, payload);
    saveStorage(STORAGE_KEYS.POLICIES, policiesState);

    return {
      success: true,
      statusCode: 200,
      message: 'Cập nhật chính sách thành công',
      data: policy,
    };
  },

  // 20.5. Cập nhật quy tắc hoàn tiền
  updateRefundPolicyRules: async (policyId, rules) => {
    await delay(400);
    const policy = policiesState.find((p) => p.policyId === policyId);
    if (!policy) throw { statusCode: 404, message: 'Không tìm thấy chính sách.' };

    if (policy.isLocked || policy.activeTripsCount > 0) {
      throw {
        statusCode: 409,
        message: 'Chính sách đã bị khóa. Vui lòng nhân bản phiên bản mới.',
        code: 'POLICY_ALREADY_IN_USE',
      };
    }

    policy.rules = rules;
    saveStorage(STORAGE_KEYS.POLICIES, policiesState);

    return {
      success: true,
      statusCode: 200,
      message: 'Cập nhật bảng quy tắc hoàn tiền thành công',
      data: policy,
    };
  },

  // 20.6. Nhân bản chính sách sang phiên bản mới (Clone Version)
  cloneRefundPolicyVersion: async (policyId) => {
    await delay(500);
    const oldPolicy = policiesState.find((p) => p.policyId === policyId);
    if (!oldPolicy) throw { statusCode: 404, message: 'Không tìm thấy chính sách gốc.' };

    // Đặt ngày kết thúc cho bản cũ
    const nowStr = new Date().toISOString().split('T')[0];
    oldPolicy.effectiveUntil = nowStr;

    // Tạo bản mới cùng familyId, version + 1
    const newVersion = (oldPolicy.version || 1) + 1;
    const clonedPolicy = {
      ...oldPolicy,
      policyId: `pol-clone-${Date.now()}`,
      name: `${oldPolicy.name} (v${newVersion})`,
      version: newVersion,
      effectiveFrom: nowStr,
      effectiveUntil: null,
      status: 'Active',
      activeTripsCount: 0,
      isLocked: false,
      rules: oldPolicy.rules.map((r) => ({ ...r, ruleId: `rule-clone-${Date.now()}-${r.minHoursBefore}` })),
    };

    policiesState.unshift(clonedPolicy);
    saveStorage(STORAGE_KEYS.POLICIES, policiesState);

    return {
      success: true,
      statusCode: 201,
      message: `Đã nhân bản chính sách sang phiên bản ${newVersion} thành công`,
      data: clonedPolicy,
    };
  },

  // Ghi nhận thanh toán thủ công ngoài hệ thống (Màn O15)
  recordManualPayment: async (payload) => {
    await delay(400);
    const newPayment = {
      paymentId: `pay-manual-${Date.now()}`,
      orderId: payload.orderId || `ord-${Date.now()}`,
      orderCode: payload.orderCode,
      paymentType: 'Collection',
      purpose: payload.purpose || 'TourFee',
      amount: Number(payload.amount),
      receivedAmount: Number(payload.amount),
      paymentMethod: 'Cash',
      providerOrderId: null,
      providerTransactionId: payload.referenceCode || `OFFLINE-REC-${Date.now().toString().slice(-4)}`,
      status: 'Succeeded',
      policyRuleDescription: `Thu thủ công: ${payload.note || 'Nộp tiền mặt/quầy'}`,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      manualReference: payload.referenceCode,
    };

    paymentsState.unshift(newPayment);
    saveStorage(STORAGE_KEYS.PAYMENTS, paymentsState);

    return {
      success: true,
      statusCode: 200,
      message: `Đã ghi nhận thanh toán thủ công ${newPayment.amount.toLocaleString('vi-VN')} ₫ cho đơn ${newPayment.orderCode}`,
      data: newPayment,
    };
  },
};

