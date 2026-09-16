export interface OpeningHours {
  readonly days: string;
  readonly weekdays: readonly number[]; // Sunday = 0, Saturday = 6
  readonly opens: string;
  readonly closes: string;
}

export const WEEKLY_HOURS = [
  { days: "Mon – Fri", weekdays: [1, 2, 3, 4, 5], opens: "07:00", closes: "17:00" },
  { days: "Sat – Sun", weekdays: [6, 0], opens: "09:00", closes: "17:00" },
] as const satisfies readonly OpeningHours[];

const displayTime = (time: string) => {
  const [hour = "0", minute = "00"] = time.split(":");
  const value = Number(hour);
  return `${value % 12 || 12}:${minute}${value < 12 ? "am" : "pm"}`;
};

export const CAFE = {
  name: "Coffee Room",
  tagline: "Coffee & Bakery",
  address: "123 Maple Street, Brooklyn, NY 11201",
  phone: "(718) 123-4567",
  email: "hello@coffeeroom.com",
  instagram: "@coffeeroombk",
  timezone: "America/New_York",
  weeklyHours: WEEKLY_HOURS,
  hours: WEEKLY_HOURS.map(({ days, opens, closes }) => ({
    days,
    time: `${displayTime(opens)} – ${displayTime(closes)}`,
  })),
  milk: {
    options: [
      { id: "whole", name: "Whole milk", alternative: false },
      { id: "oat", name: "Oat milk", alternative: true },
      { id: "almond", name: "Almond milk", alternative: true },
    ],
    alternativeSurcharge: 0.5,
    currency: "USD",
    checkoutSupportsSelection: false,
    checkoutCalculatesSurcharge: false,
  },
  fulfillment: {
    pickupAvailable: true,
    sameDayDeliveryAvailable: true,
    deliveryAreas: [
      "Downtown Brooklyn",
      "Brooklyn Heights",
      "DUMBO",
      "Cobble Hill",
      "Boerum Hill",
      "Fort Greene",
    ],
    deliveryOutsideConfirmedAreas: false,
  },
  // null explicitly means unknown, never free, unavailable, or safe.
  unknownFacts: {
    deliveryRadius: null,
    deliveryFee: null,
    minimumOrder: null,
    deliveryLeadTime: null,
    holidayHours: null,
    inventory: null,
    advanceOrderAvailability: null,
    allergySafety: null,
    completeIngredients: null,
    crossContaminationPolicies: null,
  },
} as const;
