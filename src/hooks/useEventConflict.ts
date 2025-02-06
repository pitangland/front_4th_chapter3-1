// src/hooks/useEventConflict.ts

import { useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseEventConflictReturn {
  isOverlapDialogOpen: boolean;
  overlappingEvents: Event[];
  checkEventConflict: (eventData: Event | EventForm, allEvents: Event[]) => boolean;
  closeOverlapDialog: () => void;
}

export const useEventConflict = (): UseEventConflictReturn => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const checkEventConflict = (eventData: Event | EventForm, allEvents: Event[]): boolean => {
    const overlapping = findOverlappingEvents(eventData, allEvents);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return true;
    }

    return false;
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
    setOverlappingEvents([]);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    checkEventConflict,
    closeOverlapDialog,
  };
};
