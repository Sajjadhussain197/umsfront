'use client'
import Link from 'next/link';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';

const Sidebar = () => {
  const { data: session } = useSession(); // Get session data

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' }); // Sign out and redirect to login
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">UMS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Add navigation items here */}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? ( // Check if session exists
              <button 
                className="text-gray-800 hover:text-gray-600"
                onClick={handleLogout} // Add onClick handler
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-gray-800 hover:text-gray-600">
                  Login
                </Link>
                <Link href="/register" className="ml-4 text-gray-800 hover:text-gray-600">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;