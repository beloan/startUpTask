// components/location/change-location-modal.tsx
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
import React, { useEffect, useMemo, useState, useRef} from "react";
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

interface WarehouseLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  distance: number;
  avg_rating?: number;
  reviews_count?: number;
}

export const ChangeLocationModal = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [selected, setSelected] = useState<City | null>(null);
  const [open, setOpen] = useState(false);
  const [addressInput, setAddressInput] = useState<string>("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [suppressSuggestionsOnce, setSuppressSuggestionsOnce] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [addressCoords, setAddressCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [detectedCity, setDetectedCity] = useState<{
    city: string;
    lat: number;
    lon: number;
  } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const storageKey = "bystroi_location";
  const debouncedAddress = useDebounce(addressInput, 300);
  const hasRestoredFromStorage = useRef(false);

  // Читаем адрес из URL при загрузке
  useEffect(() => {
    const addressFromUrl = searchParams.get("address");
    if (addressFromUrl) {
      setAddressInput(addressFromUrl);
    }
    const latFromUrl = searchParams.get("lat");
    const lonFromUrl = searchParams.get("lon");
    if (latFromUrl && lonFromUrl) {
      const lat = Number(latFromUrl);
      const lon = Number(lonFromUrl);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        setAddressCoords({ lat, lon });
      }
    } else {
      // Если координат нет в URL - очищаем state
      // Это предотвращает их автоматическое восстановление
      setAddressCoords(null);
    }

    const cityFromUrl = searchParams.get("city");

    // НЕ восстанавливаем параметры из localStorage автоматически
    // Параметры добавляются в URL только когда пользователь явно выбирает город или адрес
    // Это позволяет бэкенду автоматически определить адрес по IP, когда параметров нет
    // localStorage используется только для сохранения выбора пользователя, но не для автоматического восстановления

    // Проверяем, есть ли автоматически определенный город в sessionStorage
    if (typeof window !== "undefined" && !cityFromUrl && !addressFromUrl) {
      try {
        const detected = sessionStorage.getItem("detected_city");
        if (detected) {
          const parsed = JSON.parse(detected);
          setDetectedCity(parsed);
        } else {
          setDetectedCity(null);
        }
      } catch (e) {
        setDetectedCity(null);
      }
    } else {
      setDetectedCity(null);
    }
  }, [router, searchParams]);

  // Слушаем изменения в sessionStorage для обновления detectedCity в реальном времени
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDetectedCity = () => {
      const cityFromUrl = searchParams.get("city");
      const addressFromUrl = searchParams.get("address");

      // Проверяем только если нет параметров в URL
      if (!cityFromUrl && !addressFromUrl) {
        try {
          const detected = sessionStorage.getItem("detected_city");
          if (detected) {
            const parsed = JSON.parse(detected);
            setDetectedCity(parsed);
          } else {
            setDetectedCity(null);
          }
        } catch (e) {
          setDetectedCity(null);
        }
      } else {
        setDetectedCity(null);
      }
    };

    // Проверяем сразу
    checkDetectedCity();

    // Слушаем кастомное событие, которое срабатывает при сохранении в sessionStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "detected_city") {
        checkDetectedCity();
      }
    };

    const handleDetectedCityUpdated = () => {
      checkDetectedCity();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "detectedCityUpdated",
      handleDetectedCityUpdated as EventListener,
    );

    // Также периодически проверяем (на случай, если событие не сработало)
    const interval = setInterval(checkDetectedCity, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "detectedCityUpdated",
        handleDetectedCityUpdated as EventListener,
      );
      clearInterval(interval);
    };
  }, [searchParams]);

  // Автоматически выбираем город в селекте, если он определен по IP
  useEffect(() => {
    const cityFromUrl = searchParams.get("city");
    const addressFromUrl = searchParams.get("address");

    // Выбираем город только если:
    // 1. Нет параметров в URL (город не выбран вручную)
    // 2. Есть detectedCity (город определен по IP)
    // 3. Есть список городов (cities загружен)
    // 4. Город еще не выбран (selected === null)
    if (
      !cityFromUrl &&
      !addressFromUrl &&
      detectedCity &&
      cities.length > 0 &&
      !selected
    ) {
      // Ищем город в списке по имени
      const cityMatch = cities.find(
        (city) =>
          city.name.toLowerCase() === detectedCity.city.toLowerCase() ||
          city.name_alt?.toLowerCase() === detectedCity.city.toLowerCase() ||
          city.name_en?.toLowerCase() === detectedCity.city.toLowerCase(),
      );

      if (cityMatch) {
        setSelected(cityMatch);
      }
    }
  }, [detectedCity, cities, selected, searchParams]);

  // Получаем реальные склады из API
  // Приоритет: если есть address - используем его, иначе city, иначе координаты
  const { data: locationsData, isLoading: isLoadingWarehouses } = useLocations(
    {
      page: 1,
      size: 50,
      address: addressInput || undefined, // Приоритет у адреса
      city: !addressInput && selected?.name ? selected.name : undefined, // Если нет адреса, используем город
      lat:
        addressCoords?.lat ??
        (!addressInput && !selected?.name && selected?.coords.lat
          ? selected.coords.lat
          : undefined),
      lon:
        addressCoords?.lon ??
        (!addressInput && !selected?.name && selected?.coords.lon
          ? selected.coords.lon
          : undefined),
      radius: 20, // радиус 20 км
    },
    {
      enabled: !!(addressInput || selected), // Запрос если есть адрес или выбран город
    },
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
      .catch((error) => {
        console.error("Error loading address suggestions:", error);
        if (!isActive) return;
        setAddressSuggestions([]);
        setShowSuggestions(false);
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [debouncedAddress]);

  const normalizeAddress = (value: string) => {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) =>
        part
          .split(" ")
          .map((word) =>
            word
              .split("-")
              .map((piece) =>
                piece ? piece[0].toUpperCase() + piece.slice(1) : "",
              )
              .join("-"),
          )
          .join(" "),
      )
      .join(", ");
  };

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

  const formatAddressParts = (
    city?: string | null,
    street?: string | null,
    house?: string | null,
    sourceInput?: string,
  ) => {
    const cityValue = city ? `г. ${normalizeAddress(city)}` : "";
    const streetValue = street ? `ул. ${normalizeAddress(street)}` : "";
    let houseValue = house ? `д. ${house}` : "";
    let flatValue = "";
    if (house) {
      const flatMatch = house.match(/кв\.?\s*(\d+)/i);
      if (flatMatch?.[1]) {
        flatValue = `кв. ${flatMatch[1]}`;
        houseValue = `д. ${house.replace(/кв\.?\s*\d+/i, "").trim()}`;
      }
    }
    if (!flatValue && sourceInput) {
      const inputMatch = sourceInput.match(/кв\.?\s*(\d+)/i);
      if (inputMatch?.[1]) {
        flatValue = `кв. ${inputMatch[1]}`;
      }
    }
    return [cityValue, streetValue, houseValue, flatValue]
      .filter(Boolean)
      .join(", ");
  };

  const formatAddressFromInput = (input: string) => {
    const trimmed = input.trim();
    if (
      trimmed.includes("г.") ||
      trimmed.includes("ул.") ||
      trimmed.includes("д.") ||
      trimmed.includes("кв.")
    ) {
      return trimmed;
    }
    const rawParts = trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (rawParts.length >= 2) {
      const cityPart = rawParts[0] ? `г. ${normalizeAddress(rawParts[0])}` : "";
      const streetPart = rawParts[1]
        ? `ул. ${normalizeAddress(rawParts[1])}`
        : "";
      const housePart = rawParts[2]
        ? `д. ${normalizeAddress(rawParts[2])}`
        : "";
      let flatPart = "";
      if (rawParts[3]) {
        const flatMatch = rawParts[3].match(/(кв\.?|кв|apt\.?)\s*(.+)/i);
        flatPart = `кв. ${normalizeAddress(flatMatch?.[2] || rawParts[3])}`;
      }
      const rest = rawParts.slice(4).map((part) => normalizeAddress(part));
      return [cityPart, streetPart, housePart, flatPart, ...rest]
        .filter(Boolean)
        .join(", ");
    }

    const tokens = input
      .split(" ")
      .map((part) => part.trim())
      .filter(Boolean);
    if (tokens.length === 0) {
      return "";
    }
    const cityToken = tokens[0];
    const lastToken = tokens[tokens.length - 1];
    const prevToken = tokens[tokens.length - 2];
    const hasTwoNumbersAtEnd =
      /^\d+$/.test(lastToken) && /^\d+$/.test(prevToken);
    const flatToken = hasTwoNumbersAtEnd
      ? lastToken
      : prevToken &&
          /^(кв\.?|кв|apt\.?)$/i.test(prevToken) &&
          /^\d+$/.test(lastToken)
        ? lastToken
        : "";
    const houseToken = hasTwoNumbersAtEnd
      ? prevToken
      : /^\d+$/.test(lastToken)
        ? lastToken
        : "";
    const streetTokens = tokens.slice(
      1,
      houseToken ? (flatToken ? -2 : -1) : undefined,
    );
    const streetToken = streetTokens.join(" ");

    const cityPart = cityToken ? `г. ${normalizeAddress(cityToken)}` : "";
    const streetPart = streetToken
      ? `ул. ${normalizeAddress(streetToken)}`
      : "";
    const housePart = houseToken ? `д. ${normalizeAddress(houseToken)}` : "";
    const flatPart = flatToken ? `кв. ${normalizeAddress(flatToken)}` : "";
    return [cityPart, streetPart, housePart, flatPart]
      .filter(Boolean)
      .join(", ");
  };

  const getInputCity = (input: string) => {
    const firstPart = input.split(",")[0] || "";
    return normalizeAddress(
      firstPart.replace(/^г\.\s*/i, "").trim(),
    ).toLowerCase();
  };

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
        const cityMatch = cities.find(
          (city) => city.name.toLowerCase() === result.city?.toLowerCase(),
        );
        if (cityMatch) {
          setSelected(cityMatch);
        }
      }
    } catch (error) {
      console.error("Error validating address:", error);
    } finally {
      setIsValidatingAddress(false);
    }
  };

  // Преобразуем данные из API в формат WarehouseLocation (только реальные данные)
  const warehouses = useMemo(() => {
    // API возвращает { locations: [...], count: ..., page: ..., size: ... }
    // Используем только реальные данные из API, без fallback на моки
    const locations = locationsData?.locations || [];
    const addressCity = addressInput.split(",")[0]?.trim().toLowerCase();
    const cityFilter = addressCity || selected?.name?.toLowerCase();

    if (locations.length > 0) {
      return locations
        .filter((location) => location.latitude && location.longitude) // Фильтруем только с координатами
        .filter((location) => {
          if (!cityFilter) return true;
          const address = location.address?.toLowerCase() || "";
          const name = location.name?.toLowerCase() || "";
          return address.includes(cityFilter) || name.includes(cityFilter);
        })
        .map((location, index) => ({
          id: location.id || index + 1,
          name: location.name || `Склад ${index + 1}`,
          address: location.address || "",
          latitude: location.latitude || 0,
          longitude: location.longitude || 0,
          description: location.description,
          distance: location.distance || 0,
          avg_rating: location.avg_rating || 4.5,
          reviews_count: location.reviews_count || 0,
        }));
    }

    // Если нет данных из API - возвращаем пустой массив (не показываем моки)
    return [];
  }, [locationsData, addressInput, selected]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/arbaev/russia-cities/refs/heads/master/russia-cities.json",
          {
            method: "GET",
          },
        );
        const data: City[] = await res.json();
        setCities(data);

        if (!hasRestoredFromStorage.current) {
          const addressParam = searchParams.get("address");
          const cityParam = searchParams.get("city");

          if (addressParam || cityParam) {
            // Если параметры уже есть в URL — не восстанавливаем
            hasRestoredFromStorage.current = true;
          } else {
            try {
              const raw = localStorage.getItem(storageKey);
              if (raw) {
                const stored = JSON.parse(raw) as {
                  city?: string;
                  address?: string;
                  lat?: number;
                  lon?: number;
                };

                if (stored.city) {
                  // Восстанавливаем город
                  const cityFromStorage = data.find(
                    (city) =>
                      city.name === stored.city ||
                      city.name_alt === stored.city ||
                      city.name_en === stored.city
                  );
                  if (cityFromStorage) {
                    setSelected(cityFromStorage);
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set("city", cityFromStorage.name);
                    if (cityFromStorage.coords) {
                      newParams.set("lat", String(cityFromStorage.coords.lat));
                      newParams.set("lon", String(cityFromStorage.coords.lon));
                    }
                    router.replace(`?${newParams.toString()}`, { scroll: false });
                    hasRestoredFromStorage.current = true;
                  }
                } else if (stored.address) {
                  // Восстанавливаем адрес
                  setAddressInput(stored.address);
                  if (stored.lat && stored.lon) {
                    setAddressCoords({ lat: stored.lat, lon: stored.lon });
                  }
                  const cityFromAddress = findCityInAddress(stored.address, data);
                  if (cityFromAddress) {
                    setSelected(cityFromAddress);
                  }
                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.set("address", stored.address);
                  if (stored.lat && stored.lon) {
                    newParams.set("lat", String(stored.lat));
                    newParams.set("lon", String(stored.lon));
                  }
                  if (cityFromAddress) {
                    newParams.set("city", cityFromAddress.name);
                  }
                  router.replace(`?${newParams.toString()}`, { scroll: false });
                  hasRestoredFromStorage.current = true;
                }
              }
            } catch (error) {
              console.error("Error restoring from localStorage:", error);
            }
          }
        }

        // Читаем address или city из URL/локального хранилища
        const addressParam = searchParams.get("address");
        const cityParam = searchParams.get("city");
        const hasUrlParams = addressParam || cityParam;

        // ВАЖНО: Используем localStorage ТОЛЬКО если есть параметры в URL
        // Если параметров нет в URL, значит пользователь удалил их, и мы не должны использовать localStorage
        // Это позволяет использовать IP-определенный город из sessionStorage
        let storedAddress: string | undefined;
        let storedCity: string | undefined;
        if (hasUrlParams) {
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              const stored = JSON.parse(raw) as {
                address?: string;
                city?: string;
              };
              storedAddress = stored.address;
              storedCity = stored.city;
            }
          } catch (error) {
            console.error("Error reading stored city:", error);
          }
        }
        let cityToSelect: City | null = null;

        // Если есть address, пытаемся извлечь название города из адреса
        // Используем ТОЛЬКО addressParam, НЕ используем storedAddress если нет параметров в URL
        const addressSource =
          addressParam || (hasUrlParams ? storedAddress : undefined);
        if (addressSource) {
          cityToSelect = findCityInAddress(addressSource, data);
        }

        // Если не нашли по address, ищем по city ТОЛЬКО если он есть в URL
        // НЕ восстанавливаем город из localStorage, чтобы бэкенд мог определить его автоматически
        if (!cityToSelect && cityParam) {
          // Пытаемся найти город по имени (теперь в URL хранится полное название)
          const cityName = cityParam;
          cityToSelect =
            data.find(
              (city) =>
                city.name === cityName ||
                city.name_alt === cityName ||
                city.name_en?.toLowerCase() === cityName.toLowerCase(),
            ) || null;

          // Если не нашли точное совпадение, пытаемся найти по частичному совпадению (для обратной совместимости со slug)
          if (!cityToSelect) {
            const normalizedParam = cityName.toLowerCase().trim();
            cityToSelect =
              data.find(
                (city) =>
                  city.name.toLowerCase() === normalizedParam ||
                  city.name_alt?.toLowerCase() === normalizedParam ||
                  city.name_en?.toLowerCase() === normalizedParam ||
                  city.name.toLowerCase().includes(normalizedParam) ||
                  normalizedParam.includes(city.name.toLowerCase()),
              ) || null;
          }
        }

        if (cityToSelect) {
          setSelected(cityToSelect);
        } else {
          // Если города нет в URL - очищаем выбранный город
          // Это позволяет бэкенду автоматически определить адрес
          setSelected(null);
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    };

    loadCities();
  }, [searchParams, router]);

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
                selected?.name ||
                (detectedCity
                  ? `${detectedCity.city} (автоматически)`
                  : "Укажите адрес доставки")}
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
              <h3 className="text-lg font-bold tracking-tight text-gray-900">
                Указать адрес
              </h3>
              <p className="text-sm text-gray-500">
                Укажите адрес доставки для точного расчета доступности товаров
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {warehouses.length} пунктов выдачи
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col lg:grid lg:grid-cols-3 md:flex-1 gap-4 overflow-hidden min-h-0">
          <div className="lg:col-span-1 flex flex-col min-h-0 order-1">
            <div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selected ? selected.name : "Выберите город..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Поиск городов..."
                      className="h-9"
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>Город не найден</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={(currentValue) => {
                              const newCity =
                                currentValue === selected?.name ? null : city;
                              setSelected(newCity);
                              setOpen(false);
                              // Clear address/coords so city selection takes effect immediately
                              setAddressInput("");
                              setAddressCoords(null);

                              // Обновляем URL с параметром city (передаем полное название как с адресом)
                              if (newCity) {
                                const newParams = new URLSearchParams(
                                  searchParams.toString(),
                                );
                                // Передаем полное название города в URL (как с адресом)
                                newParams.set("city", newCity.name);
                                // Если есть address, удаляем его при выборе города
                                newParams.delete("address");
                                // Сохраняем координаты города для выбора ближайшей цены
                                if (newCity.coords) {
                                  newParams.set(
                                    "lat",
                                    String(newCity.coords.lat),
                                  );
                                  newParams.set(
                                    "lon",
                                    String(newCity.coords.lon),
                                  );
                                } else {
                                  newParams.delete("lat");
                                  newParams.delete("lon");
                                }

                                const nextPath = `${window.location.pathname}?${newParams.toString()}`;
                                router.push(nextPath, { scroll: false });
                                try {
                                  const raw = localStorage.getItem(storageKey);
                                  const existing = raw
                                    ? (JSON.parse(raw) as {
                                        address?: string;
                                        lat?: number;
                                        lon?: number;
                                        city?: string;
                                      })
                                    : {};
                                  localStorage.setItem(
                                    storageKey,
                                    JSON.stringify({
                                      ...existing,
                                      city: newCity.name, // Сохраняем полное название
                                      address: undefined,
                                      // Сохраняем координаты города
                                      lat: newCity.coords?.lat,
                                      lon: newCity.coords?.lon,
                                      manual: true, // Флаг, что город выбран вручную
                                    }),
                                  );
                                } catch (error) {
                                  console.error("Error saving city:", error);
                                }
                              }
                            }}
                            className="cursor-pointer"
                          >
                            {city.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                selected?.id === city.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Санкт-Петербург, ул. Попова, д. 6"
                    value={addressInput}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setAddressInput(nextValue);
                      setAddressCoords(null);
                      setShowSuggestions(true);
                      if (!nextValue.trim()) {
                        const newParams = new URLSearchParams(
                          searchParams.toString(),
                        );
                        newParams.delete("address");
                        newParams.delete("lat");
                        newParams.delete("lon");
                        const nextPath = `${window.location.pathname}?${newParams.toString()}`;
                        router.push(nextPath, { scroll: false });
                        try {
                          const raw = localStorage.getItem(storageKey);
                          const existing = raw
                            ? (JSON.parse(raw) as { city?: string })
                            : {};
                          localStorage.setItem(
                            storageKey,
                            JSON.stringify({
                              ...existing,
                              address: undefined,
                              lat: undefined,
                              lon: undefined,
                            }),
                          );
                        } catch (error) {
                          console.error("Error clearing address:", error);
                        }
                      }
                    }}
                    onFocus={() => {
                      setIsAddressFocused(true);
                      if (addressSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
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
                              onMouseDown={(event) => {
                                event.preventDefault();
                                handleSelectSuggestion(suggestion);
                              }}
                            >
                              {suggestion}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {isLoadingSuggestions && (
                  <p className="text-xs text-gray-500">Ищем адреса...</p>
                )}
              </div>
              <PopoverClose asChild>
                <Button
                  onClick={async () => {
                    if (!addressInput.trim()) {
                      return;
                    }
                    // Close immediately after save click
                    setOpen(false);

                    let coords = addressCoords;
                    const finalAddress = addressInput.trim();
                    const cityFromAddress = findCityInAddress(
                      finalAddress,
                      cities,
                    );
                    if (!coords) {
                      setIsValidatingAddress(true);
                      try {
                        const result = await validateAddress(finalAddress);
                        if (result?.latitude && result?.longitude) {
                          coords = {
                            lat: result.latitude,
                            lon: result.longitude,
                          };
                          setAddressCoords(coords);
                        }
                        if (!cityFromAddress && result?.city) {
                          const cityMatch = cities.find(
                            (city) =>
                              city.name.toLowerCase() ===
                              result.city?.toLowerCase(),
                          );
                          if (cityMatch) {
                            setSelected(cityMatch);
                          }
                        }
                      } finally {
                        setIsValidatingAddress(false);
                      }
                    }
                    let nextSelected = selected;
                    if (cityFromAddress) {
                      nextSelected = cityFromAddress;
                      setSelected(cityFromAddress);
                    }

                    // Fallback: если координаты не получены из валидации, используем координаты города
                    if (!coords && nextSelected?.coords) {
                      coords = {
                        lat: nextSelected.coords.lat,
                        lon: nextSelected.coords.lon,
                      };
                      setAddressCoords(coords);
                    }

                    const newParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    newParams.set("address", finalAddress);
                    newParams.delete("city");
                    if (nextSelected) {
                      // Передаем полное название города в URL (как с адресом)
                      newParams.set("city", nextSelected.name);
                    }
                    // Всегда сохраняем координаты, если они есть (из валидации или из города)
                    if (coords) {
                      newParams.set("lat", String(coords.lat));
                      newParams.set("lon", String(coords.lon));
                    } else {
                      // Удаляем координаты только если их действительно нет
                      newParams.delete("lat");
                      newParams.delete("lon");
                    }
                    const nextPath = `${window.location.pathname}?${newParams.toString()}`;
                    router.push(nextPath, { scroll: false });
                    try {
                      const raw = localStorage.getItem(storageKey);
                      const existing = raw
                        ? (JSON.parse(raw) as { city?: string })
                        : {};
                      localStorage.setItem(
                        storageKey,
                        JSON.stringify({
                          ...existing,
                          address: finalAddress,
                          lat: coords?.lat,
                          lon: coords?.lon,
                          city: nextSelected?.name, // Сохраняем полное название
                          manual: true, // Флаг, что адрес введен вручную
                        }),
                      );
                    } catch (error) {
                      console.error("Error saving address:", error);
                    }
                    setOpen(false);
                  }}
                  className="w-full"
                >
                  {isValidatingAddress ? "Проверяем адрес..." : "Сохранить"}
                </Button>
              </PopoverClose>
            </div>
            <div className="flex-1 pt-4 flex flex-col min-h-0">
              <h4 className="font-medium text-gray-900">
                Пункты выдачи в {selected?.name || "городе"}
              </h4>
              <div className=" max-h-[200px] overflow-y-auto md:max-h-none md:flex-1 min-h-0">
                {isLoadingWarehouses ? (
                  <p className="text-sm text-gray-500">Загрузка складов...</p>
                ) : warehouses.length === 0 ? (
                  <p className="text-sm text-gray-500">Склады не найдены</p>
                ) : (
                  warehouses.map((warehouse) => (
                    <div
                      key={warehouse.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Warehouse className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">
                            {warehouse.name}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1">
                            {warehouse.address}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {warehouse.distance} км
                            </span>
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < Math.floor(warehouse.avg_rating)
                                        ? "bg-yellow-400"
                                        : "bg-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                ({warehouse.reviews_count})
                              </span>
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
            <div className="w-full rounded-lg overflow-hidden border border-gray-200 h-[180px] md:h-full min-h-[180px] md:min-h-[400px] mb-3 md:mb-0">
              <MapPreview
                key={`${addressCoords?.lat ?? selected?.coords.lat ?? 0}-${addressCoords?.lon ?? selected?.coords.lon ?? 0}`}
                lat={addressCoords?.lat || selected?.coords.lat || 55.7540471}
                lon={addressCoords?.lon || selected?.coords.lon || 37.620405}
                locations={warehouses.map((w) => ({
                  id: w.id,
                  name: w.name,
                  lat: w.latitude,
                  lon: w.longitude,
                  address: w.address,
                }))}
                zoom={addressCoords ? 13 : selected ? 12 : 10}
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-0.5">
            <div className="tracking-tight text-sm w-full text-center sm:text-left leading-tight">
              <p className="font-medium leading-tight">
                {selected?.name
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
              {!addressInput.trim() && selected && (
                <PopoverClose asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      if (!selected) return;

                      const newParams = new URLSearchParams(
                        searchParams.toString(),
                      );
                      // Передаем полное название города в URL (как с адресом)
                      newParams.set("city", selected.name);
                      // Удаляем address, если он был
                      newParams.delete("address");
                      // Сохраняем координаты города для выбора ближайшей цены
                      if (selected.coords) {
                        newParams.set("lat", String(selected.coords.lat));
                        newParams.set("lon", String(selected.coords.lon));
                      } else {
                        newParams.delete("lat");
                        newParams.delete("lon");
                      }

                      const nextPath = `${window.location.pathname}?${newParams.toString()}`;
                      router.push(nextPath, { scroll: false });
                      try {
                        const raw = localStorage.getItem(storageKey);
                        const existing = raw
                          ? (JSON.parse(raw) as {
                              address?: string;
                              lat?: number;
                              lon?: number;
                              city?: string;
                            })
                          : {};
                        localStorage.setItem(
                          storageKey,
                          JSON.stringify({
                            ...existing,
                            city: selected.name, // Сохраняем полное название
                            address: undefined,
                            // Сохраняем координаты города
                            lat: selected.coords?.lat,
                            lon: selected.coords?.lon,
                            manual: true, // Флаг, что город выбран вручную
                          }),
                        );
                      } catch (error) {
                        console.error("Error saving city:", error);
                      }
                    }}
                  >
                    Сохранить город
                  </Button>
                </PopoverClose>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
