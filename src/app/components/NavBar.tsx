'use client';

import Link from 'next/link';
import Image from 'next/image';

const NavBar = () => {
    const navItems = [
        { name: 'Dashboard', href: '/' },
        { name: 'Reminders', href: '/reminders' },
        { name: 'Family Profiles', href: '/profile' },
        { name: 'Medicine Cabinet', href: '/MedicineCabinet' },
        { name: 'Settings', href: '/settings' },
    ];

    return (
        // 💡 CHANGED: bg-indigo-400 to bg-blue-400
        <nav className="bg-blue-400 shadow-xl">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">

                        <Link href="/" className="flex items-center flex-shrink-0 mr-4">
                            <Image
                                src="/dawadarnaLOGO-removebg-preview.png"
                                alt="DawaDar Logo"
                                width={48} // Retained 48x48 size
                                height={48} // Retained 48x48 size
                                className="" // Retained rectangular shape
                            />
                        </Link>

                        {/* The App Name */}
                        <span className="text-xl font-bold text-white">DawaDar</span>
                    </div>
                    <div className="flex space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                // 💡 CHANGED: hover background to hover:bg-blue-500
                                className="text-white hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;