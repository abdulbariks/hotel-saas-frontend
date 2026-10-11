import { apiSlice } from "./apiSlice";
import type {
  AuthTokens,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  CreateTenantRequest,
  Tenant,
  RoomType,
  CreateRoomRequest,
  UpdateRoomRequest,
  Booking,
  CreateBookingRequest,
} from "@/types/models";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthTokens, LoginRequest>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: build.mutation<AuthTokens, RegisterRequest>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: build.query<AuthUser, void>({
      query: () => "auth/me",
      providesTags: ["Auth"],
    }),
    createTenant: build.mutation<Tenant, CreateTenantRequest>({
      query: (body) => ({
        url: "tenants",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tenant"],
    }),
    listTenants: build.query<Tenant[], void>({
      query: () => "tenants",
      providesTags: ["Tenant"],
    }),
    getCurrentTenant: build.query<Tenant, void>({
      query: () => "tenants/current",
      providesTags: ["Tenant"],
    }),
    listRooms: build.query<RoomType[], { includeInactive?: boolean } | void>({
      query: (params) => ({
        url: "rooms",
        params:
          params && "includeInactive" in params && params.includeInactive
            ? { includeInactive: "true" }
            : undefined,
      }),
      providesTags: ["Room"],
    }),
    createRoom: build.mutation<RoomType, CreateRoomRequest>({
      query: (body) => ({
        url: "rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Room"],
    }),
    updateRoom: build.mutation<
      RoomType,
      { roomId: string; body: UpdateRoomRequest }
    >({
      query: ({ roomId, body }) => ({
        url: `rooms/${roomId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Room"],
    }),
    deleteRoom: build.mutation<void, { roomId: string }>({
      query: ({ roomId }) => ({
        url: `rooms/${roomId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),
    listBookings: build.query<Booking[], void>({
      query: () => "bookings",
      providesTags: ["Booking"],
    }),
    createBooking: build.mutation<Booking, CreateBookingRequest>({
      query: (body) => ({
        url: "bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),
    cancelBooking: build.mutation<Booking, { bookingId: string }>({
      query: ({ bookingId }) => ({
        url: `bookings/${bookingId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
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
} = authApi;

export type {
  AuthTokens,
  AuthUser,
  Tenant,
  RoomType,
  Booking,
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateBookingRequest,
  CreateTenantRequest,
  LoginRequest,
  RegisterRequest,
} from "@/types/models";
