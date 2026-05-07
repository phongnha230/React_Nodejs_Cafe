import { storage } from './storage.js';

const TABLE_SESSION_KEY = 'cafe_app:qr_table_session';

export const getTableSession = () => storage.get(TABLE_SESSION_KEY, null);

export const setTableSession = (table) => {
  const tableNumber = Number(table?.tableNumber ?? table?.table_number ?? table);
  if (!Number.isInteger(tableNumber) || tableNumber <= 0) return null;

  const next = {
    tableNumber,
    ts: table?.ts ? Number(table.ts) : null,
    sig: table?.sig || null,
    menuUrl: table?.menu_url || null,
    updatedAt: new Date().toISOString(),
  };

  storage.set(TABLE_SESSION_KEY, next);
  return next;
};

export const clearTableSession = () => {
  try {
    localStorage.removeItem(TABLE_SESSION_KEY);
  } catch {
    // Ignore storage errors in the browser.
  }
};

export const buildTableMenuUrl = (origin, tableNumber) => (
  `${origin}/menu?table=${encodeURIComponent(tableNumber)}`
);

export const buildQrImageUrl = (menuUrl) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(menuUrl)}`;
};
