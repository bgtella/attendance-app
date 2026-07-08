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
 * Saves attendance rows to the Attendance sheet via a POST request.
 * Payload shape per row: { date, cluster, household, firstName, lastName, type, status, timestamp }
 * Uses no-cors mode — response body is opaque but the post still lands.
 */
export const saveAttendance = async (rows) => {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not configured.');

  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  });
};
