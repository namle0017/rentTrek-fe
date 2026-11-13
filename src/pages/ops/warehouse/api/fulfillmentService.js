import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

// Helper: Phân giải orderId (nếu truyền orderCode thì tra cứu qua search API)
const resolveOrderId = async (orderIdOrCode) => {
  if (!orderIdOrCode) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrCode);
  if (isUuid) return orderIdOrCode;

  try {
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.ROOT, {
      params: { search: orderIdOrCode, pageSize: 1 },
    });
    const found = res?.data?.items?.[0];
    return found?.orderId || orderIdOrCode;
  } catch {
    return orderIdOrCode;
  }
};

export const fulfillmentService = {
  // Handover (O24)
  getHandoverChecklist: async (orderIdOrCode) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.BY_ID(orderId));
    const order = res.data;
    if (!order) return null;

    // Chuyển đổi dữ liệu thật từ Backend (AdminRentalOrderDetailResponse)
    const items = (order.lines || []).map((line, idx) => {
      const lineAssignments = order.assignments || [];
      const scannedAssets = lineAssignments.filter(
        (a) => a.status === 'Issued' || a.status === 'Returned' || a.status === 'LostOrException'
      );
      return {
        rentalOrderItemId: line.lineId || `line-${idx}`,
        productName: line.displayName,
        variantName: line.displayName,
        variantSku: line.sku || '',
        quantityRequired: line.quantity,
        scannedCount: scannedAssets.length,
        scannedAssets,
      };
    });

    const totalRequiredCount = (order.assignments || []).length;
    const scannedCount = (order.assignments || []).filter(
      (a) => a.status === 'Issued' || a.status === 'Returned' || a.status === 'LostOrException'
    ).length;

    return {
      data: {
        orderId: order.orderId,
        orderCode: order.orderCode,
        orderStatus: order.status,
        customerName: order.customer?.fullName || 'Khách hàng',
        customerPhone: order.customer?.phone || '—',
        rentalStartAt: order.rentalStartAt,
        rentalEndAt: order.rentalEndAt,
        items,
        totalRequiredCount,
        scannedCount,
      },
    };
  },

  scanHandover: async (orderIdOrCode, payload) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    return axiosClient.post(`${API_ENDPOINTS.ADMIN_RENTAL_ORDERS.BY_ID(orderId)}/handover/scan`, {
      assetCode: payload.assetCode,
    });
  },

  completeHandover: async (orderIdOrCode, payload) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    return axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.HANDOVER(orderId), {
      assignmentIds: payload?.assignmentIds || [],
    });
  },

  // Return (O25)
  getReturnChecklist: async (orderIdOrCode) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.BY_ID(orderId));
    const order = res.data;
    if (!order) return null;

    const items = (order.assignments || []).map((a) => ({
      assignmentId: a.assignmentId,
      equipmentAssetId: a.assignmentId,
      assetCode: a.assetCode,
      productName: a.displayName || order.lines?.[0]?.displayName || 'Thiết bị',
      variantName: a.displayName || 'Tiêu chuẩn',
      status: a.status,
      returnCondition: a.returnCondition || 'Normal',
      conditionNote: null,
      // BE chưa trả giá trị đền bù theo thiết bị → để null, nhân viên tự nhập phí mất đồ
      variantPriceTier: a.variantPriceTier ?? a.replacementValue ?? null,
    }));

    return {
      data: {
        orderId: order.orderId,
        orderCode: order.orderCode,
        orderStatus: order.status,
        customerName: order.customer?.fullName || 'Khách hàng',
        customerPhone: order.customer?.phone || '—',
        rentalStartAt: order.rentalStartAt,
        rentalEndAt: order.rentalEndAt,
        totalIssuedCount: items.length,
        items,
      },
    };
  },

  scanReturn: async (orderIdOrCode, payload) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    let assignmentId = payload.assignmentId;
    if (!assignmentId && payload.assetCode) {
      const orderRes = await axiosClient.get(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.BY_ID(orderId));
      const match = (orderRes.data?.assignments || []).find(
        (a) => a.assetCode.toLowerCase() === payload.assetCode.toLowerCase()
      );
      assignmentId = match?.assignmentId;
    }

    const returnRes = await axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.RETURNS(orderId), {
      items: [
        {
          assignmentId,
          condition: payload.returnCondition || 'Normal',
          note: payload.conditionNote || null,
        },
      ],
    });

    if (payload.createDamageCharge && payload.damageChargeAmount > 0) {
      await axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.CHARGES(orderId), {
        chargeType: 'Damage',
        amount: payload.damageChargeAmount,
        reason: payload.damageReason || 'Hư hại thiết bị khi trả',
        assignmentId,
      });
    }

    return returnRes;
  },

  reportLostAsset: async (orderIdOrCode, payload) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    let assignmentId = payload.assignmentId || payload.assetId;
    if (!assignmentId && payload.assetCode) {
      const orderRes = await axiosClient.get(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.BY_ID(orderId));
      const match = (orderRes.data?.assignments || []).find(
        (a) => a.assetCode.toLowerCase() === payload.assetCode.toLowerCase()
      );
      assignmentId = match?.assignmentId;
    }

    const returnRes = await axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.RETURNS(orderId), {
      items: [
        {
          assignmentId,
          condition: 'Lost',
          note: payload.reason || 'Báo mất thiết bị',
        },
      ],
    });

    if (payload.lossChargeAmount > 0) {
      await axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.CHARGES(orderId), {
        chargeType: 'Loss',
        amount: payload.lossChargeAmount,
        reason: payload.reason || 'Đền bù mất thiết bị',
        assignmentId,
      });
    }

    return returnRes;
  },

  completeReturn: async (orderIdOrCode) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    return axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.COMPLETE(orderId));
  },

  // Charges & Settlement (O26)
  getRentalCharges: async (orderIdOrCode) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    const res = await axiosClient.get(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.BY_ID(orderId));
    const charges = (res.data?.charges || []).map((c) => ({
      rentalChargeId: c.chargeId,
      chargeType: c.chargeType,
      amount: c.amount,
      reason: c.reason,
      equipmentAssetCode: c.assetCode || '—',
      status: c.status,
      createdByName: c.createdByName ?? null,
      createdAt: c.createdAt,
    }));
    return { data: charges };
  },

  createRentalCharge: async (orderIdOrCode, payload) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    return axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.CHARGES(orderId), {
      chargeType: payload.chargeType,
      amount: payload.amount,
      reason: payload.reason,
      assignmentId: payload.equipmentAssetId || undefined,
    });
  },

  assessRentalCharge: async (orderIdOrCode, chargeId) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    return axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.ASSESS_CHARGE(orderId, chargeId));
  },

  voidRentalCharge: async (orderIdOrCode, chargeId, payload) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    return axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.VOID_CHARGE(orderId, chargeId), {
      reason: payload?.voidReason || payload?.reason || 'Hủy phí',
    });
  },

  completeOrder: async (orderIdOrCode) => {
    const orderId = await resolveOrderId(orderIdOrCode);
    return axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.COMPLETE(orderId));
  },
};
