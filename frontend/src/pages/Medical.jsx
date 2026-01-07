import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function MedicalAdherence() {
  const { userData, backendUrl, token, loadUserProfileData } = useContext(AppContext)
  const [editing, setEditing] = useState({ entryDate: null, medIndex: null })
  const [editValues, setEditValues] = useState({ name: '', dosage: '', days: 1 })
  const [symptoms, setSymptoms] = useState('')
  const [coaching, setCoaching] = useState(null)
  const [loadingCoach, setLoadingCoach] = useState(false)

  const entries = userData?.medicalAdherence || []

  const formatDate = (ts) => {
    try {
      return new Date(ts).toLocaleString()
    } catch (e) {
      return ''
    }
  }

  const handleIntake = async (entryDate, medIndex, action) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/medication/intake', { userId: userData._id, entryDate, medIndex, action }, { headers: { token } })
      if (data.success) {
        toast.success(data.message || 'Updated')
        await loadUserProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const startEdit = (entryDate, medIndex, med) => {
    setEditing({ entryDate, medIndex })
    setEditValues({ name: med.name || '', dosage: med.dosage || '', days: med.days || 1 })
  }

  const submitEdit = async () => {
    try {
      const updates = { name: editValues.name, dosage: editValues.dosage, days: Number(editValues.days) }
      const { data } = await axios.post(backendUrl + '/api/user/medication/edit', { userId: userData._id, entryDate: editing.entryDate, medIndex: editing.medIndex, updates }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        setEditing({ entryDate: null, medIndex: null })
        await loadUserProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const cancelEdit = () => {
    setEditing({ entryDate: null, medIndex: null })
  }

  const getAICoaching = async () => {
    try {
      setLoadingCoach(true)
      const allMeds = entries.flatMap(e => e.medicines || [])
      if (allMeds.length === 0) {
        toast.error('No medicines to analyze')
        return
      }
      const { data } = await axios.post(backendUrl + '/api/ai/medical-coach', { medicines: allMeds, symptoms }, { headers: { token } })
      if (data.success) {
        setCoaching(data.coaching)
        toast.success('AI Coach ready!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to get coaching')
    } finally {
      setLoadingCoach(false)
    }
  }

  const calculateAdherence = () => {
    if (entries.length === 0) return 0
    let totalMeds = 0
    let remainingMeds = 0
    entries.forEach(e => {
      const medCount = (e.medicines || []).length
      totalMeds += medCount
      remainingMeds += medCount
    })
    return totalMeds === 0 ? 100 : Math.round((remainingMeds / totalMeds) * 100)
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      {/* Header */}
      <h1 className='text-4xl font-bold text-[#262626] mb-2'>Medical Adherence</h1>
      <p className='text-gray-600 mb-8'>Track your medicines and get AI coaching for better health</p>

      {/* Adherence Score Card */}
      <div className='bg-white shadow-lg rounded-lg p-8 mb-8 border-l-4 border-primary'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-gray-600 text-lg mb-2'>Your Adherence Score</p>
            <p className='text-5xl font-bold text-primary'>{calculateAdherence()}%</p>
          </div>
          <div className='text-6xl opacity-20'>💊</div>
        </div>
      </div>

      {/* AI Coach Section */}
      {coaching && (
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg rounded-lg p-8 mb-8 border border-blue-200'>
          <h2 className='text-3xl font-bold text-[#262626] mb-6 flex items-center gap-2'>
            <span className='text-3xl'>🤖</span> AI Medical Adherence Coach
          </h2>
          
          {coaching.emergencyAlert && (
            <div className='bg-red-100 border-l-4 border-red-600 rounded p-4 mb-6'>
              <p className='text-red-700 font-bold text-lg'>⚠️ EMERGENCY ALERT</p>
              <p className='text-red-600 mt-2'>Seek immediate medical attention!</p>
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Medicine Explanations */}
            <div className='bg-white rounded-lg p-6 border border-blue-100'>
              <h3 className='text-xl font-semibold text-[#262626] mb-4'>💊 Your Medicines</h3>
              <div className='space-y-3'>
                {coaching.medicineExplanations && Object.entries(coaching.medicineExplanations).map(([medName, details]) => (
                  <div key={medName} className='border-l-4 border-blue-400 pl-4 py-2'>
                    <p className='font-semibold text-[#262626]'>{medName}</p>
                    <p className='text-gray-600 text-sm mt-1'>{details.simpleExplanation}</p>
                    <p className='text-gray-600 text-sm mt-1'>📋 {details.howToTake}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Schedule */}
            <div className='bg-white rounded-lg p-6 border border-green-100'>
              <h3 className='text-xl font-semibold text-[#262626] mb-4'>📅 Daily Schedule</h3>
              <div className='bg-green-50 rounded p-4 font-mono text-sm text-gray-700 whitespace-pre-line'>
                {coaching.dailySchedule}
              </div>
            </div>

            {/* Side Effects Analysis */}
            <div className='bg-white rounded-lg p-6 border border-yellow-100'>
              <h3 className='text-xl font-semibold text-[#262626] mb-4'>⚕️ Side Effects Analysis</h3>
              <div className='space-y-3'>
                <div>
                  <p className='text-gray-600'>Reported Symptoms:</p>
                  <p className='font-semibold text-[#262626] mt-1'>{coaching.sideEffectsAnalysis?.reported}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Severity Level:</p>
                  <span className={`inline-block font-bold text-lg px-3 py-1 rounded mt-1 ${coaching.sideEffectsAnalysis?.severity === 'critical' ? 'bg-red-100 text-red-700' : coaching.sideEffectsAnalysis?.severity === 'monitoring' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {coaching.sideEffectsAnalysis?.severity?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className='text-gray-600 mt-3'>Guidance:</p>
                  <p className='font-semibold text-[#262626] mt-1'>{coaching.sideEffectsAnalysis?.guidance}</p>
                </div>
              </div>
            </div>

            {/* Drug Interactions & Missed Dose */}
            <div className='bg-white rounded-lg p-6 border border-purple-100'>
              <h3 className='text-xl font-semibold text-[#262626] mb-4'>⚗️ Drug Interactions</h3>
              <p className='text-gray-700 mb-6'>{coaching.drugInteractions}</p>
              <h3 className='text-xl font-semibold text-[#262626] mb-3 mt-6'>⏰ Missed Dose Guidance</h3>
              <p className='text-gray-700'>{coaching.missedDoseGuidance}</p>
            </div>
          </div>

          {/* Adherence Summary & Next Review */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
            <div className='bg-blue-50 rounded-lg p-6 border border-blue-200'>
              <h3 className='text-lg font-semibold text-[#262626] mb-3'>📊 Adherence Summary</h3>
              <p className='text-gray-700'>{coaching.adherenceSummary}</p>
            </div>
            <div className='bg-purple-50 rounded-lg p-6 border border-purple-200'>
              <h3 className='text-lg font-semibold text-[#262626] mb-3'>📌 Next Review</h3>
              <p className='text-gray-700'>{coaching.nextReview}</p>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Reporting Section */}
      <div className='bg-white shadow-lg rounded-lg p-6 mb-8'>
        <h2 className='text-2xl font-bold text-[#262626] mb-4'>Get AI Coaching</h2>
        <div>
          <label className='text-gray-700 font-semibold block mb-2'>Report any symptoms (optional)</label>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch'>
            <div className='lg:col-span-2'>
              <textarea 
                value={symptoms} 
                onChange={e => setSymptoms(e.target.value)} 
                placeholder='e.g., nausea, dizziness, headache, fever, rash...' 
                className='w-full h-20 border-2 border-gray-300 rounded-lg p-3 text-base focus:border-primary focus:outline-none resize-none' 
              />
            </div>
            <button 
              onClick={getAICoaching} 
              disabled={loadingCoach} 
              className='border-2 border-primary text-primary px-6 rounded-lg hover:bg-primary hover:text-white transition-all font-semibold text-lg disabled:border-gray-400 disabled:text-gray-400 w-full h-20 flex items-center justify-center'
            >
              {loadingCoach ? '⏳ Analyzing...' : '🤖 Get AI Coaching'}
            </button>
          </div>
        </div>
      </div>

      {/* Medical Adherence Tracking */}
      <div className='bg-white shadow-lg rounded-lg p-8'>
        <h2 className='text-2xl font-bold text-[#262626] mb-8'>Your Prescriptions</h2>

        {entries.length === 0 && (
          <p className='text-gray-500 text-lg text-center py-12'>No prescriptions from doctors yet.</p>
        )}
        
        {entries.map((entry, idx) => (
          <div key={idx} className='border-2 border-gray-200 rounded-lg p-8 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b'>
              <div>
                <p className='text-gray-600 font-semibold'>Prescribed On</p>
                <p className='text-[#262626] text-lg mt-2'>{formatDate(entry.date)}</p>
              </div>
              <div>
                <p className='text-gray-600 font-semibold'>Doctor</p>
                <p className='text-[#262626] text-lg mt-2'>{entry.docName || 'N/A'}</p>
              </div>
              <div>
                <p className='text-gray-600 font-semibold'>Total Medicines</p>
                <p className='text-[#262626] text-lg mt-2'>{(entry.medicines || []).length}</p>
              </div>
            </div>

            <div className='space-y-4'>
              {(entry.medicines || []).map((m, i) => (
                <div key={i} className='border border-gray-200 rounded-lg p-6 bg-gray-50'>
                  <div className='flex justify-between items-start mb-4'>
                    <div className='flex-1'>
                      <p className='text-xl font-bold text-[#262626]'>{m.name}</p>
                      <p className='text-gray-600 mt-2 text-lg'>
                        <span className='font-semibold'>{m.dosage}</span> • 
                        <span className='ml-2'>{m.times?.length ? m.times.join(', ') : 'As prescribed'}</span> • 
                        <span className='ml-2'>{m.meal}</span> • 
                        <span className='ml-2 font-semibold text-primary'>{m.days} {m.days > 1 ? 'days' : 'day'}</span>
                      </p>
                    </div>
                    <div className='flex gap-3 ml-6'>
                      <button 
                        title='Took medicine' 
                        onClick={() => handleIntake(entry.date, i, 'taken')} 
                        className='bg-green-100 text-green-700 rounded-full p-3 hover:bg-green-200 text-xl w-12 h-12 flex items-center justify-center transition'
                      >
                        ✓
                      </button>
                      <button 
                        title="Missed medicine" 
                        onClick={() => handleIntake(entry.date, i, 'missed')} 
                        className='bg-red-100 text-red-700 rounded-full p-3 hover:bg-red-200 text-xl w-12 h-12 flex items-center justify-center transition'
                      >
                        ✕
                      </button>
                      <button 
                        title='Edit' 
                        onClick={() => startEdit(entry.date, i, m)} 
                        className='bg-blue-100 text-blue-700 rounded-full p-3 hover:bg-blue-200 text-xl w-12 h-12 flex items-center justify-center transition'
                      >
                        ✎
                      </button>
                    </div>
                  </div>

                  {editing.entryDate === entry.date && editing.medIndex === i && (
                    <div className='mt-6 pt-6 border-t border-gray-300 bg-white rounded-lg p-6'>
                      <h4 className='text-lg font-bold text-[#262626] mb-4'>Edit Medicine</h4>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                        <div>
                          <label className='text-gray-600 font-semibold block mb-2'>Medicine Name</label>
                          <input 
                            value={editValues.name} 
                            onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))} 
                            className='w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-base focus:border-primary focus:outline-none' 
                          />
                        </div>
                        <div>
                          <label className='text-gray-600 font-semibold block mb-2'>Dosage</label>
                          <input 
                            value={editValues.dosage} 
                            onChange={e => setEditValues(v => ({ ...v, dosage: e.target.value }))} 
                            className='w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-base focus:border-primary focus:outline-none' 
                          />
                        </div>
                        <div>
                          <label className='text-gray-600 font-semibold block mb-2'>Days Remaining</label>
                          <input 
                            type='number' 
                            min={0} 
                            value={editValues.days} 
                            onChange={e => setEditValues(v => ({ ...v, days: e.target.value }))} 
                            className='w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-base focus:border-primary focus:outline-none' 
                          />
                        </div>
                      </div>
                      <div className='flex gap-3'>
                        <button 
                          onClick={submitEdit} 
                          className='border-2 border-primary text-primary px-8 py-2 rounded-lg hover:bg-primary hover:text-white transition font-semibold'
                        >
                          Save Changes
                        </button>
                        <button 
                          onClick={cancelEdit} 
                          className='border-2 border-gray-300 text-gray-700 px-8 py-2 rounded-lg hover:bg-gray-100 transition font-semibold'
                        >
                          Cancel
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



