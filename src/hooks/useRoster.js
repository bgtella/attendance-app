// ============================================================
// useRoster.js
// Offline-first roster management hook.
// Serves cached data immediately, refreshes from Google Sheets in background.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_ROSTER, CLUSTERS, CLUSTER_HH_MAP } from '../data/defaultRoster';
import * as storageService from '../services/storageService';
import * as sheetsService from '../services/sheetsService';

export const useRoster = () => {
  // Initialise from cache immediately — no loading flash on repeat visits
  const [members, setMembersState] = useState(() => {
    return storageService.getRoster() || DEFAULT_ROSTER;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rosterError, setRosterError] = useState(null);

  // Persist any member change to localStorage
  const setMembers = useCallback((newMembers) => {
    setMembersState(newMembers);
    storageService.saveRoster(newMembers);
  }, []);

  // On mount: attempt a background refresh from Google Sheets
  useEffect(() => {
    if (!navigator.onLine) return;

    setIsLoading(true);
    setRosterError(null);

    sheetsService
      .fetchRoster()
      .then((freshRoster) => {
        if (freshRoster && freshRoster.length > 0) {
          setMembers(freshRoster);
        }
      })
      .catch((err) => {
        console.warn('Roster fetch failed — using cached data.', err);
        setRosterError(err.message || 'Could not load roster from Google Sheets.');
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Add a guest — appends to members list and persists locally
  const addGuest = useCallback(
    (guest) => {
      // Accept either { name } or { firstName, lastName }
      let firstName = (guest.firstName || '').toUpperCase().trim();
      let lastName  = (guest.lastName  || '').toUpperCase().trim();

      // If only a combined name was provided, split it: last word = last name
      if (!firstName && !lastName && guest.name) {
        const parts = guest.name.toUpperCase().trim().split(' ');
        lastName  = parts[parts.length - 1];
        firstName = parts.slice(0, -1).join(' ');
      }

      const newGuest = {
        id: `g_${Date.now()}`,
        firstName,
        lastName,
        name: lastName && firstName ? `${lastName}, ${firstName}` : (lastName || firstName),
        household: guest.household.toUpperCase(),
        cluster:   guest.cluster.toUpperCase(),
        type: 'Guest',
      };
      setMembers([...members, newGuest]);
      return newGuest;
    },
    [members, setMembers]
  );

  // Reset to the hardcoded default roster and clear localStorage
  const resetToDefault = useCallback(() => {
    storageService.clearRoster();
    storageService.clearAttendance();
    setMembersState(DEFAULT_ROSTER);
  }, []);

  return {
    members,
    setMembers,
    isLoading,
    rosterError,
    addGuest,
    resetToDefault,
    CLUSTERS,
    CLUSTER_HH_MAP,
  };
};
