const normalizeGuestName = (value) => {
  const cleaned = String(value || '').trim();
  return cleaned || 'Khach QR';
};

const appendGuestNote = (note, guestName) => {
  const cleanNote = String(note || '').trim();
  const guestPrefix = `[guest:${normalizeGuestName(guestName)}]`;
  return cleanNote ? `${guestPrefix} ${cleanNote}` : guestPrefix;
};

const parseGuestNameFromNote = (note) => {
  const value = String(note || '');
  const match = value.match(/^\[guest:(.+?)\]\s*/i);
  return match ? match[1].trim() : null;
};

const stripGuestNotePrefix = (note) => {
  return String(note || '').replace(/^\[guest:(.+?)\]\s*/i, '').trim();
};

module.exports = {
  normalizeGuestName,
  appendGuestNote,
  parseGuestNameFromNote,
  stripGuestNotePrefix,
};
