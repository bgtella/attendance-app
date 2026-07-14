import { useState, useEffect, useCallback } from 'react';

// Hooks
import { useRoster } from './hooks/useRoster';
import { useAttendance } from './hooks/useAttendance';

// Services
import * as csvService from './services/csvService';
import * as storageService from './services/storageService';

// Components
import Header from './components/Header';
import ClusterNav from './components/ClusterNav';
import HouseholdNav from './components/HouseholdNav';
import MemberPanel from './components/MemberPanel';
import OperationsPanel from './components/OperationsPanel';
import GuestModal from './components/GuestModal';
import Toast from './components/Toast';

function App() {
  // --- Roster & Navigation ---
  const { members, setMembers, isLoading, rosterError, addGuest, resetToDefault, CLUSTERS, CLUSTER_HH_MAP } = useRoster();

  const [activeCluster, setActiveCluster] = useState(CLUSTERS[0]);
  const filteredHouseholds = CLUSTER_HH_MAP[activeCluster] || [];
  const [activeHousehold, setActiveHousehold] = useState(filteredHouseholds[0] || '');

  // Sync active household when cluster changes
  useEffect(() => {
    const hhs = CLUSTER_HH_MAP[activeCluster] || [];
    setActiveHousehold(hhs[0] || '');
  }, [activeCluster, CLUSTER_HH_MAP]);

  // --- Attendance ---
  const { attendance, setAttendance, toggleAttendance, clearAttendance, syncToSheets, loadAttendanceFromSheets, isSyncing, totalPresent } = useAttendance();

  // Loading state for the "Load Past Date" action
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  // --- Meeting Date (persisted) ---
  const [meetingDate, setMeetingDateState] = useState(
    () => storageService.getMeetingDate() || new Date().toISOString().split('T')[0]
  );

  // When date changes: if there is unsaved attendance for a DIFFERENT date,
  // ask the admin to confirm before clearing — prevents accidental carry-over.
  const setMeetingDate = (newDate) => {
    const storedAttDate = storageService.getAttendanceDate();
    const hasAttendance = Object.values(storageService.getAttendance()).some(Boolean);

    if (hasAttendance && storedAttDate && storedAttDate !== newDate) {
      const confirmed = window.confirm(
        `You have unsaved attendance for ${storedAttDate}.\n\nSwitching to ${newDate} will clear the current session.\n\nContinue?`
      );
      if (!confirmed) return; // user cancelled — keep current date
      clearAttendance();
    }

    setMeetingDateState(newDate);
    storageService.saveMeetingDate(newDate);
  };

  // --- Toast Notifications ---
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const showToast = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
  }, []);
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification((p) => ({ ...p, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Show roster fetch errors as toasts
  useEffect(() => {
    if (rosterError) showToast(`Roster: ${rosterError} — using cached data.`, 'error');
  }, [rosterError, showToast]);

  // On app load: warn if stored attendance belongs to a different date than today's date
  useEffect(() => {
    const storedAttDate = storageService.getAttendanceDate();
    const hasAttendance = Object.values(storageService.getAttendance()).some(Boolean);
    const today = new Date().toISOString().split('T')[0];

    if (hasAttendance && storedAttDate && storedAttDate !== today) {
      showToast(
        `Session restored from ${storedAttDate}. Change the date or click "New Session" to start fresh.`,
        'error'
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Guest Form State ---
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestCluster, setGuestCluster] = useState(CLUSTERS[0]);
  const [guestHousehold, setGuestHousehold] = useState(CLUSTER_HH_MAP[CLUSTERS[0]][0]);

  const handleOpenGuestForm = () => {
    setGuestCluster(activeCluster);
    setGuestHousehold(filteredHouseholds[0] || '');
    setShowGuestForm(true);
  };

  const handleGuestClusterChange = (cluster) => {
    setGuestCluster(cluster);
    setGuestHousehold((CLUSTER_HH_MAP[cluster] || [])[0] || '');
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!guestFirstName.trim() || !guestLastName.trim() || !guestCluster || !guestHousehold) return;
    const newGuest = addGuest({ firstName: guestFirstName, lastName: guestLastName, cluster: guestCluster, household: guestHousehold });
    setAttendance((prev) => ({ ...prev, [newGuest.id]: true }));
    setGuestFirstName('');
    setGuestLastName('');
    setShowGuestForm(false);
    setActiveCluster(guestCluster);
    setActiveHousehold(guestHousehold);
    showToast(`Successfully registered and checked in guest ${newGuest.name}!`, 'success');
  };

  // --- Load Past Date from Google Sheets (for editing) ---
  const handleLoadPastDate = async () => {
    if (!meetingDate) {
      showToast('Please select a date in the date picker first.', 'error');
      return;
    }
    setIsLoadingPast(true);
    try {
      const { matched, total } = await loadAttendanceFromSheets(members, meetingDate);
      showToast(
        `Loaded attendance for ${meetingDate}. ${matched} of ${total} records matched. Make changes and re-save.`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to load past attendance.', 'error');
    } finally {
      setIsLoadingPast(false);
    }
  };

  // --- Sync to Google Sheets ---
  const handleSyncToSheets = async () => {
    try {
      await syncToSheets(members, meetingDate);
      // Record which date was just synced so we can detect stale sessions later
      storageService.saveAttendanceDate(meetingDate);
      showToast('Attendance successfully synced to Google Sheets!', 'success');
    } catch (err) {
      showToast(err.message || 'Sync failed. Export CSV backup first.', 'error');
    }
  };

  // --- CSV Export ---
  const handleExportCSV = () => {
    csvService.exportToCSV(members, attendance, meetingDate);
    showToast('Backup CSV file downloaded successfully!', 'success');
  };

  // --- Load Offline Backup ---
  const handleLoadBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { members: imported, attendance: importedAtt, date } = csvService.importAttendanceCSV(event.target.result);
        setMembers(imported);
        setAttendance(importedAtt);
        setMeetingDate(date);
        if (imported.length > 0) {
          setActiveCluster(imported[0].cluster.toUpperCase());
          setActiveHousehold(imported[0].household.toUpperCase());
        }
        showToast(`Restored check-ins for ${date}!`, 'success');
      } catch (err) {
        showToast(err.message || 'Failed to parse backup CSV.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // --- Upload Master Roster ---
  const handleUploadRoster = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = csvService.importRosterCSV(event.target.result);
        setMembers(parsed);
        clearAttendance();
        showToast(`Successfully loaded ${parsed.length} records!`, 'success');
      } catch (err) {
        showToast(err.message || 'Failed to parse roster CSV.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // --- New Session (clear attendance for a fresh start) ---
  const handleNewSession = () => {
    if (!window.confirm(`Clear all attendance for ${meetingDate} and start a new session?`)) return;
    clearAttendance();
    showToast('Session cleared. Ready for a new attendance entry.', 'success');
  };

  // --- Reset Roster ---
  const handleResetRoster = () => {
    if (!window.confirm('Are you sure you want to restore the original roster? This will clear all current edits.')) return;
    resetToDefault();
    clearAttendance();
    setActiveCluster(CLUSTERS[0]);
    showToast('Original roster successfully restored!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">

      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification((p) => ({ ...p, show: false }))} />

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">

        {/* Header */}
        <Header meetingDate={meetingDate} onDateChange={setMeetingDate} totalPresent={totalPresent} />

        {/* Loading banner */}
        {isLoading && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 text-xs text-blue-700 font-semibold flex items-center gap-2">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Refreshing roster from Google Sheets…
          </div>
        )}

        {/* Main layout */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">

          {/* Left column */}
          <div className="w-full md:w-1/3 space-y-6">
            <ClusterNav
              clusters={CLUSTERS}
              activeCluster={activeCluster}
              onSelect={setActiveCluster}
            />
            <HouseholdNav
              households={filteredHouseholds}
              activeHousehold={activeHousehold}
              activeCluster={activeCluster}
              members={members}
              attendance={attendance}
              onSelect={setActiveHousehold}
            />
            <OperationsPanel
              onOpenGuestForm={handleOpenGuestForm}
              onSyncToSheets={handleSyncToSheets}
              onExportCSV={handleExportCSV}
              onLoadBackup={handleLoadBackup}
              onUploadRoster={handleUploadRoster}
              onResetRoster={handleResetRoster}
              onLoadPastDate={handleLoadPastDate}
              onNewSession={handleNewSession}
              isSyncing={isSyncing}
              isLoadingPast={isLoadingPast}
            />
          </div>

          {/* Right column */}
          <MemberPanel
            members={members}
            activeCluster={activeCluster}
            activeHousehold={activeHousehold}
            attendance={attendance}
            onToggle={toggleAttendance}
          />
        </div>
      </div>

      {/* Guest Modal */}
      <GuestModal
        show={showGuestForm}
        onClose={() => setShowGuestForm(false)}
        onSubmit={handleAddGuest}
        clusters={CLUSTERS}
        clusterHHMap={CLUSTER_HH_MAP}
        guestCluster={guestCluster}
        guestHousehold={guestHousehold}
        guestFirstName={guestFirstName}
        guestLastName={guestLastName}
        onFirstNameChange={setGuestFirstName}
        onLastNameChange={setGuestLastName}
        onClusterChange={handleGuestClusterChange}
        onHouseholdChange={setGuestHousehold}
      />
    </div>
  );
}

export default App;
