import { provincesData, type ProvinceId } from '../data/provincesData.js';

export type TravelStyle = 'food' | 'nature' | 'relax' | 'culture' | 'explore';
export type Period = 'morning' | 'noon' | 'afternoon' | 'evening';
export type CostCategory = 'food' | 'activities' | 'transport' | 'lodging';
export type SourceKind = 'catalog' | 'ai_suggestion';

export interface ItineraryPreferences {
  preferAffordablePlaces: boolean;
  minimizeTravel: boolean;
  notes: string;
}
export interface ItineraryRequest {
  provinceId: ProvinceId;
  days: number;
  partySize: number;
  totalBudgetVnd: number;
  style: TravelStyle;
  startDate: string | null;
  includeArrivalTransport: boolean;
  preferences: ItineraryPreferences;
}
export interface ItineraryStop {
  id: string;
  period: Period;
  startTime: string;
  title: string;
  description: string;
  estimatedCostVnd: number;
  category: CostCategory;
  source: SourceKind;
  /** Search link, NOT a verified listing, route, or coordinates. */
  mapUrl: string | null;
}
export interface ItineraryDay {
  day: number;
  stops: ItineraryStop[];
}
export interface BudgetBreakdown {
  foodVnd: number;
  lodgingVnd: number;
  transportVnd: number;
  activitiesVnd: number;
  reserveVnd: number;
}
export interface StructuredItinerary extends ItineraryRequest {
  schemaVersion: 1;
  title: string;
  schedule: ItineraryDay[];
  budgetBreakdown: BudgetBreakdown;
  estimatedSpendVnd: number;
  budgetRemainingVnd: number;
  warnings: string[];
}
export interface SavedItinerary {
  id: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  plan: StructuredItinerary;
}
const STYLES: TravelStyle[] = ['food', 'nature', 'relax', 'culture', 'explore'];
const PERIODS: Period[] = ['morning', 'noon', 'afternoon', 'evening'];
const CATEGORIES: CostCategory[] = ['food', 'activities', 'transport', 'lodging'];
const isObj = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const integer = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value);
const amount = (value: unknown): value is number => integer(value) && value >= 0 && value <= 1_000_000_000;

export function parseRequest(value: unknown): ItineraryRequest | null {
  if (!isObj(value)) return null;
  if (typeof value.provinceId !== 'string' || !(value.provinceId in provincesData)) return null;
  if (!integer(value.days) || value.days < 1 || value.days > 14) return null;
  if (!integer(value.partySize) || value.partySize < 1 || value.partySize > 20) return null;
  if (!integer(value.totalBudgetVnd) || value.totalBudgetVnd < 200_000 || value.totalBudgetVnd > 100_000_000) return null;
  if (!STYLES.includes(value.style as TravelStyle)) return null;
  const startDate = value.startDate === undefined || value.startDate === null || value.startDate === ''
    ? null : value.startDate;
  if (startDate !== null && (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    Number.isNaN(Date.parse(startDate + 'T00:00:00Z')))) return null;
  const preferences = isObj(value.preferences) ? value.preferences : {};
  const notes = typeof preferences.notes === 'string' ? preferences.notes.trim() : '';
  if (notes.length > 500) return null;
  return {
    provinceId: value.provinceId as ProvinceId,
    days: value.days,
    partySize: value.partySize,
    totalBudgetVnd: value.totalBudgetVnd,
    style: value.style as TravelStyle,
    startDate,
    includeArrivalTransport: value.includeArrivalTransport === true,
    preferences: {
      preferAffordablePlaces: preferences.preferAffordablePlaces !== false,
      minimizeTravel: preferences.minimizeTravel !== false,
      notes,
    },
  };
}

export function targetBudget(budget: number, days: number): BudgetBreakdown {
  const foodVnd = Math.floor(budget * 0.45);
  const lodgingVnd = days > 1 ? Math.floor(budget * 0.30) : 0;
  const transportVnd = Math.floor(budget * (days > 1 ? 0.10 : 0.20));
  const reserveVnd = Math.floor(budget * 0.10);
  const activitiesVnd = budget - foodVnd - lodgingVnd - transportVnd - reserveVnd;
  return { foodVnd, lodgingVnd, transportVnd, activitiesVnd, reserveVnd };
}

const timeOk = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const searchUrl = (title: string, province: string) => {
  const params = new URLSearchParams({ api: '1', query: title + ', ' + province });
  return 'https://www.google.com/maps/search/?' + params.toString();
};

