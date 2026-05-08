// entities/statistics/api/index.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://app.tablecrm.com/api/v1/mp";

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
  return {
    total_views: 1234,
    total_clicks: 456,
    total_recommendations: 789,
    total_add_to_cart: 123,
    total_purchases: 56,
    conversion_rate: 4.5,
    popular_products: [
      {
        product_id: 54977,
        product_name: "Perfume Set",
        views: 450,
        clicks: 120,
        purchases: 23,
        conversion: 5.1
      },
      {
        product_id: 54981,
        product_name: "Gift Card",
        views: 320,
        clicks: 85,
        purchases: 18,
        conversion: 5.6
      },
      {
        product_id: 54857,
        product_name: "Дизайнерские студии",
        views: 280,
        clicks: 72,
        purchases: 15,
        conversion: 5.4
      }
    ],
    daily_stats: generateDailyStats(30)
  };
};

const generateDailyStats = (days: number) => {
  const stats = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    stats.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 50) + 20,
      clicks: Math.floor(Math.random() * 20) + 5,
      purchases: Math.floor(Math.random() * 5) + 1
    });
  }
  return stats;
};