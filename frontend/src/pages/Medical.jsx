import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function MedicalAdherence() {
  const { userData, backendUrl, token, loadUserProfileData } = useContext(AppContext)

  const [editing, setEditing] = useState({ entryDate: null, medIndex: null })
  const [editValues, setEditValues] = useState({ name: '', dosage: '', days: 1 })

  const entries = userData?.medicalAdherence || []

  const formatDate = (ts) => {
    try {
      return new Date(ts).toLocaleString()
    } catch {
      return ''
    }
  }

  const handleIntake = async (entryDate, medIndex, action) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/medication/intake',
        { userId: userData._id, entryDate, medIndex, action },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message || 'Updated')
        await loadUserProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const startEdit = (entryDate, medIndex, med) => {
    setEditing({ entryDate, medIndex })
    setEditValues({
      name: med.name || '',
      dosage: med.dosage || '',
      days: med.days || 1
    })
  }

  const submitEdit = async () => {
    try {
      const updates = {
        name: editValues.name,
        dosage: editValues.dosage,
        days: Number(editValues.days)
      }

      const { data } = await axios.post(
        backendUrl + '/api/user/medication/edit',
        {
          userId: userData._id,
          entryDate: editing.entryDate,
          medIndex: editing.medIndex,
          updates
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        setEditing({ entryDate: null, medIndex: null })
        await loadUserProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const cancelEdit = () => {
    setEditing({ entryDate: null, medIndex: null })
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6 md:p-12'>
      {/* Header */}
      <div className='mb-10'>
        <h1 className='text-3xl font-bold text-[#262626] mb-2'>Digital Prescription</h1>
        <p className='text-gray-600 text-sm'>Track and manage your prescribed medications efficiently.</p>
      </div>

      {/* Prescriptions */}
      <div className='bg-white shadow-md rounded-xl p-6 md:p-10'>
        <h2 className='text-xl font-bold text-[#262626] mb-6 border-b pb-4'>Your Prescriptions</h2>

        {entries.length === 0 && (
          <div className='text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
            <p className='text-gray-500 text-base'>No prescriptions found. Consult a doctor to get started.</p>
          </div>
        )}

        {entries.map((entry, idx) => (
          <div key={idx} className='border border-gray-200 rounded-xl p-6 mb-8 hover:shadow-sm transition-shadow duration-300'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-4 border-b border-gray-100'>
              <div>
                <p className='text-xs text-uppercase text-gray-400 font-bold tracking-wider'>PRESCRIBED ON</p>
                <p className='text-[#262626] font-medium mt-1'>{formatDate(entry.date)}</p>
              </div>
              <div>
                <p className='text-xs text-uppercase text-gray-400 font-bold tracking-wider'>DOCTOR</p>
                <p className='text-[#262626] font-medium mt-1'>{entry.docName || 'N/A'}</p>
              </div>
              <div>
                <p className='text-xs text-uppercase text-gray-400 font-bold tracking-wider'>TOTAL MEDICINES</p>
                <p className='text-[#262626] font-medium mt-1'>
                  {(entry.medicines || []).length} items
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {(entry.medicines || []).map((m, i) => (
                <div key={i} className='border border-gray-100 rounded-lg p-5 bg-gray-50 flex flex-col justify-between'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h3 className='text-lg font-bold text-[#262626] leading-tight'>{m.name}</h3>
                      <div className='flex flex-wrap gap-2 mt-2 text-sm text-gray-600'>
                        <span className='bg-white border border-gray-200 px-2 py-1 rounded text-xs font-medium'>{m.dosage}</span>
                        <span className='bg-white border border-gray-200 px-2 py-1 rounded text-xs font-medium'>{m.times?.join(', ') || 'As prescribed'}</span>
                        <span className='bg-white border border-gray-200 px-2 py-1 rounded text-xs font-medium'>{m.meal}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-200'>
                    <span className='text-sm font-medium text-primary'>
                      {m.days} {m.days > 1 ? 'days' : 'day'}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        title='Mark as Taken'
                        onClick={() => handleIntake(entry.date, i, 'taken')}
                        className='bg-green-50 text-green-600 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 text-sm font-medium transition-colors flex items-center gap-1'
                      >
                        <span>Taken</span>
                      </button>

                      <button
                        title='Mark as Missed'
                        onClick={() => handleIntake(entry.date, i, 'missed')}
                        className='bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 text-sm font-medium transition-colors flex items-center gap-1'
                      >
                        <span>Missed</span>
                      </button>

                      <button
                        title='Edit Medicine'
                        onClick={() => startEdit(entry.date, i, m)}
                        className='bg-white text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-100 text-sm font-medium transition-colors'
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {editing.entryDate === entry.date && editing.medIndex === i && (
                    <div className='mt-4 pt-4 border-t border-gray-200'>
                      <h4 className='text-sm font-bold mb-3 text-gray-700'>Edit Medicine Details</h4>

                      <div className='grid grid-cols-1 gap-3 mb-3'>
                        <input
                          value={editValues.name}
                          onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                          className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary'
                          placeholder='Medicine name'
                        />
                        <div className='grid grid-cols-2 gap-3'>
                          <input
                            value={editValues.dosage}
                            onChange={e => setEditValues(v => ({ ...v, dosage: e.target.value }))}
                            className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary'
                            placeholder='Dosage'
                          />
                          <input
                            type='number'
                            min={0}
                            value={editValues.days}
                            onChange={e => setEditValues(v => ({ ...v, days: e.target.value }))}
                            className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary'
                            placeholder='Days'
                          />
                        </div>
                      </div>

                      <div className='flex gap-2 justify-end'>
                        <button onClick={cancelEdit} className='text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1.5'>
                          Cancel
                        </button>
                        <button onClick={submitEdit} className='bg-primary text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-primary/90 transition-colors'>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
