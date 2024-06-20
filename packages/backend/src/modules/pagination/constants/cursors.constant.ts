export const CURSORS = ["created_at", "id"] as const;
export type AVAILABLE_CURSOR = (typeof CURSORS)[number];
