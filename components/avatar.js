const COLORS = [
  "#6ea8fe",
  "#ffcf5c",
  "#6bd39a",
  "#ff8fb1",
  "#c08cff",
  "#5fd0d6",
  "#ffa96b",
];

// Deterministic color per name so a friend always keeps the same avatar.
export function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function initial(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}
