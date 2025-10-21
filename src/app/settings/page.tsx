'use client';

import { useState } from 'react';
import { Bell, User, Sun, Moon, Database, ChevronRight, Volume2, Clock, Mail, Shield, Download } from 'lucide-react';

// --- MAIN COMPONENT ---
export default function SettingsPage() {
    // Mock States for Settings
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] = useState(true);
    const [reminderSound, setReminderSound] = useState('Chime');
    const [snoozeDuration, setSnoozeDuration] = useState(10);

    // Apply dark mode (mocking a global theme switch)
    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
        // In a real app, this would update a context or store
        console.log(`Theme set to: ${!isDarkMode ? 'Dark' : 'Light'}`);
    };

    const handleSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setReminderSound(e.target.value);
        console.log(`Reminder sound set to: ${e.target.value}`);
    };

    const handleSnoozeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSnoozeDuration(Number(e.target.value));
        console.log(`Snooze duration set to: ${e.target.value} minutes`);
    };

    // Helper component for setting rows
    const SettingItem: React.FC<{ icon: React.ReactNode, title: string, description?: string, action: React.ReactNode, isLink?: boolean, onClick?: () => void }> = ({ icon, title, description, action, isLink = false, onClick }) => (
        <div
            className={`flex items-center justify-between p-4 border-b last:border-b-0 ${isLink ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <div className="text-indigo-500 mr-4">
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
                    {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
                </div>
            </div>
            {action}
        </div>
    );

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-8 border-b pb-2">
                    ⚙️ Application Settings
                </h1>

                {/* --- Section: General Preferences --- */}
                <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl mb-8 overflow-hidden">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 p-4 bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                        General Preferences
                    </h2>

                    {/* Theme Toggle */}
                    <SettingItem
                        icon={isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        title="Dark Mode"
                        description="Switch between light and dark themes."
                        action={
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isDarkMode} onChange={handleThemeToggle} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        }
                    />

                    {/* Link to Family Cabinet (Profile Page) */}
                    <SettingItem
                        icon={<User size={20} />}
                        title="Family Cabinet"
                        description="View and manage family members, ages, and chronic conditions."
                        isLink={true}
                        onClick={() => window.location.href = '/profile'} // Mock navigation
                        action={<ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />}
                    />
                </section>

                {/* --- Section: Notification Settings --- */}
                <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl mb-8 overflow-hidden">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 p-4 bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                        Reminder & Notification Settings
                    </h2>

                    {/* Reminder Sound */}
                    <SettingItem
                        icon={<Volume2 size={20} />}
                        title="Reminder Sound"
                        description="Choose the alert sound for medication reminders."
                        action={
                            <select
                                value={reminderSound}
                                onChange={handleSoundChange}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            >
                                <option value="Chime">Chime</option>
                                <option value="Bell">Bell</option>
                                <option value="Soft">Soft Tone</option>
                            </select>
                        }
                    />

                    {/* Snooze Duration */}
                    <SettingItem
                        icon={<Clock size={20} />}
                        title="Snooze Duration"
                        description="Set the time (in minutes) before a snoozed reminder reappears."
                        action={
                            <select
                                value={snoozeDuration}
                                onChange={handleSnoozeChange}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            >
                                <option value={5}>5 min</option>
                                <option value={10}>10 min</option>
                                <option value={15}>15 min</option>
                            </select>
                        }
                    />

                    {/* Email Notifications Toggle */}
                    <SettingItem
                        icon={<Mail size={20} />}
                        title="Low Stock Alerts via Email"
                        description="Receive email alerts when a medication is running low."
                        action={
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isEmailNotificationsEnabled} onChange={() => setIsEmailNotificationsEnabled(!isEmailNotificationsEnabled)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        }
                    />
                </section>

                {/* --- Section: Data and Privacy --- */}
                <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 p-4 bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                        Data Management & Privacy
                    </h2>

                    {/* Data Export */}
                    <SettingItem
                        icon={<Download size={20} />}
                        title="Export Medication Data"
                        description="Download a CSV of all tracked medications and history."
                        isLink={true}
                        onClick={() => console.log('Export data initiated.')}
                        action={<ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />}
                    />

                    {/* Privacy Policy */}
                    <SettingItem
                        icon={<Shield size={20} />}
                        title="Privacy Policy"
                        description="Review how your health data is stored and used."
                        isLink={true}
                        onClick={() => console.log('Navigating to Privacy Policy.')}
                        action={<ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />}
                    />

                    {/* Database Status (Placeholder for future Firestore integration) */}
                    <SettingItem
                        icon={<Database size={20} />}
                        title="Database Status"
                        description="Connection: Stable (Mock)"
                        action={<span className="text-green-500 font-semibold text-sm">Online</span>}
                    />
                </section>

            </div>
        </div>
    );
}
