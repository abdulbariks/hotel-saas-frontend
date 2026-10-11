import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/models";

export interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  initialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.user = action.payload.user;
      state.status = "authenticated";
      state.initialized = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.status = "unauthenticated";
      state.initialized = true;
    },
    setAuthStatus: (state, action: PayloadAction<AuthState["status"]>) => {
      state.status = action.payload;
      state.initialized = true;
    },
  },
});

export const { setCredentials, clearCredentials, setAuthStatus } =
  authSlice.actions;

export default authSlice.reducer;
