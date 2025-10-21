'use client';

import { useState } from 'react';

// --- TYPE DEFINITION ---
interface MedicineReminder {
    id: string;
    medicineName: string;
    pillsRemaining: number;
    dosage: number; // e.g., 1 (for 1 pill per dose)
    lowStockThreshold: number; // e.g., 7
    schedule: string; // e.g., "8:00 AM"
    stockStatus: 'In Stock' | 'Low' | 'Empty'; // <-- Required property
    member: string; // Family member associated with the medicine
}
// -----------------------

// --- MOCK DATA AND LOGIC ---
// FIX: Explicitly added 'stockStatus' to r3 to resolve TS2741.
const initialReminders: MedicineReminder[] = [
    { id: 'r1', medicineName: 'Blood Pressure Med', pillsRemaining: 15, dosage: 1, lowStockThreshold: 7, schedule: '7:00 AM', stockStatus: 'Low', member: 'Grandpa Ahmed' },
    { id: 'r2', medicineName: 'Daily Vitamin', pillsRemaining: 90, dosage: 1, lowStockThreshold: 14, schedule: '8:00 AM', stockStatus: 'In Stock', member: 'Aisha' },
    // CORRECTED ENTRY: schedule changed from 'Empty' to '12:00 PM', and stockStatus: 'Low' added (since 2 <= 5)
    { id: 'r3', medicineName: 'Antibiotic X', pillsRemaining: 2, dosage: 1, lowStockThreshold: 5, schedule: '12:00 PM', stockStatus: 'Low', member: 'Omar (Son)' },
];

// Placeholder for updating stock in Supabase
const updateStockInSupabase = async (reminderId: string, newCount: number, newStatus: string) => {
    // 🛑 REPLACE THIS WITH YOUR ACTUAL SUPABASE CLIENT UPDATE CALL
    console.log(`[SUPABASE MOCK] Updating Reminder ${reminderId}: Count to ${newCount}, Status to ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 50));
};

// Helper for stock status calculation
const calculateNewStatus = (count: number, threshold: number): MedicineReminder['stockStatus'] => {
    if (count <= 0) return 'Empty';
    if (count <= threshold) return 'Low';
    return 'In Stock';
};

// Core Stock Control Logic (Take Dose)
const handleTakeDose = async (
    reminder: MedicineReminder,
    setReminders: React.Dispatch<React.SetStateAction<MedicineReminder[]>>,
    setToastMessage: (msg: string) => void,
    setShowToast: (show: boolean) => void
) => {
    if (reminder.pillsRemaining <= 0) return;

    const newCount = reminder.pillsRemaining - reminder.dosage;
    const newStatus = calculateNewStatus(newCount, reminder.lowStockThreshold);

    await updateStockInSupabase(reminder.id, newCount, newStatus);

    setReminders(prevReminders => prevReminders.map(r =>
        r.id === reminder.id
            ? { ...r, pillsRemaining: newCount > 0 ? newCount : 0, stockStatus: newStatus }
            : r
    ));

    if (newStatus === 'Low' || newStatus === 'Empty') {
        const statusText = newStatus === 'Low' ? 'LOW STOCK' : 'EMPTY STOCK';
        const msg = `⚠️ ${reminder.member}'s ${reminder.medicineName} is now ${statusText}! Only ${newCount > 0 ? newCount : '0'} doses remaining. Time to restock!`;
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    }
};

