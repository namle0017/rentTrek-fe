import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

const refund = API_ENDPOINTS.REFUND_POLICIES;
const rental = API_ENDPOINTS.RENTAL_POLICIES;

// axiosClient trả về body ApiResponse, nên `res.data` là payload thực
const policyService = {
  getRefundPolicies: (params) => axiosClient.get(refund.ROOT, { params: cleanParams(params) }),
  getRefundPolicy: (id) => axiosClient.get(refund.BY_ID(id)),
  createRefundPolicy: (payload) => axiosClient.post(refund.ROOT, payload),
  updateRefundPolicy: (id, payload) => axiosClient.put(refund.BY_ID(id), payload),
  cloneRefundPolicy: (id) => axiosClient.post(refund.CLONE_VERSION(id)),
  activateRefundPolicy: (id) => axiosClient.post(refund.ACTIVATE(id)),
  archiveRefundPolicy: (id) => axiosClient.post(refund.ARCHIVE(id)),
  deleteRefundPolicy: (id) => axiosClient.delete(refund.BY_ID(id)),

  getRentalPolicies: () => axiosClient.get(rental.ROOT),
  getRentalPolicy: (id) => axiosClient.get(rental.BY_ID(id)),
  getActiveRentalPolicy: () => axiosClient.get(rental.ACTIVE),
  createRentalPolicyVersion: (payload) => axiosClient.post(rental.ROOT, payload),
};

export default policyService;
export { policyService };
