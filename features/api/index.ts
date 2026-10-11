export { apiSlice } from "./apiSlice";

export {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useCreateTenantMutation,
  useListTenantsQuery,
  useGetCurrentTenantQuery,
  useListRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useListBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} from "./authApi";

export {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getTenantContext,
  setTenantContext,
  clearTenantContext,
} from "@/lib/cookies";

export function getErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  if (typeof error === "string") return error;

  const rtkError = error as {
    status?: number;
    data?: { message?: string | string[] };
    error?: string;
  };

  if (rtkError.data?.message) {
    const { message } = rtkError.data;
    return Array.isArray(message) ? message.join(" ") : message;
  }

  if (rtkError.error) return rtkError.error;

  if (typeof rtkError.status === "number") {
    if (rtkError.status === 401)
      return "Your session expired. Please sign in again.";
    if (rtkError.status === 403) return "You don't have permission to do that.";
    if (rtkError.status === 404) return "Resource not found.";
    if (rtkError.status >= 500) return "Server error. Please try again later.";
  }

  return "Something went wrong. Please try again.";
}
