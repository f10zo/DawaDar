'use client';

import { useState } from 'react';
import { User, Plus, Stethoscope, Clock, X, Heart, Pill, Ban } from 'lucide-react'; // Added Ban icon for allergies

// --- TYPE DEFINITION ---
interface MemberMedication {
    id: string;
    name: string; // e.g., "Lisinopril"
    dosage: string; // e.g., "5mg" or "2 puffs"
    schedule: string; // e.g., "7:00 AM", "Twice a day", "As Needed"
}

interface FamilyMember {
    id: string;
    name: string;
    age: number;
    chronicCondition: string; // Simplified, e.g., "Type 2 Diabetes", "Hypertension"
    allergies: string; // ADDED: e.g., "Penicillin, Peanuts"
    medications: MemberMedication[]; // List of medicines taken
}

// --- MOCK DATA (Updated to reflect new structure) ---
const initialMembers: FamilyMember[] = [
    {
        id: 'm1',
        name: 'Grandpa Ahmed',
        age: 72,
        chronicCondition: 'Hypertension',
        allergies: 'None', // ADDED
        medications: [
            { id: 'm1-1', name: 'Lisinopril', dosage: '5mg', schedule: '7:00 AM' },
            { id: 'm1-2', name: 'Aspirin', dosage: '81mg', schedule: '8:00 PM' },
            { id: 'm1-3', name: 'Multivitamin', dosage: '1 tablet', schedule: '9:00 AM' },
        ]
    },
    {
        id: 'm2',
        name: 'Aisha',
        age: 34,
        chronicCondition: 'None',
        allergies: 'Penicillin', // ADDED
        medications: [
            { id: 'm2-1', name: 'Daily Vitamin C', dosage: '1000mg', schedule: 'After Breakfast' },
        ]
    },
    {
        id: 'm3',
        name: 'Omar (Son)',
        age: 12,
        chronicCondition: 'Asthma',
        allergies: 'Peanuts, Pollen', // ADDED
        medications: [
            { id: 'm3-1', name: 'Inhaler (Albuterol)', dosage: '2 puffs', schedule: 'As Needed' },
            { id: 'm3-2', name: 'Cetirizine', dosage: '10mg', schedule: 'Before Bed' },
        ]
    },
];

