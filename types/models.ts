export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  access_token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "RECEPTIONIST";
}

export interface RoomType {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  price: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRoomRequest {
  name: string;
  type: string;
  price: number;
  capacity?: number;
}

export interface UpdateRoomRequest {
  name?: string;
  type?: string;
  price?: number;
  capacity?: number;
  isActive?: boolean;
}

export interface Booking {
  id: string;
  tenantId: string;
  roomId: string;
  userId: string | null;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  room?: RoomType;
}

export interface CreateBookingRequest {
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}