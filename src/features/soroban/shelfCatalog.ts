export type ShelfId = "shelf-default" | "shelf-colorful" | "shelf-fancy";

export const DEFAULT_SHELF_ID: ShelfId = "shelf-default";

export const SHELF_DEFINITIONS: Array<{
  id: ShelfId;
  name: string;
  unlockItemId: string | null;
}> = [
  { id: "shelf-default", name: "たな１ごう", unlockItemId: null },
  { id: "shelf-colorful", name: "たな２ごう", unlockItemId: "shelf-colorful-unlock" },
  { id: "shelf-fancy", name: "たな３ごう", unlockItemId: "shelf-fancy-unlock" },
];

export const ALL_SHELF_IDS: ShelfId[] = SHELF_DEFINITIONS.map((shelf) => shelf.id);

export function isShelfId(value: unknown): value is ShelfId {
  return typeof value === "string" && ALL_SHELF_IDS.includes(value as ShelfId);
}

export function getUnlockedShelfIds(purchasedItemIds: string[]): ShelfId[] {
  return SHELF_DEFINITIONS.filter((shelf) => {
    if (!shelf.unlockItemId) return true;
    return purchasedItemIds.includes(shelf.unlockItemId);
  }).map((shelf) => shelf.id);
}
