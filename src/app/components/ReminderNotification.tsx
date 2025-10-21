'use client';
import React from 'react';

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

// --- CORNER NOTIFICATION COMPONENT ---
interface NotificationPopupProps {
    reminder: MedicineReminder;
    onTakeDose: () => void;
    onRemindLater: () => void;
    onClose: () => void;
}

// NOTE: This component is designed to be placed in its own file (ReminderNotification.tsx)
export const ReminderNotification: React.FC<NotificationPopupProps> = ({ reminder, onTakeDose, onRemindLater, onClose }) => {
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

export type { MedicineReminder };