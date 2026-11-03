import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export const fulfillmentService = {
  // Handover (O24)
  getHandoverChecklist: (orderCode) =>
    axiosClient.get(API_ENDPOINTS.RENTAL_HANDOVER.HANDOVER_CHECKLIST(orderCode)),

  scanHandover: (orderCode, payload) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.HANDOVER_SCAN(orderCode), payload),

  completeHandover: (orderCode, payload) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.HANDOVER_COMPLETE(orderCode), payload),

  // Return (O25)
  getReturnChecklist: (orderCode) =>
    axiosClient.get(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_CHECKLIST(orderCode)),

  scanReturn: (orderCode, payload) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_SCAN(orderCode), payload),

  reportLostAsset: (orderCode, payload) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_REPORT_LOST(orderCode), payload),

  completeReturn: (orderCode, payload) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_HANDOVER.RETURN_COMPLETE(orderCode), payload),

  // Charges & Settlement (O26)
  getRentalCharges: (orderCode) =>
    axiosClient.get(API_ENDPOINTS.RENTAL_CHARGES.BY_ORDER(orderCode)),

  createRentalCharge: (orderCode, payload) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.CREATE(orderCode), payload),

  assessRentalCharge: (chargeId) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.ASSESS(chargeId)),

  voidRentalCharge: (chargeId, payload) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.VOID(chargeId), payload),

  completeOrder: (orderCode) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_CHARGES.COMPLETE_ORDER(orderCode)),
};
