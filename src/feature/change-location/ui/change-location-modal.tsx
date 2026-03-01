"use client";

import { PopoverClose } from "@radix-ui/react-popover";
import {
  Check,
  ChevronsUpDown,
  MapPin,
  Navigation,
  Warehouse,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { isMobile } from "react-device-detect";

import {
  fetchAddressSuggestions,
  validateAddress,
} from "@/shared/api/autosuggestions";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useLocations } from "@/shared/hooks/useLocations";
import { cn } from "@/shared/lib/utils";
import { City } from "@/shared/types/city";
import { Button } from "@/shared/ui/kit/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/kit/command";
import { Input } from "@/shared/ui/kit/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/kit/popover";
import { MapPreview } from "@/shared/ui/map-preview";

export const ChangeLocationModal = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [selected, setSelected] = useState<City | null>(null);
  const [open, setOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [suppressSuggestionsOnce, setSuppressSuggestionsOnce] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [detectedCity, setDetectedCity] = useState<{ city: string; lat: number; lon: number } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const storageKey = "bystroi_location";
  const debouncedAddress = useDebounce(addressInput, 300);
  const hasRestoredFromStorage = useRef(false);

  const normalizeForCityMatch = (value: string) => {
    return ` ${value
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim()} `;
  };

  const findCityInAddress = (address: string, list: City[]) => {
    const normalizedAddress = normalizeForCityMatch(address);
    return (
      list.find((city) => {
        const name = normalizeForCityMatch(city.name);
        const alt = city.name_alt ? normalizeForCityMatch(city.name_alt) : "";
        const en = city.name_en ? normalizeForCityMatch(city.name_en) : "";
        return (
          normalizedAddress.includes(name) ||
          (alt && normalizedAddress.includes(alt)) ||
          (en && normalizedAddress.includes(en))
        );
      }) || null
    );
  };

  const parsedCityFromAddress = useMemo(() => {
    if (!addressInput.trim() || cities.length === 0) return null;
    return findCityInAddress(addressInput, cities);
  }, [addressInput, cities]);

  useEffect(() => {
    if (!parsedCityFromAddress) return;
    if (!selected || selected.id !== parsedCityFromAddress.id) {
      setSelected(parsedCityFromAddress);
    }
  }, [parsedCityFromAddress, selected]);

  useEffect(() => {
    const addressFromUrl = searchParams.get("address");
    if (addressFromUrl) setAddressInput(addressFromUrl);

    const latFromUrl = searchParams.get("lat");
    const lonFromUrl = searchParams.get("lon");
    if (latFromUrl && lonFromUrl) {
      const lat = Number(latFromUrl);
      const lon = Number(lonFromUrl);
      if (!isNaN(lat) && !isNaN(lon)) setAddressCoords({ lat, lon });
    } else {
      setAddressCoords(null);
    }

    const cityFromUrl = searchParams.get("city");
    if (typeof window !== "undefined" && !cityFromUrl && !addressFromUrl) {
      try {
        const detected = sessionStorage.getItem("detected_city");
        setDetectedCity(detected ? JSON.parse(detected) : null);
      } catch {
        setDetectedCity(null);
      }
    } else {
      setDetectedCity(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDetectedCity = () => {
      const cityFromUrl = searchParams.get("city");
      const addressFromUrl = searchParams.get("address");
      if (!cityFromUrl && !addressFromUrl) {
        try {
          const detected = sessionStorage.getItem("detected_city");
          setDetectedCity(detected ? JSON.parse(detected) : null);
        } catch {
          setDetectedCity(null);
        }
      } else {
        setDetectedCity(null);
      }
    };

    checkDetectedCity();
    window.addEventListener("storage", (e) => e.key === "detected_city" && checkDetectedCity());
    window.addEventListener("detectedCityUpdated", checkDetectedCity);

    const interval = setInterval(checkDetectedCity, 1000);
    return () => {
      window.removeEventListener("storage", checkDetectedCity);
      window.removeEventListener("detectedCityUpdated", checkDetectedCity);
      clearInterval(interval);
    };
  }, [searchParams]);

  const { data: locationsData, isLoading: isLoadingWarehouses } = useLocations(
    {
      page: 1,
      size: 50,
      address: addressInput || undefined,
      city: !addressInput && selected?.name ? selected.name : undefined,
      lat: addressCoords?.lat ?? parsedCityFromAddress?.coords?.lat ?? selected?.coords?.lat,
      lon: addressCoords?.lon ?? parsedCityFromAddress?.coords?.lon ?? selected?.coords?.lon,
      radius: 20,
    },
    { enabled: !!(addressInput || selected) }
  );

  useEffect(() => {
    const safeAddress = (debouncedAddress ?? "").trim();
    if (!safeAddress) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (suppressSuggestionsOnce) {
      setSuppressSuggestionsOnce(false);
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let isActive = true;
    setIsLoadingSuggestions(true);

    fetchAddressSuggestions(safeAddress)
      .then((suggestions) => {
        if (!isActive) return;
        setAddressSuggestions(suggestions);
        setShowSuggestions(isAddressFocused && suggestions.length > 0);
      })
      .catch(() => {
        if (!isActive) return;
        setAddressSuggestions([]);
        setShowSuggestions(false);
      })
      .finally(() => {
        if (isActive) setIsLoadingSuggestions(false);
      });

    return () => {
      isActive = false;
    };
  }, [debouncedAddress, isAddressFocused, suppressSuggestionsOnce]);

  const handleSelectSuggestion = async (suggestion: string) => {
    setAddressInput(suggestion);
    setShowSuggestions(false);
    setSuppressSuggestionsOnce(true);
    setIsValidatingAddress(true);

    try {
      const result = await validateAddress(suggestion);
      if (result?.latitude && result?.longitude) {
        setAddressCoords({ lat: result.latitude, lon: result.longitude });
      }
      if (result?.city) {
        const cityMatch = cities.find((c) => c.name.toLowerCase() === result.city?.toLowerCase());
        if (cityMatch) setSelected(cityMatch);
      }
    } catch (error) {
      console.error("Error validating address:", error);
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const warehouses = useMemo(() => {
    const locations = locationsData?.locations || [];
    const addressCity = addressInput.split(",")[0]?.trim().toLowerCase();
    const cityFilter = addressCity || selected?.name?.toLowerCase();

    return locations
      .filter((l) => l.latitude && l.longitude)
      .filter((l) => {
        if (!cityFilter) return true;
        const addr = (l.address || "").toLowerCase();
        const name = (l.name || "").toLowerCase();
        return addr.includes(cityFilter) || name.includes(cityFilter);
      })
      .map((location, index) => ({
        id: location.id || index + 1,
        name: location.name || `Склад ${index + 1}`,
        address: location.address || "",
        latitude: location.latitude,
        longitude: location.longitude,
        description: location.description,
        distance: location.distance || 0,
        avg_rating: location.avg_rating || 4.5,
        reviews_count: location.reviews_count || 0,
      }));
  }, [locationsData, addressInput, selected]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/arbaev/russia-cities/refs/heads/master/russia-cities.json"
        );
        const data: City[] = await res.json();
        setCities(data);

        const raw = localStorage.getItem(storageKey);
        if (raw && !hasRestoredFromStorage.current) {
          try {
            const stored = JSON.parse(raw) as {
              address?: string;
              lat?: number;
              lon?: number;
              city?: string;
            };

            const params = new URLSearchParams(searchParams.toString());

            if (stored.address) {
              setAddressInput(stored.address);
              if (stored.lat && stored.lon) setAddressCoords({ lat: stored.lat, lon: stored.lon });

              const cityFromStorage = findCityInAddress(stored.address, data);
              if (cityFromStorage) setSelected(cityFromStorage);

              params.set("address", stored.address);
              if (stored.lat) params.set("lat", String(stored.lat));
              if (stored.lon) params.set("lon", String(stored.lon));
              if (cityFromStorage) params.set("city", cityFromStorage.name);
              else params.delete("city");
            } else if (stored.city) {
              const cityFromStorage = data.find(
                (c) => c.name === stored.city || c.name_alt === stored.city || c.name_en === stored.city
              );
              if (cityFromStorage) {
                setSelected(cityFromStorage);
                params.set("city", stored.city);
                if (cityFromStorage.coords) {
                  params.set("lat", String(cityFromStorage.coords.lat));
                  params.set("lon", String(cityFromStorage.coords.lon));
                }
              }
            }

            router.replace(`?${params.toString()}`, { scroll: false });
          } catch (e) {
            console.error("Error restoring from localStorage:", e);
          } finally {
            hasRestoredFromStorage.current = true;
          }
        } else {
          const addressParam = searchParams.get("address");
          const cityParam = searchParams.get("city");

          if (addressParam) {
            setAddressInput(addressParam);
            const cityFromAddress = findCityInAddress(addressParam, data);
            if (cityFromAddress) setSelected(cityFromAddress);
          } else if (cityParam) {
            const cityFromUrl = data.find(
              (c) =>
                c.name === cityParam ||
                c.name_alt === cityParam ||
                c.name_en?.toLowerCase() === cityParam.toLowerCase()
            );
            if (cityFromUrl) setSelected(cityFromUrl);
          }
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    };

    loadCities();
  }, [searchParams, router]);

  const effectiveCityName = parsedCityFromAddress?.name || selected?.name || "городе";
  const mapLat =
    addressCoords?.lat ??
    parsedCityFromAddress?.coords?.lat ??
    selected?.coords?.lat ??
    55.7540471;
  const mapLon =
    addressCoords?.lon ??
    parsedCityFromAddress?.coords?.lon ??
    selected?.coords?.lon ??
    37.620405;
  const mapZoom = addressCoords || parsedCityFromAddress || selected ? 13 : 10;

  const validLocations = warehouses
    .filter((w) => w.latitude != null && w.longitude != null)
    .map((w) => ({
      id: w.id,
      name: w.name,
      lat: w.latitude as number,
      lon: w.longitude as number,
      address: w.address,
    }));

  return (
    <Popover modal={isMobile}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          className="text-sm font-medium !p-0 h-auto tracking-tight text-gray-700 hover:text-blue-600 cursor-pointer max-w-full overflow-hidden"
        >
          <div className="flex items-center gap-2 min-w-0 w-full">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate min-w-0">
              {searchParams.get("address") ||
                addressInput ||
                selected?.name ||
                (detectedCity ? `${detectedCity.city} (автоматически)` : "Укажите адрес доставки")}
            </span>
            <ChevronsUpDown className="w-3 h-3 ml-1 opacity-50 flex-shrink-0" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="flex flex-col h-[calc(100svh_-_120px)] md:h-auto w-screen rounded-none md:w-[900px] md:rounded-xl overflow-hidden p-6"
        sideOffset={8}
      >
        <div className="hidden md:flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-gray-900">Указать адрес</h3>
              <p className="text-sm text-gray-500">
                Укажите адрес доставки для точного расчета доступности товаров
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">{warehouses.length} пунктов выдачи</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col lg:grid lg:grid-cols-3 md:flex-1 gap-4 overflow-hidden min-h-0">
          <div className="lg:col-span-1 flex flex-col min-h-0 order-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                  {selected ? selected.name : "Выберите город..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Поиск городов..." className="h-9" />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>Город не найден</CommandEmpty>
                    <CommandGroup>
                      {cities.map((city) => (
                        <CommandItem
                          key={city.id}
                          value={city.name}
                          onSelect={() => {
                            const newCity = selected?.name === city.name ? null : city;
                            setSelected(newCity);
                            setOpen(false);
                            setAddressInput("");
                            setAddressCoords(null);

                            if (newCity) {
                              const newParams = new URLSearchParams(searchParams.toString());
                              newParams.set("city", newCity.name);
                              newParams.delete("address");
                              if (newCity.coords) {
                                newParams.set("lat", String(newCity.coords.lat));
                                newParams.set("lon", String(newCity.coords.lon));
                              }
                              router.push(`?${newParams.toString()}`, { scroll: false });
                              // Удаляем адрес из localStorage
                              localStorage.setItem(storageKey, JSON.stringify({ city: newCity.name, manual: true }));
                            }
                          }}
                        >
                          {city.name}
                          <Check className={cn("ml-auto", selected?.id === city.id ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex flex-col gap-4 pt-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Санкт-Петербург, ул. Попова, д. 6"
                  value={addressInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAddressInput(val);
                    setAddressCoords(null);
                    setShowSuggestions(true);
                    if (!val.trim()) {
                      const newParams = new URLSearchParams(searchParams.toString());
                      newParams.delete("address");
                      newParams.delete("lat");
                      newParams.delete("lon");
                      router.push(`?${newParams.toString()}`, { scroll: false });
                      localStorage.removeItem(storageKey);
                    }
                  }}
                  onFocus={() => setIsAddressFocused(true)}
                  onBlur={() => {
                    setIsAddressFocused(false);
                    setTimeout(() => setShowSuggestions(false), 100);
                  }}
                  className="pl-10"
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow">
                    <ul className="max-h-56 overflow-y-auto">
                      {addressSuggestions.map((suggestion) => (
                        <li key={suggestion}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                            onMouseDown={() => handleSelectSuggestion(suggestion)}
                          >
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {isLoadingSuggestions && <p className="text-xs text-gray-500">Ищем адреса...</p>}
            </div>

            <PopoverClose asChild>
              <Button
                onClick={async () => {
                  if (!addressInput.trim()) return;
                  setOpen(false);

                  let coords = addressCoords;
                  const finalAddress = addressInput.trim();
                  const cityFromAddress = findCityInAddress(finalAddress, cities);

                  if (!coords) {
                    setIsValidatingAddress(true);
                    try {
                      const result = await validateAddress(finalAddress);
                      if (result?.latitude && result?.longitude) {
                        coords = { lat: result.latitude, lon: result.longitude };
                        setAddressCoords(coords);
                      }
                    } finally {
                      setIsValidatingAddress(false);
                    }
                  }

                  if (cityFromAddress) setSelected(cityFromAddress);

                  if (!coords && selected?.coords) {
                    coords = { lat: selected.coords.lat, lon: selected.coords.lon };
                  }

                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.set("address", finalAddress);
                  if (cityFromAddress) newParams.set("city", cityFromAddress.name);
                  if (coords) {
                    newParams.set("lat", String(coords.lat));
                    newParams.set("lon", String(coords.lon));
                  }

                  router.push(`?${newParams.toString()}`, { scroll: false });

                  // Сохраняем в localStorage
                  localStorage.setItem(
                    storageKey,
                    JSON.stringify({
                      address: finalAddress,
                      lat: coords?.lat,
                      lon: coords?.lon,
                      city: cityFromAddress?.name,
                      manual: true,
                    })
                  );
                }}
                className="w-full mt-2"
                disabled={isValidatingAddress}
              >
                {isValidatingAddress ? "Проверяем адрес..." : "Сохранить"}
              </Button>
            </PopoverClose>

            <div className="flex-1 pt-4 flex flex-col min-h-0">
              <h4 className="font-medium text-gray-900">Пункты выдачи в {effectiveCityName}</h4>
              <div className="max-h-[200px] overflow-y-auto md:max-h-none md:flex-1 min-h-0">
                {isLoadingWarehouses ? (
                  <p className="text-sm text-gray-500">Загрузка складов...</p>
                ) : warehouses.length === 0 ? (
                  <p className="text-sm text-gray-500">Склады не найдены</p>
                ) : (
                  warehouses.map((warehouse) => (
                    <div
                      key={warehouse.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors mt-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Warehouse className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{warehouse.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">{warehouse.address}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">{warehouse.distance} км</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < Math.floor(warehouse.avg_rating) ? "bg-yellow-400" : "bg-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500">({warehouse.reviews_count})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex-1 min-h-0 order-2">
            <div className="w-full rounded-lg overflow-hidden border border-gray-200 h-[180px] md:h-full min-h-[180px] md:min-h-[400px]">
              <MapPreview
                key={`${mapLat}-${mapLon}-${addressInput}`}
                lat={mapLat}
                lon={mapLon}
                locations={validLocations}
                zoom={mapZoom}
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="tracking-tight text-sm w-full text-center sm:text-left leading-tight">
              <p className="font-medium leading-tight">
                {addressInput.trim()
                  ? `Вы выбрали: ${parsedCityFromAddress?.name || addressInput.split(",")[0]}`
                  : selected?.name
                  ? `Вы выбрали: ${selected.name}`
                  : detectedCity
                  ? `Автоматически определен: ${detectedCity.city}`
                  : "Город будет определен автоматически"}
              </p>
              <p className="text-xs leading-tight text-gray-400">
                Доставка: 1-3 дня • Самовывоз: 1-2 часа
              </p>
            </div>

            <div className="flex gap-2">
              <PopoverClose asChild>
                <Button variant="outline">Закрыть</Button>
              </PopoverClose>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};