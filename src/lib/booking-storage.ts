export interface StoredBooking {
  id: number | string;
  user_id_int: number;
  parking_lot_id: number;
  parking_name: string;
  address: string;
  vehicle_number: string;
  total_cost: number;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
  spot_id?: string;
  transaction_id?: string;
  duration_minutes?: number;
}

const STORAGE_KEY = "spotace_local_bookings";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const normalizeBookings = (value: unknown): StoredBooking[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is StoredBooking => typeof item === "object" && item !== null);
};

export const readLocalBookings = (userId?: number) => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = normalizeBookings(raw ? JSON.parse(raw) : []);

    if (typeof userId !== "number") {
      return parsed;
    }

    return parsed.filter((booking) => booking.user_id_int === userId);
  } catch {
    return [];
  }
};

const writeLocalBookings = (bookings: StoredBooking[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

const bookingKey = (booking: Pick<StoredBooking, "id" | "transaction_id">) =>
  booking.transaction_id || `booking-${booking.id}`;

export const upsertLocalBooking = (booking: StoredBooking) => {
  const currentBookings = readLocalBookings();
  const nextKey = bookingKey(booking);
  const nextBookings = [
    booking,
    ...currentBookings.filter((currentBooking) => bookingKey(currentBooking) !== nextKey),
  ];

  writeLocalBookings(nextBookings);
};

export const mergeBookings = (serverBookings: StoredBooking[], localBookings: StoredBooking[]) => {
  const merged = new Map<string, StoredBooking>();

  [...localBookings, ...serverBookings].forEach((booking) => {
    merged.set(bookingKey(booking), booking);
  });

  return Array.from(merged.values()).sort((left, right) => {
    const leftDate = new Date(left.created_at || left.start_time).getTime();
    const rightDate = new Date(right.created_at || right.start_time).getTime();

    return rightDate - leftDate;
  });
};

export const buildBookingQrPayload = (
  booking: Pick<StoredBooking, "id" | "transaction_id" | "vehicle_number" | "spot_id" | "parking_lot_id">,
) =>
  [booking.transaction_id || `BOOK-${booking.id}`, booking.vehicle_number, booking.spot_id || `LOT-${booking.parking_lot_id}`]
    .filter(Boolean)
    .join("|");

export const buildBookingQrUrl = (
  booking: Pick<StoredBooking, "id" | "transaction_id" | "vehicle_number" | "spot_id" | "parking_lot_id">,
  size = 220,
) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(buildBookingQrPayload(booking))}`;
