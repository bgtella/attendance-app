# Google Apps Script Setup Guide

## Overview

This document describes the changes needed to your existing Google Apps Script Web App
to support the SOLPG Attendance App.

The script needs **two handlers**:
1. `doPost(e)` — already exists — receives and saves attendance rows to the **Attendance** sheet
2. `doGet(e)` — **new** — serves the member roster from the **Members** sheet as JSON

---

## 1. Google Sheet Structure

Your spreadsheet should have **two sheets**:

### Sheet: `Members`
| ID | First Name | Last Name | Household | Cluster | Type |
|----|------------|-----------|-----------|---------|------|
| ash_bb1 | MANNY | CUADERNO | BURNING BUSH | ASHER | Member |
| ash_bb2 | JOY | CUADERNO | BURNING BUSH | ASHER | Member |
| ... | ... | ... | ... | ... | ... |

> **Tip:** You can populate the `Members` sheet from `src/data/defaultRoster.js`.
> The column headers must be exactly: `ID`, `First Name`, `Last Name`, `Household`, `Cluster`, `Type`
> From then on, add/edit/remove members directly in the sheet — the app will
> pick up changes the next time it loads with an internet connection.

### Sheet: `Attendance`
| Date | Cluster | Household | Last Name | First Name | Type | Status | Timestamp |
|------|---------|-----------|-----------|------------|------|--------|-----------|
| 2025-01-15 | ASHER | BURNING BUSH | CUADERNO | MANNY | Member | Present | 2025-01-15T10:30:00.000Z |

> This sheet is written to by `doPost` and should not need manual editing.

---

## 2. Apps Script Code

Open your Apps Script editor (`Extensions > Apps Script`) and **replace or update** the
script with the following. Keep your existing `doPost` handler intact — only add `doGet`.

```javascript
// ============================================================
// toYMD — normalises any date value to "YYYY-MM-DD" string
// Handles: JS Date objects, date serials, "M/D/YYYY", "YYYY-MM-DD"
// ============================================================
function toYMD(val) {
  if (!val) return '';
  var d;
  if (val instanceof Date) {
    d = val;
  } else if (typeof val === 'number') {
    // Google Sheets date serial: days since 30 Dec 1899
    d = new Date(Math.round((val - 25569) * 86400 * 1000));
  } else {
    d = new Date(String(val).trim());
  }
  if (isNaN(d.getTime())) return String(val).trim(); // fallback: return as-is
  var y  = d.getFullYear();
  var mo = String(d.getMonth() + 1).padStart(2, '0');
  var dy = String(d.getDate()).padStart(2, '0');
  return y + '-' + mo + '-' + dy;
}

// ============================================================
// doGet — serves the Members roster OR a past attendance record
// Actions:
//   ?action=getRoster
//   ?action=getAttendance&date=2025-01-15
// ============================================================
function doGet(e) {

  // ── getAttendance: return all rows for a specific date ──
  if (e.parameter.action === 'getAttendance') {
    try {
      var date = e.parameter.date;
      if (!date) {
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Missing date parameter' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Normalise the incoming date to YYYY-MM-DD for comparison
      // e.g. "2025-07-04" stays as-is
      var normTarget = toYMD(date);

      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Attendance');
      var data = sheet.getDataRange().getValues();
      var headers = data[0]; // Date,Cluster,Household,Last Name,First Name,Type,Status,Timestamp

      var rows = data.slice(1).filter(function(row) {
        // row[0] may be a Date object, a number, or a string depending on how Sheets stored it
        return toYMD(row[0]) === normTarget;
      }).map(function(row) {
        var obj = {};
        headers.forEach(function(h, i) {
          // Trim header keys to avoid whitespace mismatches
          obj[String(h).trim()] = row[i];
        });
        return obj;
      });

      // Also return a debug field so the app can show what was found
      return ContentService
        .createTextOutput(JSON.stringify({ rows: rows, debug_target: normTarget, debug_total: data.length - 1 }))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ── getRoster: return all members ──
  if (e.parameter.action === 'getRoster') {
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Members');
      var rows = sheet.getDataRange().getValues();
      var headers = rows[0];
      var members = rows.slice(1)
        .filter(function(row) { return row[0] !== ''; }) // skip empty rows
        .map(function(row) {
          var obj = {};
          headers.forEach(function(h, i) {
            obj[h.toLowerCase()] = row[i];
          });
          return obj;
        });

      return ContentService
        .createTextOutput(JSON.stringify(members))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// doPost — receives and saves attendance rows
// Called by the app when "Save to Google Sheets" is clicked
// ============================================================
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Attendance');
    var rows = JSON.parse(e.postData.contents);

    // Upsert: delete existing rows for this date, then re-insert
    // This supports re-editing attendance after saving (README objective #9)
    if (rows.length > 0) {
      var dateToReplace = rows[0].date;
      var data = sheet.getDataRange().getValues();
      // Find and delete rows matching this date (iterate in reverse)
      for (var i = data.length - 1; i >= 1; i--) {
        if (String(data[i][0]) === String(dateToReplace)) {
          sheet.deleteRow(i + 1);
        }
      }
    }

    // Append new rows
    rows.forEach(function(row) {
      sheet.appendRow([
        row.date,
        row.cluster,
        row.household,
        row.lastName,
        row.firstName,
        row.type,
        row.status,
        row.timestamp
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', count: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 3. Deployment Steps

After updating the script:

1. Click **Deploy > Manage Deployments**
2. Click the pencil icon on your existing Web App deployment
3. Change **Version** to **"New version"**
4. Confirm:
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy** and copy the new Web App URL
6. Paste the URL into your project's `.env` file:
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_NEW_ID/exec
   ```
7. Rebuild the app: `npm run build`

---

## 4. CORS Note

The `doGet` request is a plain GET (no preflight), so CORS is not an issue for the roster fetch.

The `doPost` for attendance uses `mode: 'no-cors'` in the fetch call, which means the
response body is opaque — but the data still reaches the sheet. This is the standard
pattern for Apps Script Web Apps called from a browser.