// --- MAIN COMPONENT ---
export default function FamilyProfilePage() {
    const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form States for Member details
    const [newName, setNewName] = useState('');
    const [newCondition, setNewCondition] = useState('');
    const [newAge, setNewAge] = useState<number | string>('');
    const [newAllergies, setNewAllergies] = useState(''); // ADDED STATE FOR ALLERGIES

    // Form States for initial Medication details (NEW)
    const [newMedicationName, setNewMedicationName] = useState('');
    const [newMedicationDosage, setNewMedicationDosage] = useState('');
    const [newMedicationSchedule, setNewMedicationSchedule] = useState('');

    // 🛑 NOTE: In a real application, you would use the global __app_id and __firebase_config 
    // to initialize Firestore here, and use the user's ID to store and retrieve family member data 
    // in the /artifacts/{appId}/users/{userId}/familyMembers collection.

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            const memberMedications: MemberMedication[] = [];

            // Check if user provided initial medication details
            if (newMedicationName.trim()) {
                memberMedications.push({
                    id: String(Date.now() + 1),
                    name: newMedicationName.trim(),
                    dosage: newMedicationDosage.trim() || 'N/A',
                    schedule: newMedicationSchedule.trim() || 'Unscheduled',
                });
            }

            const newMember: FamilyMember = {
                id: String(Date.now()),
                name: newName.trim(),
                age: Number(newAge) || 0,
                chronicCondition: newCondition.trim() || 'None Specified',
                allergies: newAllergies.trim() || 'None Specified', // ADDED TO NEW MEMBER OBJECT
                medications: memberMedications, // Use the potentially populated array
            };

            // 🛑 In a real app, this is where you'd call a Supabase/Firestore insert function.
            setMembers([...members, newMember]);

            // Reset all states
            setNewName('');
            setNewCondition('');
            setNewAge('');
            setNewAllergies(''); // RESET ALLERGIES STATE
            setNewMedicationName('');
            setNewMedicationDosage('');
            setNewMedicationSchedule('');
            setIsModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header and Add Button */}
                <div className="flex justify-between items-center mb-8 border-b pb-2">
                    <h1 className="text-4xl font-extrabold text-indigo-700">
                        👨‍👩‍👧‍👦 Family Cabinet
                    </h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors"
                    >
                        <Plus size={20} /> Add Member
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    Manage profiles for all family members, their chronic conditions, **allergies**, and review their medication schedules.
                </p>

                {/* Family Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition duration-200">
                            <div className="flex items-center mb-4">
                                <User className="text-blue-500 mr-3" size={28} />
                                <h2 className="text-xl font-bold text-gray-800">{member.name}</h2>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                {/* Display Age */}
                                <p className="flex items-center text-gray-700">
                                    <Heart className="mr-2 text-pink-500" size={16} />
                                    <span className="font-medium">Age:</span> {member.age} years
                                </p>
                                {/* Display Condition */}
                                <p className="flex items-center text-gray-700">
                                    <Stethoscope className="mr-2 text-red-500" size={16} />
                                    <span className="font-medium">Condition:</span> {member.chronicCondition}
                                </p>
                                {/* Display Allergies (NEW) */}
                                <p className="flex items-center text-gray-700">
                                    <Ban className="mr-2 text-orange-500" size={16} />
                                    <span className="font-medium">Allergies:</span> <span className={`${member.allergies.toLowerCase() !== 'none' && member.allergies.toLowerCase() !== 'none specified' ? 'font-semibold text-red-600' : 'text-gray-500'}`}>{member.allergies}</span>
                                </p>

                                <p className="flex items-center text-gray-700 font-bold mt-3">
                                    <Clock className="mr-2 text-amber-500" size={16} />
                                    Active Schedules: {member.medications?.length ?? 0}
                                </p>

                                {/* Medication List */}
                                <div className="pl-4 pt-2 border-l border-gray-200 ml-4">
                                    {(member.medications?.length ?? 0) > 0 ? (
                                        member.medications.map((med) => (
                                            <p key={med.id} className="text-xs text-gray-600 flex justify-between py-0.5">
                                                {/* Displaying name and dosage together */}
                                                <span className="font-medium text-gray-800">{med.name} ({med.dosage})</span>
                                                <span className="text-blue-600 font-semibold">{med.schedule}</span>
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-xs italic text-gray-500">No medications tracked yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Button (Placeholder for deeper dive) */}
                            <button
                                // 🛑 Future integration: Link this button to the Reminders page, filtered by member ID (e.g., /reminders?memberId=m1)
                                onClick={() => console.log(`Managing medications for ${member.name}`)}
                                className="mt-4 w-full bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                            >
                                Manage Medications
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Member Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Add New Family Member</h3>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X size={24} className="text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-4">
                            <h4 className="text-lg font-semibold text-indigo-600 pt-2 border-t mt-4">Basic Details</h4>
                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Jane Doe"
                                    required
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {/* Age Input */}
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age (Years)</label>
                                <input
                                    id="age"
                                    type="number"
                                    value={newAge}
                                    onChange={(e) => setNewAge(e.target.value)}
                                    placeholder="e.g., 30"
                                    min="0"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {/* Condition Input */}
                            <div>
                                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Chronic Condition (Optional)</label>
                                <input
                                    id="condition"
                                    type="text"
                                    value={newCondition}
                                    onChange={(e) => setNewCondition(e.target.value)}
                                    placeholder="e.g., Type 2 Diabetes, None"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {/* Allergies Input (NEW FIELD) */}
                            <div>
                                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies (Optional)</label>
                                <input
                                    id="allergies"
                                    type="text"
                                    value={newAllergies}
                                    onChange={(e) => setNewAllergies(e.target.value)}
                                    placeholder="e.g., Penicillin, Peanuts, None"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* --- Initial Medication Section --- */}
                            <h4 className="text-lg font-semibold text-indigo-600 pt-4 border-t mt-4 flex items-center">
                                <Pill size={20} className="mr-2" /> Initial Medication (Optional)
                            </h4>
                            <p className="text-xs text-gray-500 -mt-2">Add one medication to get started. You can add more later.</p>

                            {/* Medication Name */}
                            <div>
                                <label htmlFor="medName" className="block text-sm font-medium text-gray-700">Medication Name</label>
                                <input
                                    id="medName"
                                    type="text"
                                    value={newMedicationName}
                                    onChange={(e) => setNewMedicationName(e.target.value)}
                                    placeholder="e.g., Amoxicillin"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Dosage */}
                            <div>
                                <label htmlFor="medDosage" className="block text-sm font-medium text-gray-700">Dosage/Strength</label>
                                <input
                                    id="medDosage"
                                    type="text"
                                    value={newMedicationDosage}
                                    onChange={(e) => setNewMedicationDosage(e.target.value)}
                                    placeholder="e.g., 250mg, 1 tablet"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Schedule/Times */}
                            <div>
                                <label htmlFor="medSchedule" className="block text-sm font-medium text-gray-700">Schedule / Times</label>
                                <input
                                    id="medSchedule"
                                    type="text"
                                    value={newMedicationSchedule}
                                    onChange={(e) => setNewMedicationSchedule(e.target.value)}
                                    placeholder="e.g., 8:00 AM & 8:00 PM, As Needed"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md mt-6"
                            >
                                Save Member & Continue
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}