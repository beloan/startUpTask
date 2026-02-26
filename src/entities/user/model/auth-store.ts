import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  email?: string;
  contragent_phone: string;
  type: 'buyer' | 'seller';
  avatar?: string;
  company_name?: string;
  address?: string;
  registration_date?: string;
  token?: string;
  balance?: number;
  is_admin?: boolean;
  username?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (phone: string, type: string, token?: string) => Promise<void>;
  logout: () => void;
}

const generateMockUser = (phone: string, type: string): User => {
  const isSeller = type === 'seller';
  const id = Math.floor(Math.random() * 10000);
  
  const buyerData = {
    id,
    name: `Иван Иванов`,
    email: `buyer${id}@example.com`,
    contragent_phone: phone,
    type: 'buyer' as const,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    registration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const sellerData = {
    id,
    name: `Александр Предприниматель`,
    email: `seller${id}@company.com`,
    contragent_phone: phone,
    type: 'seller' as const,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id + 1000}`,
    company_name: `ООО "Быстрые решения"`,
    address: `Москва, ул. Ленина, 1`,
    registration_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return isSeller ? sellerData : buyerData;
};

const verifySellerToken = async (token: string): Promise<{ cashbox: any; user: any }> => {
  try {
    const cashboxResponse = await fetch(
      `https://app.tablecrm.com/api/v1/cashboxes_meta/?token=${token}`
    );
    if (!cashboxResponse.ok) {
      throw new Error('Неверный токен');
    }
    const cashboxData = await cashboxResponse.json();

    const cashbox = cashboxData.cboxes?.find((cb: any) => cb.token === token);
    if (!cashbox) {
      throw new Error('Касса не найдена');
    }

    const userResponse = await fetch(
      `https://app.tablecrm.com/api/v1/users/permissions/me/?token=${token}`
    );
    if (!userResponse.ok) {
      throw new Error('Не удалось получить данные пользователя');
    }
    const userData = await userResponse.json();

    return { cashbox, user: userData };
  } catch (error) {
    console.error('Ошибка аутентификации продавца:', error);
    throw error;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (phone: string, type: string, token?: string) => {
        set({ isLoading: true, error: null });
        try {
          if (type === 'seller' && token) {
            const { cashbox, user: userInfo } = await verifySellerToken(token);
            
            const user: User = {
              id: userInfo.user_id,
              name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || userInfo.username || 'Продавец',
              contragent_phone: phone,
              type: 'seller',
              token: cashbox.token,
              balance: cashbox.balance,
              is_admin: userInfo.is_admin,
              username: userInfo.username,
            };
            set({ user, isAuthenticated: true });
          } else {
            const mockUser = generateMockUser(phone, type);
            set({ user: mockUser, isAuthenticated: true });
          }
        } catch (error: any) {
          set({ error: error.message || 'Ошибка входа' });
        } finally {
          set({ isLoading: false });
        }
      },
      logout: () => set({ user: null, isAuthenticated: false, error: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  ),
);