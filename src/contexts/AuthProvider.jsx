import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/features/users/api/userKeys';
import { userService } from '@/features/users/api/userService';
import { tokenStorage } from '@/utils/tokenStorage';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(tokenStorage.getAccessToken()));

  const { data: currentUser = null, isPending } = useQuery({
    queryKey: userKeys.me(),
    queryFn: userService.getMe,
    select: (res) => res.data,
    enabled: hasToken,
    staleTime: Infinity,
  });

  const login = useCallback((tokens) => {
    tokenStorage.setTokens(tokens);
    setHasToken(true);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: hasToken && currentUser !== null,
      isLoading: hasToken && isPending,
      login,
      logout,
    }),
    [currentUser, hasToken, isPending, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
