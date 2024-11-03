'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  username: string
  email: string
  role: string
}

export default function UserData() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [editedUser, setEditedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const {data: session}=useSession();
  const userId= session?.user.id;

  useEffect(() => {
    if(session){

      console.log(session)
      fetchUserProfile()
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      
      const response = await fetch(`http://localhost:8000/api/auth/users/getuserbyid/${userId}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }}      
      );
              if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setEditedUser(userData)
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError('Failed to fetch user profile')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setIsChangingPassword(false)
  }

  const handleChangePassword = () => {
    setIsChangingPassword(true)
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editedUser),
      })
      if (response.ok) {
        setUser(editedUser)
        setIsEditing(false)
        setSuccess('Profile updated successfully')
      } else {
        setError('Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ newPassword }),
      })
      if (response.ok) {
        setIsChangingPassword(false)
        setNewPassword('')
        setConfirmPassword('')
        setSuccess('Password changed successfully')
      } else {
        setError('Failed to change password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/users/me', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (response.ok) {
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          setError('Failed to delete account')
        }
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
  }

  if (!user) {
    return <div className="text-center text-green-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Profile</h1>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser?.username}
                  onChange={(e) => setEditedUser({ ...editedUser!, username: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              ) : (
                user.username
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <input
                  type="email"
                  value={editedUser?.email}
                  onChange={(e) => setEditedUser({ ...editedUser!, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              ) : (
                user.email
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.role}</dd>
          </div>
          {isChangingPassword && (
            <>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">New Password</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Confirm New Password</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        ) : isChangingPassword ? (
          <button
            onClick={handlePasswordChange}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Change Password
          </button>
        ) : (
          <>
            <button
              onClick={handleEdit}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Profile
            </button>
            <button
              onClick={handleChangePassword}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Change Password
            </button>
            <button
              onClick={handleDelete}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Account
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-600" role="alert">{error}</p>}
      {success && <p className="mt-2 text-center text-sm text-green-600" role="alert">{success}</p>}
    </div>
  )
}