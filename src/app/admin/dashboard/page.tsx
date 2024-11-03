'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  _id: string
  username: string
  email: string
  role: string
  password: string
  fullName: string
  avatar: File | null
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { data: session } = useSession()
  const token = session?.accessToken;

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/users/getallusers')
      console.log('Response:', response)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched data:', data)
        setUsers(data.data)
      } else {
        const errorData = await response.json()
        console.error('Error fetching users:', errorData)
        setError(`Failed to fetch users: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Failed to fetch users due to a network error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      if (!token) {
        setError('Authorization token is missing. Please log in again.');
        return;
      }
      try {
        console.log('Deleting user:', userId, `http://localhost:8000/api/auth/users/delete-user/${userId}`)
        const response = await fetch(`http://localhost:8000/api/auth/users/delete-user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          setUsers(users.filter(user => user._id !== userId))
        } else {
          const errorData = await response.json()
          setError(`Failed to delete user: ${errorData.message || 'Unknown error'}`)
        }
      } catch (err) {
        console.error('Network error:', err)
        setError('An error occurred. Please try again.')
      }
    }
  }

  const handleCreateUser = async (userData: User) => {
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('role', userData.role);
    formData.append('password', userData.password);
    formData.append('fullName', userData.fullName);
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/users/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })
      if (response.ok) {
        const newUser = await response.json()
        setUsers([...users, newUser])
        setIsModalOpen(false)
      } else {
        setError('Failed to create user')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const handleEditUser = async (userData: User) => {
    try {
      const response = await fetch(`/api/admin/users/${userData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      })
      if (response.ok) {
        setUsers(users.map(user => user._id === userData._id ? userData : user))
        setIsModalOpen(false)
      } else {
        setError('Failed to edit user')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const openCreateModal = () => {
    setCurrentUser(null)
    setIsEditMode(false)
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setCurrentUser(user)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      <button onClick={openCreateModal} className="mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded">Create User</button>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Username</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users && users.map((user) => (
                    <tr key={user._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.username}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900 mr-4">
                          Edit<span className="sr-only">, {user.username}</span>
                        </button>
                        <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">
                          Delete<span className="sr-only">, {user.username}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-6 rounded shadow-lg text-black flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{isEditMode ? 'Edit User' : 'Create User'}</h2>
            <input
              type="text"
              value={currentUser?.username || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
              placeholder="Username"
              className="mt-2 p-2 border rounded"
            />
            <input
              type="email"
              value={currentUser?.email || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              placeholder="Email"
              className="mt-2 p-2 border rounded"
            />
            <input
              type="text"
              value={currentUser?.role || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
              placeholder="Role"
              className="mt-2 p-2 border rounded"
            />
            <input
              type="password"
              value={currentUser?.password || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
              placeholder="Password"
              className="mt-2 p-2 border rounded"
            />
            <input
              type="text"
              value={currentUser?.fullName || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
              placeholder="Full Name"
              className="mt-2 p-2 border rounded"
            />
            <input
              type="file"
              onChange={(e) => setCurrentUser({ ...currentUser, avatar: e.target.files ? e.target.files[0] : null })}
              className="mt-2 p-2 border rounded"
            />
            <button onClick={() => setIsModalOpen(false)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            <button onClick={() => isEditMode ? handleEditUser(currentUser) : handleCreateUser(currentUser)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">{isEditMode ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}
    </div>
  )
}