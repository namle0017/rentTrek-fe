import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/features/users/api/userKeys';
import { userService } from '@/features/users/api/userService';
import { extractUserFromToken, normalizeRole } from '@/utils/jwt';
import { tokenStorage } from '@/utils/tokenStorage';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(tokenStorage.getAccessToken()));

  // Khởi tạo user đồng bộ ngay từ localStorage hoặc payload JWT (không chờ network)
  const [storedUser, setStoredUser] = useState(() => {
    const user = tokenStorage.getUser();
    if (user) return user;
    const token = tokenStorage.getAccessToken();
    return token ? extractUserFromToken(token) : null;
  });

  const { data: userFromApi = null, isPending } = useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      try {
        const res = await userService.getMe();
        if (res?.data) {
          const userWithRole = {
            ...res.data,
            role: normalizeRole(res.data.role),
          };
          tokenStorage.setUser(userWithRole);
          setStoredUser(userWithRole);
          return userWithRole;
        }
        return res?.data ?? null;
      } catch (err) {
        // Nếu /users/me chưa được BE kích hoạt hoặc trả lỗi, không được ngắt phiên làm việc của user
        console.warn('GET /users/me failed, preserving cached user session', err);
        const fallback = tokenStorage.getUser() || extractUserFromToken(tokenStorage.getAccessToken());
        return fallback;
      }
    },
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const currentUser = userFromApi || storedUser;

  const login = useCallback(
    (authData) => {
      const accessToken = authData?.accessToken || authData?.token || authData?.jwt || authData?.access_token;
      const refreshToken = authData?.refreshToken || authData?.refresh_token;
      let user = authData?.user;

      if (!user && accessToken) {
        user = extractUserFromToken(accessToken);
      }

      if (user) {
        user = {
          ...user,
          role: normalizeRole(user.role),
        };
        tokenStorage.setUser(user);
        setStoredUser(user);
        queryClient.setQueryData(userKeys.me(), user);
      }

      tokenStorage.setTokens({ accessToken, refreshToken, user });
      setHasToken(true);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setStoredUser(null);
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(hasToken && currentUser),
      isLoading: Boolean(hasToken && !currentUser && isPending),
      login,
      logout,
    }),
    [currentUser, hasToken, isPending, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
