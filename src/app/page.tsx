'use client';

import { useState, useEffect, useCallback } from 'react'; 
import Link from 'next/link';

// --- TYPE DEFINITION ---
interface MedicineReminder {
  id: string;
  medicineName: string;
  pillsRemaining: number;
  dosage: number;
  lowStockThreshold: number;
  schedule: string;
  stockStatus: 'In Stock' | 'Low' | 'Empty';
  member: string;
}
// -----------------------

// --- MOCK DATA AND LOGIC ---
const initialReminders: MedicineReminder[] = [
  // Added family member to mock data to match the schedule logic
  { id: 'r1', medicineName: 'Blood Pressure Med', pillsRemaining: 15, dosage: 1, lowStockThreshold: 7, schedule: '1:00 PM', stockStatus: 'Low', member: 'Grandpa Ahmed' },
  { id: 'r2', medicineName: 'Vitamin D', pillsRemaining: 90, dosage: 1, lowStockThreshold: 14, schedule: '10:00 AM', stockStatus: 'In Stock', member: 'Aisha' },
  { id: 'r3', medicineName: 'Amoxicillin', pillsRemaining: 2, dosage: 1, lowStockThreshold: 5, schedule: '8:00 AM', stockStatus: 'Empty', member: 'Omar (Son)' },
  { id: 'r4', medicineName: 'Amoxicillin', pillsRemaining: 8, dosage: 1, lowStockThreshold: 5, schedule: '8:00 PM', stockStatus: 'Low', member: 'Omar (Son)' },
];

const updateStockInSupabase = async (reminderId: string, newCount: number, newStatus: string) => {
  console.log(`[SUPABASE MOCK] Updating Reminder ${reminderId}: Count to ${newCount}, Status to ${newStatus}`);
  await new Promise(resolve => setTimeout(resolve, 50));
};

// NOTE: The old handleTakeDose is replaced/adapted inside the component to manage the notification state.

// Function to simulate grouping and status checks based on MOCK data
const getScheduleGroups = (reminders: MedicineReminder[]) => {
  // ... (Your existing getScheduleGroups logic)
  const groups: { [key: string]: MedicineReminder[] } = {
    Morning: [], // Before 12:00 PM
    Afternoon: [], // 12:00 PM to 5:00 PM
    Evening: [], // After 5:00 PM
  };

  reminders
    .sort((a, b) => a.schedule.localeCompare(b.schedule)) // Sort by time
    .forEach(r => {
      const [timeStr, ampm] = r.schedule.split(' ');
      let [hour] = timeStr.split(':').map(Number);

      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0; // Midnight case

      if (hour < 12) {
        groups.Morning.push(r);
      } else if (hour >= 12 && hour < 17) {
        groups.Afternoon.push(r);
      } else {
        groups.Evening.push(r);
      }
    });

  return groups;
};

