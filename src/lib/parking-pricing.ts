export const PARKING_DURATION_STEP_MINUTES = 30;
export const MIN_PARKING_DURATION_MINUTES = 30;
export const MAX_PARKING_DURATION_MINUTES = 24 * 60;
export const LONG_STAY_DISCOUNT_THRESHOLD_MINUTES = 4 * 60;
export const DAILY_CAP_THRESHOLD_MINUTES = 12 * 60;
export const LONG_STAY_DISCOUNT_RATE = 0.1;

export interface ParkingPriceBreakdown {
  hourlyRate: number;
  halfHourRate: number;
  durationMinutes: number;
  standardTotal: number;
  uncappedTotal: number;
  totalCost: number;
  baseSubtotal: number;
  discountedSubtotal: number;
  discountedMinutes: number;
  discountSavings: number;
  capSavings: number;
  dailyCap: number;
  hasLongStayDiscount: boolean;
  capApplied: boolean;
}

const roundCurrency = (value: number) => Math.round(value);

export const clampParkingDuration = (durationMinutes: number) => {
  const stepped = Math.round(durationMinutes / PARKING_DURATION_STEP_MINUTES) * PARKING_DURATION_STEP_MINUTES;
  return Math.min(
    MAX_PARKING_DURATION_MINUTES,
    Math.max(MIN_PARKING_DURATION_MINUTES, stepped),
  );
};

export const getDurationMinutesBetween = (startTime: Date | string, endTime: Date | string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return MIN_PARKING_DURATION_MINUTES;
  }

  return Math.max(
    MIN_PARKING_DURATION_MINUTES,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
  );
};

export const formatDurationLabel = (durationMinutes: number) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;

  return `${hours} giờ ${minutes} phút`;
};

export const formatDurationCompact = (durationMinutes: number) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
};

export const getBookingWindow = (startTime: Date, durationMinutes: number) => {
  const safeDuration = clampParkingDuration(durationMinutes);
  const endTime = new Date(startTime.getTime() + safeDuration * 60 * 1000);

  return {
    startTime,
    endTime,
  };
};

export const calculateParkingPrice = (hourlyRate: number, durationMinutes: number): ParkingPriceBreakdown => {
  const safeDuration = clampParkingDuration(durationMinutes);
  const safeHourlyRate = Math.max(0, hourlyRate || 0);
  const halfHourRate = safeHourlyRate / 2;
  const dailyCap = safeHourlyRate * 12;

  const baseMinutes = Math.min(safeDuration, LONG_STAY_DISCOUNT_THRESHOLD_MINUTES);
  const discountedMinutes = Math.max(
    0,
    Math.min(safeDuration, DAILY_CAP_THRESHOLD_MINUTES) - LONG_STAY_DISCOUNT_THRESHOLD_MINUTES,
  );
  const tailMinutes = Math.max(0, safeDuration - DAILY_CAP_THRESHOLD_MINUTES);

  const baseSubtotal = (baseMinutes / PARKING_DURATION_STEP_MINUTES) * halfHourRate;
  const discountedSubtotal = (discountedMinutes / PARKING_DURATION_STEP_MINUTES) * halfHourRate * (1 - LONG_STAY_DISCOUNT_RATE);
  const tailSubtotal = (tailMinutes / PARKING_DURATION_STEP_MINUTES) * halfHourRate * (1 - LONG_STAY_DISCOUNT_RATE);
  const standardTotal = (safeDuration / 60) * safeHourlyRate;
  const uncappedTotal = baseSubtotal + discountedSubtotal + tailSubtotal;
  const totalCost = Math.min(uncappedTotal, dailyCap);
  const discountSavings = standardTotal - roundCurrency(baseSubtotal + discountedSubtotal + tailSubtotal);
  const capSavings = uncappedTotal > dailyCap ? uncappedTotal - dailyCap : 0;

  return {
    hourlyRate: roundCurrency(safeHourlyRate),
    halfHourRate: roundCurrency(halfHourRate),
    durationMinutes: safeDuration,
    standardTotal: roundCurrency(standardTotal),
    uncappedTotal: roundCurrency(uncappedTotal),
    totalCost: roundCurrency(totalCost),
    baseSubtotal: roundCurrency(baseSubtotal),
    discountedSubtotal: roundCurrency(discountedSubtotal + tailSubtotal),
    discountedMinutes: discountedMinutes + tailMinutes,
    discountSavings: Math.max(0, roundCurrency(discountSavings)),
    capSavings: Math.max(0, roundCurrency(capSavings)),
    dailyCap: roundCurrency(dailyCap),
    hasLongStayDiscount: discountedMinutes + tailMinutes > 0,
    capApplied: uncappedTotal > dailyCap,
  };
};
