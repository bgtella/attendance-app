// ============================================================
// useAttendance.js
// Manages attendance toggle state for the current session.
// Auto-saves to localStorage on every change (interim saves).
// Provides sync-to-Google-Sheets action.
// ============================================================

import { useState, useCallback } from 'react';
import * as storageService from '../services/storageService';
import * as sheetsService from '../services/sheetsService';

export const useAttendance = () => {
  // Restore last saved attendance state from localStorage
  const [attendance, setAttendanceState] = useState(() => storageService.getAttendance());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Persist every toggle immediately (README objective #8)
  const setAttendance = useCallback((updater) => {
    setAttendanceState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storageService.saveAttendance(next);
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
    isSyncing,
    syncError,
    totalPresent,
  };
};
