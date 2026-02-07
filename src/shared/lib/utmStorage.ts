// shared/lib/utmStorage.ts
import { UtmParams } from "../types/utm";

const UTM_STORAGE_KEY = 'utm_params';

export interface StoredUtmParams extends UtmParams {
  savedAt: string;
}

export const saveUtmToStorage = (utmParams: UtmParams): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = loadUtmFromStorage() || {};
    
    const mergedParams = { ...existing, ...utmParams };
    
    const storedData: StoredUtmParams = {
      ...mergedParams,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(storedData));
  } catch (error) {
    console.error('Failed to save UTM to localStorage:', error);
  }
};

export const loadUtmFromStorage = (): UtmParams | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as StoredUtmParams;
    const savedAt = new Date(parsed.savedAt);
    const now = new Date();
    
    const daysDiff = (now.getTime() - savedAt.getTime()) / (1000 * 3600 * 24);
    if (daysDiff > 30) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }
    
    const { savedAt: _, ...utmParams } = parsed;
    return utmParams;
  } catch (error) {
    console.error('Failed to load UTM from localStorage:', error);
    return null;
  }
};

export const clearUtmStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UTM_STORAGE_KEY);
};

export const hasAnyUtmMarkers = (params: UtmParams): boolean => {
  const utmKeys = [
    'utm_source',
    'utm_medium', 
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_name',
    'utm_phone',
    'utm_email',
    'utm_leadid',
    'utm_yclientid',
    'utm_gaclientid',
    'ref_user'
  ];
  
  return utmKeys.some(key => 
    params[key as keyof UtmParams] !== undefined && 
    params[key as keyof UtmParams] !== null && 
    params[key as keyof UtmParams] !== ''
  );
};

export const hasAnyParams = (params: UtmParams): boolean => {
  return Object.values(params).some(value => 
    value !== undefined && value !== null && value !== ''
  );
};

export const getCityFromStorage = (): string => {
  if (typeof window === 'undefined') return "";
  
  try {
    const selectedCity = localStorage.getItem('selected_city');
    if (selectedCity) return selectedCity;
    
    const detectedCity = sessionStorage.getItem('detected_city');
    if (detectedCity) {
      const parsed = JSON.parse(detectedCity);
      return parsed.cityName || parsed.name;
    }
    
    return "";
  } catch (error) {
    console.error('Failed to get city from storage:', error);
    return "";
  }
};