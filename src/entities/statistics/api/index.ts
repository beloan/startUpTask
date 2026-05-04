// entities/statistics/api/index.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://app.tablecrm.com/api/v1/mp";

type RawEvent = {
  entity_id?: number;
  product_id?: number;
  nomenclature_id?: number;
  event?: string;
  created_at?: string;
  product_name?: string;
  name?: string;
  rating?: number;
};

export const createViewEvent = async (data: {
  entity_type: string;
  entity_id: number;
  listing_pos?: number;
  listing_page?: number;
  event: 'view' | 'click';
  contragent_phone: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_name?: string;
  utm_phone?: string;
  utm_email?: string;
  utm_leadid?: string;
  utm_yclientid?: string;
  utm_gaclientid?: string;
  ref_user?: string;
  city?: string;
}) => {
  try {
    // Разделяем данные на body и query params
    const {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      utm_name,
      utm_phone,
      utm_email,
      utm_leadid,
      utm_yclientid,
      utm_gaclientid,
      ref_user,
      city,
      ...bodyData
    } = data;

    // UTM параметры отправляем в query string
    const queryParams: Record<string, string> = {};
    if (utm_source) queryParams.utm_source = utm_source;
    if (utm_medium) queryParams.utm_medium = utm_medium;
    if (utm_campaign) queryParams.utm_campaign = utm_campaign;
    if (utm_term) queryParams.utm_term = utm_term;
    if (utm_content) queryParams.utm_content = utm_content;
    if (utm_name) queryParams.utm_name = utm_name;
    if (utm_phone) queryParams.utm_phone = utm_phone;
    if (utm_email) queryParams.utm_email = utm_email;
    if (utm_leadid) queryParams.utm_leadid = utm_leadid;
    if (utm_yclientid) queryParams.utm_yclientid = utm_yclientid;
    if (utm_gaclientid) queryParams.utm_gaclientid = utm_gaclientid;
    if (ref_user) queryParams.ref_user = ref_user;
    if (city) queryParams.city = city;

    const cleanedData = Object.fromEntries(
      Object.entries(bodyData).filter(([_, value]) => value !== undefined)
    );

    const response = await axios.post(`${API_BASE_URL}/events/view`, cleanedData, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      return null;
    }
    console.error("Error creating view event:", error);
    throw error;
  }
};

