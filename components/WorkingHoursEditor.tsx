import React from 'react';
import { WorkingHours } from '../types';

interface WorkingHoursEditorProps {
  schedule: { [day: string]: WorkingHours };
  onChange: (newSchedule: { [day: string]: WorkingHours }) => void;
  disabled?: boolean;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WorkingHoursEditor: React.FC<WorkingHoursEditorProps> = ({ schedule, onChange, disabled }) => {
  // FIX: Refactored to be more readable, type-safe, and to fix a logic bug
  // where toggling an unscheduled day would not correctly mark it as 'on'.
  const handleDayToggle = (day: string) => {
    const newSchedule = { ...schedule };
    const currentDaySchedule = schedule[day] || { startTime: '09:00', endTime: '17:00', isOff: true };
    newSchedule[day] = { ...currentDaySchedule, isOff: !currentDaySchedule.isOff };
    onChange(newSchedule);
  };

  // FIX: Provided a full default object to satisfy the WorkingHours type, fixing the error.
  // The UI should prevent this fallback from being used as time inputs are disabled for "off" days.
  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = { ...schedule };
    const currentDaySchedule = schedule[day] || { startTime: '09:00', endTime: '17:00', isOff: false };
    newSchedule[day] = { ...currentDaySchedule, [field]: value };
    onChange(newSchedule);
  };

  const inputBaseClasses = "block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3 disabled:bg-gray-200 disabled:text-gray-500";


  return (
    <div className="space-y-4">
      <p className="block text-sm font-medium text-gray-700">Set Your Weekly Availability</p>
      {daysOfWeek.map(day => {
        const daySchedule = schedule?.[day] || { startTime: '09:00', endTime: '17:00', isOff: true };
        const isOff = daySchedule.isOff;

        return (
          <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="md:col-span-1">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isOff}
                  onChange={() => handleDayToggle(day)}
                  disabled={disabled}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                  aria-label={`Toggle availability for ${day}`}
                />
                <span className="font-medium text-gray-800">{day}</span>
              </label>
            </div>
            <div className="md:col-span-3 flex items-center space-x-2 md:space-x-4">
              <div className="flex-1">
                <label htmlFor={`${day}-start`} className="text-xs text-gray-500">From</label>
                <input
                  type="time"
                  id={`${day}-start`}
                  value={daySchedule.startTime}
                  onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                  disabled={isOff || disabled}
                  className={inputBaseClasses}
                  aria-label={`Start time for ${day}`}
                />
              </div>
              <span className="text-gray-400 pt-5">—</span>
              <div className="flex-1">
                <label htmlFor={`${day}-end`} className="text-xs text-gray-500">To</label>
                <input
                  type="time"
                  id={`${day}-end`}
                  value={daySchedule.endTime}
                  onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                  disabled={isOff || disabled}
                  className={inputBaseClasses}
                  aria-label={`End time for ${day}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkingHoursEditor;
