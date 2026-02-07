// shared/hooks/useUtmParams.ts
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUtmParams } from "@/store/utm";
import { RootState } from "@/store/store";
import { UtmParams } from "@/shared/types/utm";
import { 
  loadUtmFromStorage, 
  saveUtmToStorage, 
  hasAnyUtmMarkers,
  hasAnyParams,
} from "@/shared/lib/utmStorage";

export const useUtmParams = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const utmState = useSelector((state: RootState) => state.utm);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Загружаем сохраненные параметры из localStorage
    const storedUtm = loadUtmFromStorage() || {};
    
    // Извлекаем параметры из URL
    const urlUtmParams: UtmParams = {
      utm_source: searchParams?.get("utm_source") || undefined,
      utm_medium: searchParams?.get("utm_medium") || undefined,
      utm_campaign: searchParams?.get("utm_campaign") || undefined,
      utm_term: searchParams?.get("utm_term") || undefined,
      utm_content: searchParams?.get("utm_content") || undefined,
      utm_name: searchParams?.get("utm_name") || undefined,
      utm_phone: searchParams?.get("utm_phone") || undefined,
      utm_email: searchParams?.get("utm_email") || undefined,
      utm_leadid: searchParams?.get("utm_leadid") || undefined,
      utm_yclientid: searchParams?.get("utm_yclientid") || undefined,
      utm_gaclientid: searchParams?.get("utm_gaclientid") || undefined,
      ref_user: searchParams?.get("ref_user") || searchParams?.get("ref_id") || undefined,
      city: searchParams?.get("city") || undefined,
    };

    // Проверяем, есть ли в URL UTM-метки (без учета city)
    const hasUtmInUrl = hasAnyUtmMarkers(urlUtmParams);
    
    // Если в URL есть UTM-метки, обновляем их
    // Если нет UTM-меток, но есть city - только обновляем city, не трогая старые UTM-метки
    let finalUtmParams: UtmParams = { ...storedUtm };
    
    if (hasUtmInUrl) {
      // Если в URL есть UTM-метки, обновляем их, но сохраняем старый city если он не передан в URL
      finalUtmParams = {
        ...finalUtmParams,
        ...urlUtmParams,
        // Если city не передан в URL, сохраняем старый
        city: urlUtmParams.city !== undefined ? urlUtmParams.city : finalUtmParams.city,
      };
    } else {
      // Если UTM-меток в URL нет, обновляем только city если он есть в URL
      if (urlUtmParams.city !== undefined) {
        finalUtmParams.city = urlUtmParams.city;
      }
      
      // Также добавляем ref_user если он есть в URL
      if (urlUtmParams.ref_user !== undefined) {
        finalUtmParams.ref_user = urlUtmParams.ref_user;
      }
    }
    
    // Если city из URL, сохраняем его отдельно для использования в заказах
    if (urlUtmParams.city && typeof window !== 'undefined') {
      localStorage.setItem('selected_city', urlUtmParams.city);
    }

    // Также проверяем sessionStorage для автоматически определенного города
    // если город не установлен ни в URL, ни в localStorage
    if (!finalUtmParams.city && typeof window !== 'undefined') {
      try {
        const detectedCity = sessionStorage.getItem('detected_city');
        if (detectedCity) {
          const parsed = JSON.parse(detectedCity);
          finalUtmParams.city = parsed.cityName || parsed.name;
        }
      } catch (e) {
        // Игнорируем ошибки
      }
    }

    // Если есть какие-либо параметры, сохраняем в Redux и localStorage
    if (hasAnyParams(finalUtmParams)) {
      dispatch(setUtmParams(finalUtmParams));
      saveUtmToStorage(finalUtmParams);
    }
  }, [searchParams, dispatch]);

  return {
    utmParams: utmState,
    hasUtmParams: hasAnyUtmMarkers(utmState),
  };
};