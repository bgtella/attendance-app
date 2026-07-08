// ============================================================
// csvService.js
// CSV export and import utilities
// Name columns: First Name + Last Name (separate columns)
// ============================================================

/**
 * Detects if a member is deceased — checks firstName, lastName, and combined name.
 */
const isDeceased = (m) =>
  (m.firstName || '').includes('(+)') ||
  (m.lastName  || '').includes('(+)') ||
  (m.name      || '').includes('(+)');

/**
 * Builds and triggers a CSV download of the current attendance session.
 * Columns: Date | Cluster | Household | Last Name | First Name | Type | Status
 */
export const exportToCSV = (members, attendance, meetingDate) => {
  const headers = ['Date', 'Cluster', 'Household', 'Last Name', 'First Name', 'Type', 'Status'];
  const rows = members.map((m) => [
    meetingDate,
    `"${m.cluster}"`,
    `"${m.household}"`,
    `"${m.lastName  || ''}"`,
    `"${m.firstName || ''}"`,
    m.type,
    isDeceased(m) ? 'Deceased' : attendance[m.id] ? 'Present' : 'Absent',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', `Attendance_SOL_${meetingDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Internal CSV line parser (handles quoted fields) ---
const parseCSVLine = (lineText) => {
  let p = '', c = '', r = [];
  let q = false;
  for (let i = 0; i < lineText.length; i++) {
    c = lineText.charAt(i);
    if (c === '"') {
      q = !q;
    } else if (c === ',' && !q) {
      r.push(p.trim());
      p = '';
    } else {
      p += c;
    }
  }
  r.push(p.trim());
  return r;
};

/**
 * Parses an attendance backup CSV (previously exported by this app).
 * Supports both the new format (Last Name | First Name) and the legacy format (Name).
 * Returns { members, attendance, date } or throws on invalid format.
 */
export const importAttendanceCSV = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) throw new Error('Valid layout for CSV file was not found.');

  const headers = parseCSVLine(lines[0]);
  if (headers[0] !== 'Date') throw new Error('Unsupported backup file structure.');

  // Detect column layout
  const idxLastName  = headers.indexOf('Last Name');
  const idxFirstName = headers.indexOf('First Name');
  const idxName      = headers.indexOf('Name'); // legacy fallback
  const idxCluster   = headers.indexOf('Cluster');
  const idxHousehold = headers.indexOf('Household');
  const idxType      = headers.indexOf('Type');
  const idxStatus    = headers.indexOf('Status');

  const importedMembers = [];
  const importedAttendance = {};
  let detectedDate = new Date().toISOString().split('T')[0];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 5) continue;

    detectedDate = row[0];
    const cluster   = row[idxCluster]   || '';
    const household = row[idxHousehold] || '';
    const type      = idxType !== -1 ? row[idxType] : 'Member';
    const status    = idxStatus !== -1 ? row[idxStatus] : '';

    let firstName = '', lastName = '';
    if (idxLastName !== -1 && idxFirstName !== -1) {
      lastName  = row[idxLastName]  || '';
      firstName = row[idxFirstName] || '';
    } else if (idxName !== -1) {
      // Legacy: split "LASTNAME, FIRSTNAME" or "FIRSTNAME LASTNAME"
      const raw = row[idxName] || '';
      if (raw.includes(',')) {
        const parts = raw.split(',');
        lastName  = parts[0].trim();
        firstName = parts.slice(1).join(',').trim();
      } else {
        const parts = raw.trim().split(' ');
        lastName  = parts[parts.length - 1];
        firstName = parts.slice(0, -1).join(' ');
      }
    }

    const tempId = `imported_${i}`;
    importedMembers.push({
      id: tempId,
      firstName,
      lastName,
      name: lastName && firstName ? `${lastName}, ${firstName}` : (lastName || firstName),
      household,
      cluster,
      type,
    });

    if (status === 'Present') importedAttendance[tempId] = true;
  }

  return { members: importedMembers, attendance: importedAttendance, date: detectedDate };
};

/**
 * Parses a master roster CSV (FAMILY NAME / HUSBAND / WIFE / HOUSEHOLD / Cluster columns).
 * Returns an array of member objects or throws on invalid format.
 */
export const importRosterCSV = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) throw new Error('Invalid CSV format.');

  let headers = [];
  let headerRowIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.includes('FAMILY NAME') || cols.includes('HOUSEHOLD') || cols.includes('Cluster')) {
      headers = cols;
      headerRowIndex = i;
      break;
    }
  }

  if (headers.length === 0) throw new Error("Required column headers 'FAMILY NAME' or 'HOUSEHOLD' not found.");

  const idxFamily    = headers.indexOf('FAMILY NAME');
  const idxHusband   = headers.indexOf('HUSBAND');
  const idxWife      = headers.indexOf('WIFE');
  const idxHousehold = headers.indexOf('HOUSEHOLD');
  const idxCluster   = headers.indexOf('Cluster') !== -1 ? headers.indexOf('Cluster') : headers.indexOf('CLUSTER');

  const parsedMembers = [];
  let counter = 1;

  const cleanName = (val) => val.replace(/\((?!(\+))\)/g, '').trim();

  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length <= Math.max(idxFamily, idxHousehold)) continue;

    const lastName  = row[idxFamily]?.trim().toUpperCase();
    const husband   = idxHusband !== -1 ? row[idxHusband]?.trim().toUpperCase() : '';
    const wife      = idxWife    !== -1 ? row[idxWife]?.trim().toUpperCase()    : '';
    const household = row[idxHousehold]?.trim().toUpperCase();
    const cluster   = idxCluster !== -1 ? row[idxCluster]?.trim().toUpperCase() : 'ASHER';

    if (!lastName || !household) continue;

    if (husband && cleanName(husband) !== '') {
      const firstName = cleanName(husband);
      parsedMembers.push({ id: `csv_${counter++}`, firstName, lastName, name: `${lastName}, ${firstName}`, household, cluster, type: 'Member' });
    }
    if (wife && cleanName(wife) !== '') {
      const firstName = cleanName(wife);
      parsedMembers.push({ id: `csv_${counter++}`, firstName, lastName, name: `${lastName}, ${firstName}`, household, cluster, type: 'Member' });
    }
    if (!husband && !wife) {
      parsedMembers.push({ id: `csv_${counter++}`, firstName: '', lastName, name: lastName, household, cluster, type: 'Member' });
    }
  }

  if (parsedMembers.length === 0) throw new Error('No active members found in the CSV.');
  return parsedMembers;
};
