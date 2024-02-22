export const ToolEnum = {
  RECTANGLE: "RECTANGLE",
  SELECT: "SELECT"
} as const;

export type Tool = keyof typeof ToolEnum;