// Core Stock Control Logic (Restock - NEW FUNCTIONALITY)
const handleRestock = async (
    reminder: MedicineReminder,
    amount: number,
    setReminders: React.Dispatch<React.SetStateAction<MedicineReminder[]>>,
    setToastMessage: (msg: string) => void,
    setShowToast: (show: boolean) => void
) => {
    if (amount <= 0) return;

    const newCount = reminder.pillsRemaining + amount;
    const newStatus = calculateNewStatus(newCount, reminder.lowStockThreshold);

    await updateStockInSupabase(reminder.id, newCount, newStatus);

    setReminders(prevReminders => prevReminders.map(r =>
        r.id === reminder.id
            ? { ...r, pillsRemaining: newCount, stockStatus: newStatus }
            : r
    ));

    // Success Toast
    setToastMessage(`🎉 Restocked ${amount} pills of ${reminder.medicineName}. Total remaining: ${newCount}.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
};

// Helper for status styling - Made defensively robust
const getStatusColor = (status: MedicineReminder['stockStatus'] | undefined) => {
    // If status is undefined/null, default to 'In Stock'
    const s = status || 'In Stock';

    switch (s) {
        case 'Low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Empty': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-green-100 text-green-800 border-green-300';
    }
};

// --- TOAST NOTIFICATION COMPONENT ---
const ToastNotification = ({ message, show, onClose }: { message: string, show: boolean, onClose: () => void }) => {
    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-sm w-full text-white p-4 rounded-lg shadow-2xl transition-all duration-500 z-50 
            ${message.startsWith('⚠️') ? 'bg-red-600' : 'bg-green-600'}
            ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            role="alert"
        >
            <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{message}</p>
                <button onClick={onClose} className="text-white hover:text-opacity-80 ml-4 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// --- RESTOCK MODAL COMPONENT (Inline) ---
const RestockModal = ({
    reminder,
    onClose,
    onRestock
}: {
    reminder: MedicineReminder | null,
    onClose: () => void,
    onRestock: (amount: number) => void
}) => {
    const [restockAmount, setRestockAmount] = useState(30);

    if (!reminder) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRestock(restockAmount);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-40 transition-opacity duration-300">
            <div className="bg-white p-8 rounded-xl shadow-3xl max-w-sm w-full transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold text-indigo-700 mb-2">Restock {reminder.medicineName}</h3>
                <p className="text-gray-600 mb-6">
                    How many pills did you add to the current supply for **{reminder.member}**?
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="restockInput" className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Added
                    </label>
                    <input
                        id="restockInput"
                        type="number"
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                        min="1"
                        required
                        className="w-full p-3 border-2 border-green-400 rounded-lg bg-green-50 text-gray-900 text-lg font-semibold mb-6 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                        >
                            Confirm Restock
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
export default function RemindersPage() {
    const [reminders, setReminders] = useState<MedicineReminder[]>(initialReminders);

    // State for Toast Notification
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // State for Restock Modal
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [currentRestockReminder, setCurrentRestockReminder] = useState<MedicineReminder | null>(null);

    // Form fields state
    const [newMedicine, setNewMedicine] = useState('');
    const [newSchedule, setNewSchedule] = useState('');
    const [newMember, setNewMember] = useState('');
    const [newInitialCount, setNewInitialCount] = useState<number>(30);
    const [newDosage, setNewDosage] = useState<number>(1);
    const [newThreshold, setNewThreshold] = useState<number>(7);

    // Function to handle the final restock action from the modal
    const handleFinalRestock = (amount: number) => {
        if (currentRestockReminder) {
            handleRestock(currentRestockReminder, amount, setReminders, setToastMessage, setShowToast);
        }
        // Reset and close modal
        setCurrentRestockReminder(null);
        setShowRestockModal(false);
    };

    const handleAddReminder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMedicine && newSchedule && newMember && newInitialCount > 0 && newDosage > 0 && newThreshold > 0) {
            const newReminder: MedicineReminder = {
                id: String(Date.now()),
                medicineName: newMedicine,
                pillsRemaining: newInitialCount,
                dosage: newDosage,
                lowStockThreshold: newThreshold,
                schedule: newSchedule,
                member: newMember,
                stockStatus: calculateNewStatus(newInitialCount, newThreshold),
            };

            setReminders([...reminders, newReminder]);

            // Clear form fields
            setNewMedicine('');
            setNewSchedule('');
            setNewMember('');
            setNewInitialCount(30);
            setNewDosage(1);
            setNewThreshold(7);

            if (newReminder.stockStatus !== 'In Stock') {
                const statusText = newReminder.stockStatus === 'Low' ? 'LOW STOCK' : 'EMPTY STOCK';
                const msg = `⚠️ ${newReminder.member}'s ${newMedicine} was added with ${statusText}. Time to restock!`;
                setToastMessage(msg);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            }
        } else {
            console.error("Please fill out all required fields correctly.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 border-b pb-2">
                    💊 Family Medication Manager
                </h1>
                <p className="text-gray-600 mb-6">
                    View and configure all medication reminders, schedules, and stock levels for every household member.
                </p>

                {/* Reminder List - Management View */}
                <div className="space-y-4 mb-10">
                    <h2 className="text-2xl font-bold text-gray-800">Current Tracked Medications</h2>
                    {reminders.map((reminder) => (
                        <div key={reminder.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition duration-200">

                            {/* Reminder Details */}
                            <div className="mb-3 sm:mb-0 min-w-[40%]">
                                <p className="text-lg font-bold text-gray-800">{reminder.medicineName}</p>
                                <p className="text-sm text-indigo-600 font-medium">{reminder.member}</p>
                                <p className="text-sm text-gray-600">
                                    Schedule: {reminder.schedule} | Dose: {reminder.dosage} pill(s)
                                </p>
                            </div>

                            {/* Stock and Action */}
                            <div className="flex flex-col md:flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                {/* Stock Display */}
                                <div className="text-center sm:text-right min-w-[100px]">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(reminder.stockStatus)}`}>
                                        {/* Includes defensive check for runtime errors */}
                                        {reminder.stockStatus ? reminder.stockStatus.toUpperCase() : 'STATUS UNKNOWN'}
                                    </span>
                                    <p className="text-sm text-gray-700 mt-1">
                                        Remaining: <span className="font-bold text-base">{reminder.pillsRemaining}</span>
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        // Open Restock Modal
                                        onClick={() => {
                                            setCurrentRestockReminder(reminder);
                                            setShowRestockModal(true);
                                        }}
                                        className="w-1/2 sm:w-auto bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-green-600 transition-colors"
                                    >
                                        Restock
                                    </button>
                                    <button
                                        // Take Dose Button
                                        onClick={() => handleTakeDose(reminder, setReminders, setToastMessage, setShowToast)}
                                        disabled={reminder.pillsRemaining <= 0}
                                        className="w-1/2 sm:w-auto bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                                    >
                                        Take Dose
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {reminders.length === 0 && (
                        <p className="text-center text-gray-500 italic p-6 bg-white rounded-lg shadow-inner">
                            No medications are currently being tracked. Use the form below to add the first one!
                        </p>
                    )}
                </div>

                {/* Add New Reminder Form */}
                <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-green-600">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Add New Medication</h2>
                    <p className="text-gray-600 mb-6">Define the details for a new medicine to start tracking stock and reminders.</p>

                    <form onSubmit={handleAddReminder} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Row 1: Medicine Name & Member */}
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="medicineName" className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                            <input
                                id="medicineName"
                                type="text"
                                placeholder="e.g., Amoxicillin, Daily Vitamin"
                                value={newMedicine}
                                onChange={(e) => setNewMedicine(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="col-span-1">
                            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">Family Member</label>
                            <input
                                id="member"
                                type="text"
                                placeholder="e.g., Aisha, Grandpa Ahmed"
                                value={newMember}
                                onChange={(e) => setNewMember(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Row 2: Dosage, Schedule, Initial Count */}
                        <div>
                            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">Dose Amount (Pills)</label>
                            <input
                                id="dosage"
                                type="number"
                                placeholder="e.g., 1 (Pill per dose)"
                                value={newDosage}
                                onChange={(e) => setNewDosage(parseInt(e.target.value) || 1)}
                                required
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">Schedule / Frequency</label>
                            <input
                                id="schedule"
                                type="text"
                                placeholder="e.g., 8:00 AM, Before Bed"
                                value={newSchedule}
                                onChange={(e) => setNewSchedule(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="initialCount" className="block text-sm font-medium text-gray-700 mb-1">Pills in Bottle/Pack</label>
                            <input
                                id="initialCount"
                                type="number"
                                placeholder="Total number of pills in stock"
                                value={newInitialCount}
                                onChange={(e) => setNewInitialCount(parseInt(e.target.value) || 30)}
                                required
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">The current total you have on hand.</p>
                        </div>

                        {/* Row 3: Low Stock Threshold & Submit */}
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="lowThreshold" className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold (Pills)</label>
                            <input
                                id="lowThreshold"
                                type="number"
                                placeholder="Alert me when stock drops below this number"
                                value={newThreshold}
                                onChange={(e) => setNewThreshold(parseInt(e.target.value) || 7)}
                                required
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">e.g., Set to 7 to be alerted when you only have a week's supply left.</p>
                        </div>

                        <button
                            type="submit"
                            className="col-span-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg self-end"
                        >
                            Add Reminder
                        </button>
                    </form>
                </div>
            </div>

            {/* RENDER RESTOCK MODAL */}
            <RestockModal
                reminder={currentRestockReminder}
                onClose={() => {
                    setCurrentRestockReminder(null);
                    setShowRestockModal(false);
                }}
                onRestock={handleFinalRestock}
            />

            {/* RENDER TOAST NOTIFICATION */}
            <ToastNotification
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}
