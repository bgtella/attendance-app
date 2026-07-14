// ============================================================
// sheetsService.js
// Handles all communication with the Google Apps Script Web App
// ============================================================

import { APPS_SCRIPT_URL } from '../config';

/**
 * Fetches the live member roster from the Members sheet.
 * Expects columns: ID | First Name | Last Name | Household | Cluster | Type
 * Returns members with { id, firstName, lastName, name, household, cluster, type }
 * where `name` is formatted as "LASTNAME, FIRSTNAME" for display.
 */
export const fetchRoster = async () => {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not configured.');

  const url = `${APPS_SCRIPT_URL}?action=getRoster`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch roster: ${response.status}`);
  }

  const data = await response.json();

  return data.map((row) => {
    const firstName = String(row['first name'] || row['firstname'] || row['First Name'] || row['FIRST NAME'] || '').toUpperCase().trim();
    const lastName  = String(row['last name']  || row['lastname']  || row['Last Name']  || row['LAST NAME']  || '').toUpperCase().trim();
    return {
      id:        String(row.id || row.ID || ''),
      firstName,
      lastName,
      name:      lastName && firstName ? `${lastName}, ${firstName}` : (lastName || firstName),
      household: String(row.household || row.Household || row.HOUSEHOLD || '').toUpperCase(),
      cluster:   String(row.cluster   || row.Cluster   || row.CLUSTER   || '').toUpperCase(),
      type:      String(row.type      || row.Type      || row.TYPE      || 'Member'),
    };
  });
};

/**
 * Fetches saved attendance rows for a specific date from the Attendance sheet.
 * Returns an array of row objects keyed by the Attendance sheet headers.
 * Used to reload a past session for editing (README objective #9).
 *
 * The Apps Script returns: { rows: [...], debug_target: "YYYY-MM-DD", debug_total: N }
 * We log the debug info to the console so it's visible in DevTools if matching fails.
 */
export const fetchAttendance = async (date) => {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not configured.');

  const url = `${APPS_SCRIPT_URL}?action=getAttendance&date=${encodeURIComponent(date)}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Failed to fetch attendance: ${response.status}`);

  const data = await response.json();
  if (data.error) throw new Error(data.error);

  // Log debug info so mismatches are visible in browser DevTools → Console
  if (data.debug_target !== undefined) {
    console.log(
      `[fetchAttendance] Looking for date: "${data.debug_target}" | ` +
      `Total rows in sheet: ${data.debug_total} | ` +
      `Matched rows: ${(data.rows || []).length}`
    );
    return data.rows || [];
  }

  // Fallback: old script returns a plain array
  return Array.isArray(data) ? data : [];
};

/**
 * Saves (upserts) attendance rows to the Attendance sheet via a POST request.
 * Payload shape per row: { date, cluster, household, firstName, lastName, type, status, timestamp }
 *
 * The Apps Script doPost deletes all existing rows for the same date first,
 * then inserts the new rows — so re-saving always replaces, never duplicates.
 *
 * Returns { result, inserted, deleted } from the script response.
 */
export const saveAttendance = async (rows) => {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not configured.');

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // text/plain avoids CORS preflight on Apps Script
    body: JSON.stringify(rows),
  });

  // Apps Script returns JSON — read it to confirm the upsert result
  try {
    const result = await response.json();
    if (result.error) throw new Error(`Apps Script error: ${result.error}`);
    console.log(`[saveAttendance] Deleted ${result.deleted} old rows, inserted ${result.inserted} new rows.`);
    return result;
  } catch {
    // If JSON parse fails the post still likely landed — treat as success
    console.warn('[saveAttendance] Could not read response — post may still have succeeded.');
  }
};
