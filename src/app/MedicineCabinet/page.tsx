'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusCircle, X, Trash2, Calendar, Pill } from 'lucide-react';

// --- TYPE DEFINITIONS ---

// ADDED: Enum for Expiration Rule
type ExpirationRule = 'BOX_DATE' | 'TWO_WEEKS' | 'THREE_MONTHS' | 'SIX_MONTHS';

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    expiryDate: string; // The date on the box (YYYY-MM-DD)
    openingDate: string | null; // The date the medicine was opened (YYYY-MM-DD)
    rule: ExpirationRule; // The rule for determining effective expiration
}

interface ExpirationStatus {
    daysLeft: number | null;
    isExpired: boolean;
    effectiveExpiryDate: string | null; // The actual date used for calculation
}

// --- Utility Functions ---

/**
 * Converts a string date into a display string.
 * @param {string} dateString 
 * @returns {string} Formatted date string.
 */
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

/**
 * Calculates the number of days until expiration based on a rule (opening date vs. box date).
 * @param {string} boxDate 
 * @param {string | null} openingDate 
 * @param {ExpirationRule} rule
 * @returns {ExpirationStatus}
 */
const getExpirationStatus = (boxDate: string, openingDate: string | null, rule: ExpirationRule): ExpirationStatus => {
    let effectiveExpiry = new Date(boxDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Determine the effective expiration date based on the rule
    if (openingDate && rule !== 'BOX_DATE') {
        const opened = new Date(openingDate);
        opened.setHours(0, 0, 0, 0);

        let calculatedExpiry = new Date(opened);

        switch (rule) {
            case 'TWO_WEEKS':
                calculatedExpiry.setDate(opened.getDate() + 14);
                break;
            case 'THREE_MONTHS':
                calculatedExpiry.setMonth(opened.getMonth() + 3);
                break;
            case 'SIX_MONTHS':
                calculatedExpiry.setMonth(opened.getMonth() + 6);
                break;
        }

        // The effective expiry is the EARLIER of the box date and the calculated date
        if (calculatedExpiry.getTime() < effectiveExpiry.getTime()) {
            effectiveExpiry = calculatedExpiry;
        }
    }

    effectiveExpiry.setHours(0, 0, 0, 0); // Reset time for calculation

    const diffTime = effectiveExpiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        daysLeft,
        isExpired: daysLeft < 0,
        effectiveExpiryDate: effectiveExpiry.toISOString().split('T')[0] // Return as YYYY-MM-DD string
    };
};

// --- Mock Data (UPDATED) ---

const MOCK_MEDICINES: Medicine[] = [
    {
        id: 'mock-1',
        name: 'Ibuprofen (Pills)',
        dosage: '200mg (45 pills)',
        expiryDate: '2026-10-25',
        openingDate: null,
        rule: 'BOX_DATE' // Pills usually use the box date
    },
    {
        id: 'mock-2',
        name: 'Amoxicillin (Liquid)',
        dosage: '500mg (5 tablets)',
        expiryDate: '2025-06-01',
        openingDate: '2025-01-15', // Opened long ago
        rule: 'TWO_WEEKS' // Liquid form, short shelf life after opening
    },
    {
        id: 'mock-3',
        name: 'Eye Drops',
        dosage: '10ml',
        expiryDate: '2026-03-01',
        openingDate: '2025-09-01', // Opened recently, rule is 3 months
        rule: 'THREE_MONTHS'
    },
];

// --- Components ---

interface AddMedicineFormProps {
    onAddMedicine: (newMedicine: Medicine) => void;
    onCancel: () => void;
}

/**
 * Form to add a new medicine entry (UPDATED: Black text and placeholders added).
 */
