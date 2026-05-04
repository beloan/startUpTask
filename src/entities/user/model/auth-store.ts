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
  smsPendingPhone: string | null;
  smsCodeSentAt: number | null;
  login: (phone: string, type: string, token?: string) => Promise<void>;
  requestBuyerSmsCode: (phone: string) => Promise<boolean>;
  verifyBuyerSmsCode: (phone: string, code: string) => Promise<boolean>;
  logout: () => void;
}

const normalizePhone = (rawPhone: string) => {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `7${digits}`;
  }
  return digits;
};

const storeSmsVerification = (smsData: { code: string; phone: string; expiresAt: number }) => {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(smsData);
  try {
    sessionStorage.setItem("sms_verification", payload);
    return;
  } catch (error) {
    // Fallback for strict storage policies.
  }
  try {
    localStorage.setItem("sms_verification", payload);
  } catch (error) {
    // Ignore storage failures in restricted environments.
  }
};

const readSmsVerification = () => {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem("sms_verification");
    if (value) return JSON.parse(value);
  } catch (error) {
    // Ignore and fall back to localStorage.
  }
  try {
    const value = localStorage.getItem("sms_verification");
    if (value) return JSON.parse(value);
  } catch (error) {
    return null;
  }
  return null;
};

const clearSmsVerification = () => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("sms_verification");
  } catch (error) {
    // Ignore and fall back to localStorage.
  }
  try {
    localStorage.removeItem("sms_verification");
  } catch (error) {
    // Ignore storage failures in restricted environments.
  }
};

const generateMockUser = (phone: string, type: string): User => {
  const isSeller = type === 'seller';
  const id = Math.floor(Math.random() * 10000);
  
  const buyerData = {
    id,
    name: `Покупатель`,
    contragent_phone: phone,
    type: 'buyer' as const,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    registration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const sellerData = {
    id,
    name: `Продавец`,
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
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      smsPendingPhone: null,
      smsCodeSentAt: null,
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
      requestBuyerSmsCode: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          // Validate phone format
          const cleanPhone = normalizePhone(phone);
          if (cleanPhone.length < 11) {
            throw new Error('Неверный номер телефона');
          }

          // Generate a mock SMS code (in production, call actual SMS provider API)
          const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Store SMS code in sessionStorage with expiry (5 minutes)
          const smsData = {
            code: smsCode,
            phone: cleanPhone,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
          };
          storeSmsVerification(smsData);
          console.log(`[SMS Code - Development Only]: ${smsCode}`); // For testing

          set({ 
            smsPendingPhone: cleanPhone,
            smsCodeSentAt: Date.now(),
            error: null,
          });
          return true;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка при отправке SMS' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      verifyBuyerSmsCode: async (phone: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          // Retrieve SMS code from sessionStorage
          const storedSmsData = readSmsVerification();
          const cleanPhone = normalizePhone(phone);

          // Validate SMS code
          if (!storedSmsData) {
            throw new Error('SMS код не был отправлен или истёк');
          }

          if (storedSmsData.phone !== cleanPhone) {
            throw new Error('Номер телефона не совпадает');
          }

          if (Date.now() > storedSmsData.expiresAt) {
            clearSmsVerification();
            throw new Error('SMS код истёк. Запросите новый код');
          }

          if (storedSmsData.code !== code) {
            throw new Error('Неверный SMS код');
          }

          // SMS code is valid, log in the buyer
          const mockUser = generateMockUser(cleanPhone, 'buyer');
          set({ 
            user: mockUser, 
            isAuthenticated: true,
            smsPendingPhone: null,
            smsCodeSentAt: null,
          });

          // Clear SMS verification from sessionStorage
          clearSmsVerification();
          return true;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка верификации SMS' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      logout: () => set({ user: null, isAuthenticated: false, error: null, smsPendingPhone: null, smsCodeSentAt: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist user and isAuthenticated, not SMS verification state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  ),
);