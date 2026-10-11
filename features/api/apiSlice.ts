import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken, getTenantContext } from "@/lib/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "same-origin",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");

      const token = getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const tenantId = getTenantContext();
      if (tenantId) {
        headers.set("x-tenant-id", tenantId);
      }

      return headers;
    },
  }),
  tagTypes: ["Auth", "Tenant", "Room", "Booking"],
  endpoints: () => ({}),
});

export default apiSlice;