const AddMedicineForm: React.FC<AddMedicineFormProps> = ({ onAddMedicine, onCancel }) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [openingDate, setOpeningDate] = useState('');
    const [rule, setRule] = useState<ExpirationRule>('BOX_DATE');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !dosage || !expiryDate) {
            setError('Please fill out Name, Dosage, and Box Expiration Date.');
            return;
        }

        // Validate if opening date is required by the rule but missing
        if (rule !== 'BOX_DATE' && !openingDate) {
            setError('Please enter an Opening Date for this medicine type.');
            return;
        }

        setSubmitting(true);
        try {
            const newMedicine: Medicine = {
                id: crypto.randomUUID(),
                name: name.trim(),
                dosage: dosage.trim(),
                expiryDate: expiryDate,
                openingDate: openingDate || null, // Store null if not set
                rule: rule,
            };

            onAddMedicine(newMedicine);

            // Simulate network delay and reset
            await new Promise(resolve => setTimeout(resolve, 500));
            setName('');
            setDosage('');
            setExpiryDate('');
            setOpeningDate('');
            setRule('BOX_DATE');
            onCancel();

        } catch (err) {
            console.error("Error adding medicine (mock): ", err);
            setError('Failed to save medicine.');
        } finally {
            setSubmitting(false);
        }
    };

    const ruleOptions: { value: ExpirationRule, label: string }[] = [
        { value: 'BOX_DATE', label: 'Use Box Expiry Date (e.g., unopened tablets)' },
        { value: 'TWO_WEEKS', label: '2 Weeks After Opening (e.g., some eye drops)' },
        { value: 'THREE_MONTHS', label: '3 Months After Opening (e.g., liquids, creams)' },
        { value: 'SIX_MONTHS', label: '6 Months After Opening' },
    ];

    return (
        <div className="p-6 bg-white shadow-xl rounded-xl max-w-lg mx-auto mt-8 border border-indigo-100">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-indigo-700">Add New Medicine</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition duration-150"
                    aria-label="Cancel addition"
                >
                    <X size={24} />
                </button>
            </div>

            {error && <p className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Medicine Name (Updated placeholder and text color) */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Medicine Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" // text-gray-900 added
                        placeholder="e.g., Ibuprofen, Antacid" // Placeholder added/updated
                        required
                    />
                </div>

                {/* Dosage / Quantity (Updated placeholder and text color) */}
                <div>
                    <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Dosage / Quantity</label>
                    <input
                        id="dosage"
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" // text-gray-900 added
                        placeholder="e.g., 200mg (30 pills left)" // Placeholder added/updated
                        required
                    />
                </div>

                {/* Expiration Rule Selector (Text color updated) */}
                <div>
                    <label htmlFor="rule" className="block text-sm font-medium text-gray-700">Expiration Rule (Post-Opening)</label>
                    <select
                        id="rule"
                        value={rule}
                        onChange={(e) => setRule(e.target.value as ExpirationRule)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" // text-gray-900 added
                        required
                    >
                        {ruleOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Expiration Date (Box) (Updated placeholder and text color) */}
                <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Box Expiration Date</label>
                    <input
                        id="expiryDate"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" // text-gray-900 added
                        placeholder="YYYY-MM-DD" // Placeholder added
                        required
                    />
                </div>

                {/* Opening Date (Conditional/Optional) (Updated placeholder and text color) */}
                <div className={rule === 'BOX_DATE' ? 'opacity-50' : ''}>
                    <label htmlFor="openingDate" className="block text-sm font-medium text-gray-700">
                        Opening Date <span className="text-gray-500 font-normal">({rule === 'BOX_DATE' ? 'Optional' : 'Required'})</span>
                    </label>
                    <input
                        id="openingDate"
                        type="date"
                        value={openingDate}
                        onChange={(e) => setOpeningDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" // text-gray-900 added
                        placeholder="YYYY-MM-DD" // Placeholder added
                        disabled={rule === 'BOX_DATE'}
                    />
                </div>


                <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150'}`}
                >
                    {submitting ? 'Saving...' : 'Save Medicine'}
                </button>
            </form>
        </div>
    );
};

// -----------------------------------------------------
// --- MEDICINE CARD (UPDATED) ---
// -----------------------------------------------------

interface MedicineCardProps {
    medicine: Medicine;
    onDeleteMedicine: (id: string) => void;
}

/**
 * Displays a single medicine item with effective expiration details.
 */
const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onDeleteMedicine }) => {
    // UPDATED: Pass rule and openingDate to getExpirationStatus
    const { daysLeft, isExpired, effectiveExpiryDate } = getExpirationStatus(
        medicine.expiryDate,
        medicine.openingDate,
        medicine.rule
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            onDeleteMedicine(medicine.id);
        } catch (error) {
            console.error("Error removing document (mock): ", error);
        } finally {
            setIsDeleting(false);
        }
    }, [medicine.id, onDeleteMedicine]);

    const statusClasses = useMemo(() => {
        if (isExpired) {
            return 'bg-red-100 text-red-800 border-red-300';
        }
        if (daysLeft !== null && daysLeft <= 90) { // Highlight medicines expiring in 3 months
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
        return 'bg-green-100 text-green-800 border-green-300';
    }, [isExpired, daysLeft]);

    const statusText = useMemo(() => {
        if (isExpired) return 'Expired!';
        if (daysLeft !== null && daysLeft > 0) return `Expires in ${daysLeft} days`;
        if (daysLeft === 0) return 'Expires Today!';
        return 'No Effective Date Set';
    }, [isExpired, daysLeft]);

    const getRuleLabel = (rule: ExpirationRule) => {
        switch (rule) {
            case 'BOX_DATE': return 'Box Date Only';
            case 'TWO_WEEKS': return '2 Weeks from Opening';
            case 'THREE_MONTHS': return '3 Months from Opening';
            case 'SIX_MONTHS': return '6 Months from Opening';
        }
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between border-t-4 border-indigo-500">

            {/* 1. Name & Dosage */}
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-1">
                    <Pill size={20} className="mr-2 text-indigo-500" />
                    {medicine.name}
                </h3>

                {/* Enhanced Detail Display with Grid */}
                <div className="grid grid-cols-2 gap-y-2 mt-3 text-sm">
                    {/* Dosage */}
                    <div className="col-span-1">
                        <p className="font-semibold text-gray-600">Quantity</p>
                        <p className="text-gray-800">{medicine.dosage}</p>
                    </div>
                    {/* Expiry Rule */}
                    <div className="col-span-1">
                        <p className="font-semibold text-gray-600">Rule</p>
                        <p className="text-gray-800 font-medium">{getRuleLabel(medicine.rule)}</p>
                    </div>

                    {/* Opening Date */}
                    {medicine.openingDate && (
                        <div className="col-span-1">
                            <p className="font-semibold text-gray-600">Opened</p>
                            <p className="text-gray-800">{formatDate(medicine.openingDate)}</p>
                        </div>
                    )}

                    {/* Box Expiration Date */}
                    <div className={`col-span-1 ${medicine.openingDate ? 'text-xs' : ''}`}>
                        <p className="font-semibold text-gray-600">Box Date</p>
                        <p className={`text-gray-800 ${medicine.openingDate && medicine.rule !== 'BOX_DATE' ? 'line-through text-gray-400' : ''}`}>
                            {formatDate(medicine.expiryDate)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Effective Expiration Status Tag */}
            <div className="mb-4 p-2 rounded-lg border-2 border-dashed border-indigo-200">
                <p className="text-xs font-bold text-indigo-700 mb-1">EFFECTIVE EXPIRATION</p>
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold tracking-wider px-2 py-0.5 rounded ${statusClasses}`}>
                        {statusText}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 flex items-center">
                        <Calendar size={14} className="mr-1 text-indigo-500" />
                        {formatDate(effectiveExpiryDate)}
                    </span>
                </div>
            </div>

            {/* 3. Delete Button */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full mt-auto flex items-center justify-center text-sm px-3 py-1.5 border border-red-300 rounded-md text-red-600 bg-white hover:bg-red-50 transition duration-150 disabled:opacity-50"
            >
                {isDeleting ? 'Deleting...' : (
                    <>
                        <Trash2 size={16} className="mr-1" /> Dispose Item
                    </>
                )}
            </button>
        </div>
    );
};


/**
 * Main application component. Manages state locally for the mock version.
 */
const App: React.FC = () => {
    const [medicines, setMedicines] = useState<Medicine[]>(() => {
        // Initialize state from mock data
        return MOCK_MEDICINES;
    });

    const [isAdding, setIsAdding] = useState(false);

    // Mock user ID for display purposes
    const mockUserId = 'MOCK-SESSION-123456';

    // Function to add a medicine to local state
    const handleAddMedicine = useCallback((newMedicine: Medicine) => {
        setMedicines(prev => {
            const updatedMedicines = [...prev, newMedicine];

            // Sort by effective expiration date (ascending)
            updatedMedicines.sort((a, b) => {
                const statusA = getExpirationStatus(a.expiryDate, a.openingDate, a.rule);
                const statusB = getExpirationStatus(b.expiryDate, b.openingDate, b.rule);

                const dateA = new Date(statusA.effectiveExpiryDate || '9999-12-31');
                const dateB = new Date(statusB.effectiveExpiryDate || '9999-12-31');

                return dateA.getTime() - dateB.getTime();
            });
            return updatedMedicines;
        });
    }, []);

    // Function to delete a medicine from local state
    const handleDeleteMedicine = useCallback((idToDelete: string) => {
        setMedicines(prev => prev.filter(m => m.id !== idToDelete));
    }, []);

    // Derived state for sorting and filtering
    const nonExpiredMedicines = useMemo(() => medicines.filter(m => !getExpirationStatus(m.expiryDate, m.openingDate, m.rule).isExpired), [medicines]);
    const expiredMedicines = useMemo(() => medicines.filter(m => getExpirationStatus(m.expiryDate, m.openingDate, m.rule).isExpired), [medicines]);

    // --- Render Logic ---

    if (isAdding) {
        return (
            <div className="p-4 sm:p-8 min-h-screen bg-gray-50 font-sans">
                <div className="max-w-4xl mx-auto">
                    <AddMedicineForm
                        onAddMedicine={handleAddMedicine}
                        onCancel={() => setIsAdding(false)}
                    />
                </div>
            </div>
        );
    }

    // Main Medicine Cabinet View
    return (
        <div className="p-4 sm:p-8 min-h-screen bg-gray-50 font-sans">
            <div className="max-w-4xl mx-auto">

                <header className="mb-8 p-6 bg-white rounded-xl shadow-lg border-b-4 border-indigo-600">
                    <h1 className="text-3xl font-extrabold text-indigo-700">Digital Medicine Cabinet (MOCK)</h1>
                    <p className="text-gray-500 mt-1">
                        Tracking {medicines.length} items. **Effective expiration dates** are calculated based on opening date.
                    </p>
                </header>

                {/* Add New Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Add New Medicine
                    </button>
                </div>

                <>
                    {/* Active Medicines Section */}
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 border-l-4 border-green-500 pl-2">
                        Active Inventory ({nonExpiredMedicines.length})
                    </h2>
                    {nonExpiredMedicines.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {nonExpiredMedicines.map((m) => (
                                <MedicineCard key={m.id} medicine={m} onDeleteMedicine={handleDeleteMedicine} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 mb-12 text-center bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300">
                            <p className="text-gray-500">Your cabinet is empty! Click 'Add New Medicine' to get started.</p>
                        </div>
                    )}

                    {/* Expired Medicines Section */}
                    {expiredMedicines.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-700 mb-4 border-l-4 border-red-500 pl-2 mt-8">
                                Expired Items ({expiredMedicines.length})
                            </h2>
                            <p className="text-sm text-gray-500 mb-4 ml-2">These items have passed their effective expiration date (box date or post-opening).</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {expiredMedicines.map((m) => (
                                    <MedicineCard key={m.id} medicine={m} onDeleteMedicine={handleDeleteMedicine} />
                                ))}
                            </div>
                        </>
                    )}
                </>
            </div>
        </div>
    );
};

export default App;
