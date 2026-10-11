"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  authApi,
} from "@/features/api/authApi";
import { apiSlice } from "@/features/api/apiSlice";
import {
  setCredentials,
  clearCredentials,
  setAuthStatus,
  type AuthState,
} from "@/features/auth/authSlice";
import { setCurrentTenant } from "@/features/tenant/tenantSlice";
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  clearTenantContext,
} from "@/lib/cookies";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { ClientOnly } from "@/components/client-only";
import type { AuthUser } from "@/types/models";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthState["status"];
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}

/**
 * Restores the session from the token cookie. Rendered only after
 * mount so the RTK Query subscription never runs during prerender.
 */
function SessionRestore() {
  const dispatch = useAppDispatch();
  const hasToken = React.useState(() => Boolean(getAuthToken()))[0];
  const { data: me, isError } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });

  React.useEffect(() => {
    if (!hasToken) {
      dispatch(setAuthStatus("unauthenticated"));
      return;
    }

    if (me) {
      dispatch(setCredentials({ user: me }));
    } else if (isError) {
      clearAuthToken();
      clearTenantContext();
      dispatch(setAuthStatus("unauthenticated"));
    }
  }, [hasToken, me, isError, dispatch]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, status, initialized } = useAppSelector((state) => state.auth);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  const syncTenantContext = React.useCallback(async () => {
    try {
      const tenants = await dispatch(
        authApi.endpoints.listTenants.initiate(),
      ).unwrap();
      dispatch(setCurrentTenant(tenants?.[0]?.id ?? null));
    } catch {
      dispatch(setCurrentTenant(null));
    }
  }, [dispatch]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      try {
        const result = await loginMutation({ email, password }).unwrap();
        setAuthToken(result.access_token);
        dispatch(setCredentials({ user: result.user }));
        await syncTenantContext();
        router.push("/dashboard");
      } catch (error) {
        dispatch(setAuthStatus("unauthenticated"));
        throw error;
      }
    },
    [loginMutation, dispatch, router, syncTenantContext],
  );

  const register = React.useCallback(
    async (email: string, password: string) => {
      try {
        const result = await registerMutation({ email, password }).unwrap();
        setAuthToken(result.access_token);
        dispatch(setCredentials({ user: result.user }));
        router.push("/tenants");
      } catch (error) {
        dispatch(setAuthStatus("unauthenticated"));
        throw error;
      }
    },
    [registerMutation, dispatch, router],
  );

  const logout = React.useCallback(() => {
    clearAuthToken();
    clearTenantContext();
    dispatch(clearCredentials());
    dispatch(setCurrentTenant(null));
    dispatch(apiSlice.util.resetApiState());
    router.push("/login");
  }, [dispatch, router]);

  const value = React.useMemo(
    () => ({ user, status, initialized, login, register, logout }),
    [user, status, initialized, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      <ClientOnly>
        <SessionRestore />
      </ClientOnly>
      {children}
    </AuthContext.Provider>
  );
}