// --- CORNER NOTIFICATION COMPONENT ---
interface NotificationPopupProps {
  reminder: MedicineReminder;
  onTakeDose: () => void;
  onRemindLater: () => void;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ reminder, onTakeDose, onRemindLater, onClose }) => {
  if (!reminder) return null;

  return (
    // Key Change: Use fixed bottom-4 right-4 for corner positioning
    <div
      className="fixed bottom-4 right-4 z-50 w-full max-w-sm bg-white rounded-lg shadow-xl overflow-hidden transform transition-all"
      role="alert"
      aria-live="assertive"
    >
      <div className="p-4">
        <div className="flex items-start">

          {/* Bell Icon */}
          <div className="flex-shrink-0 pt-0.5">
            <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Medication Reminder 💊
            </p>
            <p className="mt-1 text-sm text-gray-700">
              It's time for **{reminder.member}** to take:
            </p>
            <p className="text-md font-bold text-indigo-600">
              {reminder.medicineName} ({reminder.dosage} Tablet)
            </p>

            {/* Actions */}
            <div className="mt-4 flex space-x-3">
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                onClick={onTakeDose}
              >
                Take Dose
              </button>
              <button
                type="button"
                className="text-sm font-medium text-gray-700 hover:text-gray-500"
                onClick={onRemindLater}
              >
                Remind after 10m
              </button>
            </div>
          </div>

          {/* Close Button */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Close notification</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// ------------------------------------


export default function DawaDarDashboard() {
  const [reminders, setReminders] = useState<MedicineReminder[]>(initialReminders);
  // ADDED State for the notification pop-up
  const [showNotification, setShowNotification] = useState(false);
  const [notificationReminder, setNotificationReminder] = useState<MedicineReminder | null>(null);

  // --- HANDLER FUNCTIONS ---

  // Refactored handleTakeDose to update state AND manage notification closure
  const handleTakeDose = useCallback(async (reminder: MedicineReminder) => {
    if (reminder.pillsRemaining <= 0) return;

    const newCount = reminder.pillsRemaining - reminder.dosage;
    let newStatus: MedicineReminder['stockStatus'] = 'In Stock';

    if (newCount <= 0) {
      newStatus = 'Empty';
    } else if (newCount <= reminder.lowStockThreshold) {
      newStatus = 'Low';
    }

    await updateStockInSupabase(reminder.id, newCount, newStatus);

    setReminders(prevReminders => prevReminders.map(r =>
      r.id === reminder.id
        ? { ...r, pillsRemaining: newCount > 0 ? newCount : 0, stockStatus: newStatus }
        : r
    ));

    // Close the notification if it was open
    if (showNotification && notificationReminder?.id === reminder.id) {
      setShowNotification(false);
      setNotificationReminder(null);
    }
  }, [showNotification, notificationReminder]);


  const handleRemindLater = useCallback(() => {
    console.log("Reminding in 10 minutes...");
    // Hide the current notification
    setShowNotification(false);
    setNotificationReminder(null);
    // In a real app, you would set a new 10-minute timer here.
  }, []);

  const triggerNotification = useCallback(() => {
    // Find the specific reminder for Aisha - Vitamin D
    const aishaVitaminD = initialReminders.find(r => r.member === 'Aisha' && r.medicineName === 'Vitamin D');
    if (aishaVitaminD) {
      setNotificationReminder(aishaVitaminD);
      setShowNotification(true);
      console.log('Notification triggered for Aisha - Vitamin D');
    }
  }, []);

  // --- useEffect for the 10-second timer ---
  useEffect(() => {
    // Set a timeout to trigger the notification after 10 seconds (10000 ms)
    const timer = setTimeout(() => {
      triggerNotification();
    }, 10000); // 10 seconds

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [triggerNotification]);


  // Helper for schedule item styling (updated to use the local handleTakeDose)
  const getScheduleItemClasses = (reminder: MedicineReminder) => {
    const [timeStr] = reminder.schedule.split(' ');
    const [hour] = timeStr.split(':').map(Number);
    const isTaken = hour < 12; // MOCK: Assume all morning doses are "taken"

    if (isTaken) {
      return {
        li: "flex items-center justify-between p-3 bg-green-50 rounded-lg",
        status: <span className="text-sm font-medium text-green-700">Taken</span>
      };
    }

    // Default to upcoming with a button
    return {
      li: "flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-indigo-500",
      status: (
        <button
          // Updated onClick to use the local handleTakeDose
          onClick={(e) => { e.preventDefault(); handleTakeDose(reminder); }}
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
        >
          Mark as Taken
        </button>
      )
    };
  };

  // --- Dashboard Logic ---
  const scheduleGroups = getScheduleGroups(reminders);

  // Dashboard Stats
  const totalRefillsNeeded = reminders.filter(r => r.stockStatus === 'Low' || r.stockStatus === 'Empty').length;
  // Adjusted nextDose to find a dose that hasn't been "taken" in the mock logic
  const nextDose = reminders.find(r => r.schedule.includes('PM')) || reminders[0];
  const dosesMissed = 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* The actual NavBar element is rendered in app/layout.tsx */}

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold leading-tight text-gray-900">Welcome Back!</h2>
          <p className="mt-1 text-md text-gray-600">Here's what's happening in your household today.</p>
        </header>

        {/* At a Glance Section (from HTML) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* Card 1: Next Dose (Dynamic) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Next Dose</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">{nextDose.schedule}</p>
            <p className="text-sm text-gray-500">{nextDose.member} - {nextDose.medicineName}</p>
          </div>

          {/* Card 2: Refills Needed (Dynamic) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Refills Needed</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-500">{totalRefillsNeeded}</p>
            <p className="text-sm text-gray-500">
              {reminders
                .filter(r => r.stockStatus === 'Low' || r.stockStatus === 'Empty')
                .slice(0, 2)
                .map(r => r.medicineName)
                .join(' & ')}
              {totalRefillsNeeded > 2 ? ` and ${totalRefillsNeeded - 2} more` : ''}
            </p>
          </div>

          {/* Card 3: Doses Missed (Dynamic) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Doses Missed Today</h3>
            <p className="mt-2 text-3xl font-bold text-red-500">{dosesMissed}</p>
            <p className="text-sm text-gray-500">{dosesMissed === 0 ? 'Great job staying on track!' : 'Review the schedule now.'}</p>
          </div>
        </div>

        {/* Daily Medication Schedule (Dynamic) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-6">
            {Object.entries(scheduleGroups).map(([timeSlot, remindersList]) => (
              <div key={timeSlot}>
                <h4 className="font-medium text-gray-500 mb-2">{timeSlot}</h4>
                <ul className="space-y-3">
                  {remindersList.map(reminder => {
                    const { li, status } = getScheduleItemClasses(reminder);
                    return (
                      <li key={reminder.id} className={li}>
                        <div>
                          <p className="font-semibold text-gray-800">{reminder.member} - {reminder.medicineName}</p>
                          <p className="text-sm text-gray-600">{reminder.schedule} - {reminder.dosage} {reminder.dosage > 1 ? 'Tablets' : 'Tablet'}</p>
                        </div>
                        {status}
                      </li>
                    );
                  })}
                  {remindersList.length === 0 && (
                    <li className="p-3 text-gray-500 text-sm italic">No doses scheduled for {timeSlot}.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- NOTIFICATION POPUP RENDERING --- */}
      {showNotification && notificationReminder && (
        <NotificationPopup
          reminder={notificationReminder}
          onTakeDose={() => handleTakeDose(notificationReminder)}
          onRemindLater={handleRemindLater}
          onClose={() => setShowNotification(false)}
        />
      )}
      {/* ------------------------------------ */}
    </div>
  );
}