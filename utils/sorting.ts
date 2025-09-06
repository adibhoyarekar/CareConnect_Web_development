import { Appointment } from '../types';

/**
 * Sorts an array of appointments chronologically based on their date and time.
 * @param appointments - The array of appointments to sort.
 * @param direction - The sorting direction: 'asc' for ascending (oldest first), 'desc' for descending (newest first).
 * @returns A new, sorted array of appointments.
 */
export const sortAppointmentsChronologically = (
  appointments: Appointment[],
  direction: 'asc' | 'desc' = 'asc'
): Appointment[] => {
  // Return a new sorted array to avoid mutating the original
  return [...appointments].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();

    // Handle invalid date parsing, though unlikely with proper data
    if (isNaN(dateTimeA) || isNaN(dateTimeB)) {
      return 0;
    }

    if (direction === 'asc') {
      return dateTimeA - dateTimeB;
    } else {
      return dateTimeB - dateTimeA;
    }
  });
};