export function normalizeItinerary(value: unknown, request: ItineraryRequest): StructuredItinerary | null {
  if (!isObj(value) || !Array.isArray(value.schedule) || value.schedule.length !== request.days) return null;
  const schedule: ItineraryDay[] = [];
  const provinceLabel = provincesData[request.provinceId].name;
  for (let i = 0; i < request.days; i++) {
    const entry = value.schedule[i];
    if (!isObj(entry) || entry.day !== i + 1 || !Array.isArray(entry.stops) ||
      entry.stops.length < 1 || entry.stops.length > 12) return null;
    const stops: ItineraryStop[] = [];
    for (let j = 0; j < entry.stops.length; j++) {
      const stop = entry.stops[j];
      if (!isObj(stop) || typeof stop.title !== 'string' || !stop.title.trim() || stop.title.length > 160 ||
        typeof stop.description !== 'string' || stop.description.length > 700 ||
        !PERIODS.includes(stop.period as Period) ||
        !CATEGORIES.includes(stop.category as CostCategory) ||
        !amount(stop.estimatedCostVnd) ||
        typeof stop.startTime !== 'string' || !timeOk(stop.startTime)) return null;
      const title = stop.title.trim();
      stops.push({
        id: typeof stop.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(stop.id)
          ? stop.id : 'day-' + (i + 1) + '-stop-' + (j + 1),
        period: stop.period as Period,
        startTime: stop.startTime,
        title,
        description: stop.description.trim(),
        estimatedCostVnd: stop.estimatedCostVnd,
        category: stop.category as CostCategory,
        source: stop.source === 'catalog' ? 'catalog' : 'ai_suggestion',
        mapUrl: searchUrl(title, provinceLabel),
      });
    }
    // Keep IDs unique after edits and AI-generated entries.
    const ids = new Set(stops.map(s => s.id));
    if (ids.size !== stops.length) return null;
    schedule.push({ day: i + 1, stops });
  }
  const title = typeof value.title === 'string' && value.title.trim() ?
    value.title.trim().slice(0, 160) : 'Hành trình ' + provinceLabel;
  const warnings = Array.isArray(value.warnings)
    ? value.warnings.filter((w): w is string => typeof w === 'string').slice(0, 8).map(w => w.slice(0, 240))
    : [];
  const plan: StructuredItinerary = {
    schemaVersion: 1, ...request, title, schedule,
    budgetBreakdown: targetBudget(request.totalBudgetVnd, request.days),
    estimatedSpendVnd: 0, budgetRemainingVnd: 0, warnings,
  };
  return recalculatePlan(plan);
}

export function recalculatePlan(plan: StructuredItinerary): StructuredItinerary {
  const targets = targetBudget(plan.totalBudgetVnd, plan.days);
  const totals = { food: 0, activities: 0, transport: 0, lodging: 0 };
  for (const day of plan.schedule) for (const stop of day.stops) {
    totals[stop.category] += stop.estimatedCostVnd;
  }
  // Unspecified costs for accommodation and transportation have planned allowances.
  const foodVnd = totals.food;
  const lodgingVnd = Math.max(totals.lodging, targets.lodgingVnd);
  const transportVnd = Math.max(totals.transport, targets.transportVnd);
  const activitiesVnd = totals.activities;
  const reserveVnd = targets.reserveVnd;
  const estimatedSpendVnd = foodVnd + lodgingVnd + transportVnd + activitiesVnd + reserveVnd;
  const warnings = plan.warnings.filter(w => !w.startsWith('Dự toán vượt ngân sách:'));
  if (estimatedSpendVnd > plan.totalBudgetVnd) {
    warnings.unshift('Dự toán vượt ngân sách: ' +
      (estimatedSpendVnd - plan.totalBudgetVnd).toLocaleString('vi-VN') + 'đ. Hãy điều chỉnh hoạt động hoặc ngân sách.');
  }
  return {
    ...plan,
    budgetBreakdown: { foodVnd, lodgingVnd, transportVnd, activitiesVnd, reserveVnd },
    estimatedSpendVnd,
    budgetRemainingVnd: plan.totalBudgetVnd - estimatedSpendVnd,
    warnings,
  };
}

export function validateStoredPlan(input: unknown): StructuredItinerary | null {
  if (!isObj(input) || input.schemaVersion !== 1) return null;
  const request = parseRequest(input);
  if (!request) return null;
  return normalizeItinerary(input, request);
}
