import assert from 'node:assert/strict';
import { test } from 'node:test';

const { parseRequest, normalizeItinerary, recalculatePlan, validateStoredPlan } =
  await import('../.api-test-dist/src/utils/itinerary.js');

const request = {
  provinceId: 'Da Nang',
  days: 3,
  partySize: 2,
  totalBudgetVnd: 3000000,
  style: 'food',
  startDate: null,
  includeArrivalTransport: false,
  preferences: { preferAffordablePlaces: true, minimizeTravel: true, notes: '' },
};
const raw = {
  title: 'Hành trình ẩm thực Đà Nẵng',
  warnings: ['Giá chỉ là ước tính'],
  schedule: [1, 2, 3].map(day => ({
    day,
    stops: [
      {
        id: 'd' + day + 's1',
        period: 'morning', startTime: '08:00',
        title: day === 1 ? 'Mì Quảng' : 'Bún chả cá',
        description: 'Khám phá ẩm thực miền Trung',
        estimatedCostVnd: 120000, category: 'food', source: 'ai_suggestion',
      },
      {
        id: 'd' + day + 's2',
        period: 'noon', startTime: '12:00',
        title: 'Bánh tráng cuốn thịt heo', description: 'Món ăn đặc trưng',
        estimatedCostVnd: 180000, category: 'food', source: 'ai_suggestion',
      },
    ],
  })),
};

test('validates standard Danang 3-day food trip', () => {
  const input = parseRequest(request);
  assert.ok(input);
  assert.equal(input.days, 3);
  assert.equal(input.partySize, 2);
  assert.equal(input.totalBudgetVnd, 3000000);
  assert.equal(input.style, 'food');
});
test('rejects invalid budgets, days, province and notes', () => {
  assert.equal(parseRequest({ ...request, totalBudgetVnd: 0 }), null);
  assert.equal(parseRequest({ ...request, days: 15 }), null);
  assert.equal(parseRequest({ ...request, partySize: 0 }), null);
  assert.equal(parseRequest({ ...request, provinceId: 'Not real' }), null);
  assert.equal(parseRequest({ ...request, includeArrivalTransport: true, arrivalTransportVnd: 0 }), null);
  assert.equal(parseRequest({ ...request, includeArrivalTransport: true, arrivalTransportVnd: 2900000 }), null);
  assert.equal(parseRequest({ ...request, includeArrivalTransport: true, arrivalTransportVnd: 500000 })?.arrivalTransportVnd, 500000);
  assert.equal(parseRequest({ ...request, preferences: { notes: 'x'.repeat(501) } }), null);
});
test('normalizes 3-day schedule and recalculates group budget on server', () => {
  const trip = parseRequest(request);
  const plan = normalizeItinerary(raw, trip);
  assert.ok(plan);
  assert.equal(plan.schedule.length, 3);
  assert.equal(plan.budgetBreakdown.lodgingVnd, 900000);
  assert.equal(plan.budgetBreakdown.transportVnd, 300000);
  assert.equal(plan.budgetBreakdown.reserveVnd, 300000);
  assert.equal(plan.budgetBreakdown.foodVnd, 900000);
  assert.equal(plan.estimatedSpendVnd, 2400000);
  assert.equal(plan.budgetRemainingVnd, 600000);
  assert.ok(plan.schedule[0].stops[0].mapUrl.startsWith('https://www.google.com/maps/search/'));
  assert.equal(validateStoredPlan(plan)?.estimatedSpendVnd, 2400000);
});
test('detects over-budget edits without trusting a client-supplied total', () => {
  const plan = normalizeItinerary(raw, parseRequest(request));
  const edited = {
    ...plan, estimatedSpendVnd: 1,
    schedule: plan.schedule.map((d, index) => index === 0
      ? { ...d, stops: d.stops.map((s, i) => i === 0 ? { ...s, estimatedCostVnd: 1500000 } : s) }
      : d),
  };
  const calculated = validateStoredPlan(edited);
  assert.ok(calculated);
  assert.ok(calculated.estimatedSpendVnd > 3000000);
  assert.ok(calculated.warnings.some(w => w.startsWith('Dự toán vượt ngân sách:')));
});
test('rejects malformed AI JSON data including missing days and fake prices', () => {
  const trip = parseRequest(request);
  assert.equal(normalizeItinerary({ ...raw, schedule: raw.schedule.slice(0, 2) }, trip), null);
  assert.equal(normalizeItinerary({
    ...raw, schedule: raw.schedule.map((d, i) => i === 0
      ? { ...d, stops: [{ ...d.stops[0], estimatedCostVnd: -100 }] } : d),
  }, trip), null);
  assert.equal(normalizeItinerary({ ...raw, schedule: raw.schedule.map(d => ({ ...d, day: 2 })) }, trip), null);
});
