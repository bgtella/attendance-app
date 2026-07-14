// ============================================================
// useAttendance.js
// Manages attendance toggle state for the current session.
// Auto-saves to localStorage on every change (interim saves).
// Provides sync-to-Google-Sheets action.
// ============================================================

import { useState, useCallback } from 'react';
import * as storageService from '../services/storageService';
import * as sheetsService from '../services/sheetsService';

// Column name constants matching the Attendance sheet headers
const COL_LAST_NAME  = 'Last Name';
const COL_FIRST_NAME = 'First Name';
const COL_STATUS     = 'Status';

export const useAttendance = () => {
  // Restore last saved attendance state from localStorage
  const [attendance, setAttendanceState] = useState(() => storageService.getAttendance());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Persist every toggle immediately (README objective #8)
  // attendanceDate is passed in so we know which date this attendance belongs to
  const setAttendance = useCallback((updater, date) => {
    setAttendanceState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storageService.saveAttendance(next);
      if (date) storageService.saveAttendanceDate(date);
      return next;
    });
  }, []);

  // Toggle a single member's attendance
  const toggleAttendance = useCallback(
    (id, isDeceased) => {
      if (isDeceased) return;
      setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    [setAttendance]
  );

  // Clear all attendance for a new session
  const clearAttendance = useCallback(() => {
    storageService.clearAttendance();
    setAttendanceState({});
  }, []);

  /**
   * Loads a previously saved attendance record from Google Sheets for a specific date.
   * Matches each returned row back to a member in the current roster by firstName + lastName.
   * Returns { matched, total } counts so the UI can show a summary.
   * README objective #9 — edit attendance after saving.
   */
  const loadAttendanceFromSheets = useCallback(
    async (members, date) => {
      if (!navigator.onLine) {
        throw new Error('You are offline. Cannot load from Google Sheets.');
      }

      const rows = await sheetsService.fetchAttendance(date);

      if (!rows || rows.length === 0) {
        throw new Error(`No attendance record found for ${date}.`);
      }

      // Build a lookup: "LASTNAME|FIRSTNAME" → status value
      const statusMap = {};
      rows.forEach((row) => {
        const last  = String(row[COL_LAST_NAME]  || '').toUpperCase().trim();
        const first = String(row[COL_FIRST_NAME] || '').toUpperCase().trim();
        const status = String(row[COL_STATUS] || '');
        statusMap[`${last}|${first}`] = status;
      });

      // Match each roster member back by name and rebuild attendance state
      const rebuilt = {};
      let matched = 0;

      members.forEach((m) => {
        const key = `${(m.lastName || '').toUpperCase().trim()}|${(m.firstName || '').toUpperCase().trim()}`;
        if (key in statusMap) {
          // Treat any truthy / '1' / 'Present' value as present
          const val = statusMap[key];
          rebuilt[m.id] = val === '1' || val.toLowerCase() === 'present' || val === true;
          matched++;
        }
      });

      setAttendance(rebuilt);
      return { matched, total: rows.length };
    },
    [setAttendance]
  );

  /**
   * Sync attendance to Google Sheets.
   * Row shape: { date, cluster, household, firstName, lastName, type, status, timestamp }
   * Supports re-sync after editing — Apps Script handles upsert by date.
   * README objectives #6 and #9.
   */
  const syncToSheets = useCallback(
    async (members, meetingDate) => {
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Connect to Wi-Fi or export a CSV backup.');
      }

      setIsSyncing(true);
      setSyncError(null);

      const timestamp = new Date().toISOString();
      const isDeceased = (m) => m.firstName.includes('(+)') || m.lastName.includes('(+)');

      const rows = members.map((m) => ({
        date:      meetingDate,
        cluster:   m.cluster,
        household: m.household,
        firstName: m.firstName || '',
        lastName:  m.lastName  || '',
        type:      m.type,
        status:    isDeceased(m) ? '' : attendance[m.id] ? '1' : '',
//        status:    isDeceased(m) ? 'Deceased' : attendance[m.id] ? '1' : 'Absent',
        timestamp,
      }));

      try {
        await sheetsService.saveAttendance(rows);
        storageService.saveAttendance(attendance);
      } catch (err) {
        setSyncError(err.message || 'Sync failed.');
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    [attendance]
  );

  const totalPresent = Object.values(attendance).filter(Boolean).length;

  return {
    attendance,
    setAttendance,
    toggleAttendance,
    clearAttendance,
    syncToSheets,
    loadAttendanceFromSheets,
    isSyncing,
    syncError,
    totalPresent,
  };
};
