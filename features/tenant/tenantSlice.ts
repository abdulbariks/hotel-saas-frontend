import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  clearTenantContext,
  getTenantContext,
  setTenantContext,
} from "@/lib/cookies";

export interface TenantState {
  currentTenantId: string | null;
}

const initialState: TenantState = {
  currentTenantId: getTenantContext() ?? null,
};

export const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setCurrentTenant: (state, action: PayloadAction<string | null>) => {
      state.currentTenantId = action.payload;

      if (action.payload) {
        setTenantContext(action.payload);
      } else {
        clearTenantContext();
      }
    },
  },
});

export const { setCurrentTenant } = tenantSlice.actions;

export default tenantSlice.reducer;
