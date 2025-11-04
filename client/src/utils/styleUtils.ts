export function shadow(level = 2) {
  const e = Math.min(Math.max(level, 1), 5);
  return {
    elevation: e,
    shadowColor: "#000",
    shadowOpacity: 0.08 + e * 0.02,
    shadowRadius: 2 + e,
    shadowOffset: { width: 0, height: 1 + e / 2 },
  };
}
