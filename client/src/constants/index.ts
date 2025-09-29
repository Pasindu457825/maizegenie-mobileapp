export const ROUTES = {
  ROOT: { MAIN: "Main", MODAL: "Modal" },
  TABS: { HOME: "Home", BOOKINGS: "Bookings", SETTINGS: "Settings" },
} as const;

export const API_BASE = "http://192.168.1.50:8000"; // change to your Python server (FastAPI/Django/Flask)