export const getViewEvents = async (params: {
  cashbox_id: number;
  from_time?: string;
  to_time?: string;
  contragent_phone?: string;
  entity_type?: string;
  event?: 'view' | 'click';
}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/view`, { params });
    return response.data;
  } catch (error) {
    console.error("Error getting view events:", error);
    throw error;
  }
};

export const getSellerStatistics = async (cashbox_id: number, days: number = 30) => {
  try {
    const fromTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const [viewEvents, salesEvents, favoritesEvents] = await Promise.all([
      getViewEvents({ 
        cashbox_id, 
        from_time: fromTime,
        entity_type: 'view_events'
      }),
      getViewEvents({ 
        cashbox_id, 
        from_time: fromTime,
        entity_type: 'docs_sales'
      }),
      getViewEvents({ 
        cashbox_id, 
        from_time: fromTime,
        entity_type: 'favorites'
      })
    ]);

    return aggregateStatistics(viewEvents, salesEvents, favoritesEvents);
  } catch (error) {
    console.error("Error getting seller statistics:", error);
    throw error;
  }
};

const aggregateStatistics = (viewEvents: any, salesEvents: any, favoritesEvents: any) => {
  const viewList = extractEvents(viewEvents);
  const salesList = extractEvents(salesEvents);
  const favoritesList = extractEvents(favoritesEvents);

  const viewsByProduct = new Map<number, number>();
  const clicksByProduct = new Map<number, number>();
  const salesByProduct = new Map<number, number>();
  const productNameById = new Map<number, string>();
  const ratingByProduct = new Map<number, number>();

  const registerNameAndRating = (id: number, event: RawEvent) => {
    const name = typeof event.product_name === "string"
      ? event.product_name
      : typeof event.name === "string"
        ? event.name
        : undefined;

    if (name && !productNameById.has(id)) {
      productNameById.set(id, name);
    }

    if (typeof event.rating === "number" && !Number.isNaN(event.rating)) {
      ratingByProduct.set(id, event.rating);
    }
  };

  for (const event of viewList) {
    const id = getEntityId(event);
    if (!id) continue;
    registerNameAndRating(id, event);

    const eventType = (event.event || "").toLowerCase();
    if (eventType === "click") {
      clicksByProduct.set(id, (clicksByProduct.get(id) || 0) + 1);
    } else {
      viewsByProduct.set(id, (viewsByProduct.get(id) || 0) + 1);
    }
  }

  for (const event of salesList) {
    const id = getEntityId(event);
    if (!id) continue;
    registerNameAndRating(id, event);
    salesByProduct.set(id, (salesByProduct.get(id) || 0) + 1);
  }

  const allProductIds = new Set<number>([
    ...viewsByProduct.keys(),
    ...clicksByProduct.keys(),
    ...salesByProduct.keys(),
  ]);

  const popularProducts = Array.from(allProductIds)
    .map((productId) => {
      const views = viewsByProduct.get(productId) || 0;
      const clicks = clicksByProduct.get(productId) || 0;
      const purchases = salesByProduct.get(productId) || 0;
      const conversion = views > 0 ? (purchases / views) * 100 : 0;

      return {
        product_id: productId,
        product_name: productNameById.get(productId) || `Товар #${productId}`,
        views,
        clicks,
        purchases,
        sales_count: purchases,
        rating: ratingByProduct.get(productId),
        conversion,
        score: views + clicks * 2 + purchases * 3,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ score, ...rest }) => rest);

  const total_views = sumMapValues(viewsByProduct);
  const total_clicks = sumMapValues(clicksByProduct);
  const total_purchases = sumMapValues(salesByProduct);
  const total_add_to_cart = favoritesList.length;
  const total_recommendations = total_clicks;
  const conversion_rate = total_views > 0 ? (total_purchases / total_views) * 100 : 0;

  return {
    total_views,
    total_clicks,
    total_recommendations,
    total_add_to_cart,
    total_purchases,
    conversion_rate,
    popular_products: popularProducts,
    daily_stats: buildDailyStats(viewList, salesList),
  };
};

const extractEvents = (payload: any): RawEvent[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getEntityId = (event: RawEvent): number | null => {
  const id = event.entity_id ?? event.product_id ?? event.nomenclature_id;
  if (typeof id !== "number" || Number.isNaN(id)) {
    return null;
  }
  return id;
};

const sumMapValues = (map: Map<number, number>) => {
  let total = 0;
  for (const value of map.values()) {
    total += value;
  }
  return total;
};

const buildDailyStats = (viewList: RawEvent[], salesList: RawEvent[]) => {
  const byDate = new Map<string, { views: number; clicks: number; purchases: number }>();

  const ensureDate = (dateKey: string) => {
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { views: 0, clicks: 0, purchases: 0 });
    }
    return byDate.get(dateKey)!;
  };

  for (const event of viewList) {
    const dateKey = normalizeDateKey(event.created_at);
    if (!dateKey) continue;
    const row = ensureDate(dateKey);
    if ((event.event || "").toLowerCase() === "click") {
      row.clicks += 1;
    } else {
      row.views += 1;
    }
  }

  for (const event of salesList) {
    const dateKey = normalizeDateKey(event.created_at);
    if (!dateKey) continue;
    const row = ensureDate(dateKey);
    row.purchases += 1;
  }

  const rows = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  if (rows.length > 0) {
    return rows;
  }

  // If API returns no event timestamps, keep chart stable with last 7 empty days.
  const fallback = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    fallback.push({ date, views: 0, clicks: 0, purchases: 0 });
  }
  return fallback;
};

const normalizeDateKey = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split("T")[0];
};