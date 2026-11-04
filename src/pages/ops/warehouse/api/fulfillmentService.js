import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import {
  getPersistentOrderHandover,
  scanPersistentHandover,
  completePersistentHandover,
  getPersistentOrderReturn,
  scanPersistentReturn,
  reportLostPersistentAsset,
  completePersistentReturn,
  getPersistentOrderCharges,
  createPersistentRentalCharge,
  assessPersistentRentalCharge,
  voidPersistentRentalCharge,
  completePersistentOrder,
} from '../constants/mockFulfillmentData';

const isMock = (orderCode) => !orderCode || orderCode.startsWith('RT-');

export const fulfillmentService = {
  // Handover (O24)
  getHandoverChecklist: async (orderCode) => {
    if (isMock(orderCode)) {
      return getPersistentOrderHandover(orderCode);
    }
    try {
      return await axiosClient.get(API_ENDPOINTS.RENTAL_HANDOVER.HANDOVER_CHECKLIST(orderCode));
    } catch {
      return getPersistentOrderHandover(orderCode);
    }
  },

  scanHandover: async (orderCode, payload) => {
    if (isMock(orderCode)) {
      return scanPersistentHandover(orderCode, payload.assetCode);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.HANDOVER_SCAN(orderCode), payload);
    } catch {
      return scanPersistentHandover(orderCode, payload.assetCode);
    }
  },

  completeHandover: async (orderCode, payload) => {
    if (isMock(orderCode)) {
      return completePersistentHandover(orderCode, payload?.incompleteReason);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.HANDOVER_COMPLETE(orderCode), payload);
    } catch {
      return completePersistentHandover(orderCode, payload?.incompleteReason);
    }
  },

  // Return (O25)
  getReturnChecklist: async (orderCode) => {
    if (isMock(orderCode)) {
      return getPersistentOrderReturn(orderCode);
    }
    try {
      return await axiosClient.get(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_CHECKLIST(orderCode));
    } catch {
      return getPersistentOrderReturn(orderCode);
    }
  },

  scanReturn: async (orderCode, payload) => {
    if (isMock(orderCode)) {
      return scanPersistentReturn(orderCode, payload);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_SCAN(orderCode), payload);
    } catch {
      return scanPersistentReturn(orderCode, payload);
    }
  },

  reportLostAsset: async (orderCode, payload) => {
    if (isMock(orderCode)) {
      return reportLostPersistentAsset(orderCode, payload);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_REPORT_LOST(orderCode), payload);
    } catch {
      return reportLostPersistentAsset(orderCode, payload);
    }
  },

  completeReturn: async (orderCode, payload) => {
    if (isMock(orderCode)) {
      return completePersistentReturn(orderCode, payload?.notes);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_COMPLETE(orderCode), payload);
    } catch {
      return completePersistentReturn(orderCode, payload?.notes);
    }
  },

  // Charges & Settlement (O26)
  getRentalCharges: async (orderCode) => {
    if (isMock(orderCode)) {
      return getPersistentOrderCharges(orderCode);
    }
    try {
      return await axiosClient.get(API_ENDPOINTS.RENTAL_CHARGES.BY_ORDER(orderCode));
    } catch {
      return getPersistentOrderCharges(orderCode);
    }
  },

  createRentalCharge: async (orderCode, payload) => {
    if (isMock(orderCode)) {
      return createPersistentRentalCharge(orderCode, payload);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.CREATE(orderCode), payload);
    } catch {
      return createPersistentRentalCharge(orderCode, payload);
    }
  },

  assessRentalCharge: async (chargeId) => {
    if (typeof chargeId === 'string' && chargeId.startsWith('chg-')) {
      return assessPersistentRentalCharge(chargeId);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.ASSESS(chargeId));
    } catch {
      return assessPersistentRentalCharge(chargeId);
    }
  },

  voidRentalCharge: async (chargeId, payload) => {
    if (typeof chargeId === 'string' && chargeId.startsWith('chg-')) {
      return voidPersistentRentalCharge(chargeId, payload);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.VOID(chargeId), payload);
    } catch {
      return voidPersistentRentalCharge(chargeId, payload);
    }
  },

  completeOrder: async (orderCode) => {
    if (isMock(orderCode)) {
      return completePersistentOrder(orderCode);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.COMPLETE_ORDER(orderCode));
    } catch {
      return completePersistentOrder(orderCode);
    }
  },
};
