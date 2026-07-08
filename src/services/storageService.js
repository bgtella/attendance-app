// ============================================================
// storageService.js
// Wraps localStorage for offline-first caching and interim saves
// Uses versioned keys to avoid conflicts with the old prototype
// ============================================================

const KEYS = {
  ROSTER: 'sol_roster_v6',
  ATTENDANCE: 'sol_attendance_v1',
  MEETING_DATE: 'sol_meeting_date_v1',
};

const safeGet = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
};

// --- Roster ---
export const getRoster = () => safeGet(KEYS.ROSTER);
export const saveRoster = (data) => safeSet(KEYS.ROSTER, data);
export const clearRoster = () => localStorage.removeItem(KEYS.ROSTER);

// --- Attendance ---
export const getAttendance = () => safeGet(KEYS.ATTENDANCE) || {};
export const saveAttendance = (data) => safeSet(KEYS.ATTENDANCE, data);
export const clearAttendance = () => localStorage.removeItem(KEYS.ATTENDANCE);

// --- Meeting Date ---
export const getMeetingDate = () => safeGet(KEYS.MEETING_DATE);
export const saveMeetingDate = (date) => safeSet(KEYS.MEETING_DATE, date);
