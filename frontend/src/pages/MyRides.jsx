import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftIcon, CarIcon, MapPin, Clock } from 'lucide-react'
import Navigation from '../components/Navigation'
import RideMatches from '../components/RideMatches'
import axios from '../api/axiosInstance'

export default function MyRides() {
    const [rides, setRides] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    
    const [selectedRideId, setSelectedRideId] = useState(null)
    const [rideGroup, setRideGroup] = useState(null)
    const [groupLoading, setGroupLoading] = useState(false)
    
    const navigate = useNavigate()
    const location = useLocation()

    // Handle initial selection from navigation state (like MyGroups does)
    useEffect(() => {
        if (location.state?.rideId) {
            setSelectedRideId(location.state.rideId)
        }
    }, [location.state])

    // Fetch rides list
    useEffect(() => {
        const fetchRides = async () => {
            try {
                const res = await axios.get('/rides/user-rides')
                setRides(res.data.rides)
            } catch (err) {
                setMessage('Could not fetch your rides')
            } finally {
                setLoading(false)
            }
        }
        fetchRides()
    }, [])

    // Derive the selected ride object from the rides array
    const selectedRide = rides.find(r => r._id === selectedRideId) || null

    // Fetch ride group whenever selectedRideId changes
    // Clear rideGroup synchronously to prevent stale data
    useEffect(() => {
        // Always reset group immediately on any selection change
        setRideGroup(null)
        setGroupLoading(false)

        if (!selectedRideId) return

        // We need the ride object to check status — but rides might not be loaded yet.
        // Find it from the current rides array.
        const ride = rides.find(r => r._id === selectedRideId)
        if (!ride || ride.status !== 'Matched') return

        let cancelled = false
        setGroupLoading(true)

        const fetchGroup = async () => {
            try {
                const res = await axios.get(`/rides/group/${selectedRideId}`)
                if (!cancelled) {
                    setRideGroup(res.data?.group || null)
                }
            } catch (err) {
                console.error('Failed to fetch ride group:', err)
                if (!cancelled) {
                    setMessage('Could not fetch ride group details')
                    setRideGroup(null)
                }
            } finally {
                if (!cancelled) {
                    setGroupLoading(false)
                }
            }
        }
        fetchGroup()

        // Cleanup: if the user switches rides before this fetch finishes,
        // ignore the stale response
        return () => { cancelled = true }
    }, [selectedRideId, rides])

    // Selection handler
    const handleRideSelect = (rideId) => {
        setSelectedRideId(rideId)
    }

    // Helper to format ride date/time for the sidebar
    const formatRideDateTime = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24))
        
        let dayLabel
        if (diffDays === 0) dayLabel = 'Today'
        else if (diffDays === 1) dayLabel = 'Tomorrow'
        else {
            dayLabel = date.toLocaleDateString(undefined, { weekday: 'short' })
        }
        
        const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        return `${dayLabel} · ${time}`
    }

    // Helper to truncate address for sidebar
    const truncateAddress = (addr, maxLen = 32) => {
        if (!addr) return ''
        return addr.length > maxLen ? addr.slice(0, maxLen) + '...' : addr
    }

    return (
        <div className="min-h-screen w-full flex overflow-hidden relative bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
            
            {/* INJECT CUSTOM ANIMATION STYLES */}
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-in-right { animation: slideInRight 0.4s ease-out forwards; }
                .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>

            {/* =======================================================
               LEFT SIDE: RIDE LIST PANEL
               - Hidden on mobile IF a ride is selected
               - Takes fixed width on desktop
            ======================================================== */}
            <div className={`
                flex flex-col w-full md:w-[380px] lg:w-[400px] border-r border-gray-200 bg-white h-screen shrink-0 z-10
                ${selectedRideId ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                    
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={() => navigate('/')} 
                            className="hover:text-primary transition-colors hover:cursor-pointer"
                        >
                            <ArrowLeftIcon size={16} />
                        </button>
                        <div className="flex justify-between items-center gap-2">
                            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Your Rides</h2>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full">
                                {rides.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto">
                    {loading && <p className="text-center text-gray-400 animate-pulse py-8">Loading rides...</p>}
                    
                    {message && <p className="text-center text-red-500 text-sm px-4 py-3">{message}</p>}
                    
                    {!loading && rides.length === 0 && (
                        <div className="text-center p-8 text-gray-400">
                            <CarIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No rides created yet.</p>
                        </div>
                    )}

                    {rides.map((ride, index) => {
                        const isActive = selectedRideId === ride._id
                        return (
                            <div
                                key={ride._id}
                                onClick={() => handleRideSelect(ride._id)}
                                style={{ animationDelay: `${index * 40}ms` }}
                                className={`
                                    group cursor-pointer flex items-center gap-3.5 px-4 py-3 mx-3 mb-2 rounded-xl
                                    transition-all duration-200 animate-slide-up
                                    ${isActive 
                                        ? 'bg-slate-50 border border-slate-200 border-l-[3px] border-l-slate-800 shadow-sm' 
                                        : 'border border-transparent hover:bg-gray-50/80'}
                                `}
                            >
                                {/* Location Icon - Rounded Square */}
                                <div className={`
                                    w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                                    transition-colors duration-200
                                    ${isActive 
                                        ? 'bg-transparent text-gray-900' 
                                        : 'bg-gray-50 text-gray-400 group-hover:text-gray-900'}
                                `}>
                                    <MapPin size={20} />
                                </div>

                                {/* Ride Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                                            {truncateAddress(ride.destination)}
                                        </p>
                                        <span className={`
                                            text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ml-2 shrink-0
                                            ${ride.status === 'Matched' 
                                                ? 'bg-green-100 text-green-600' 
                                                : 'bg-orange-100 text-orange-600'}
                                        `}>
                                            {ride.status || 'Open'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                        <Clock size={11} />
                                        {formatRideDateTime(ride.datetime)}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* =======================================================
               RIGHT SIDE: DETAIL VIEW
               - Hidden on mobile IF NO ride selected
               - Takes remaining width on desktop
               - Uses 'key' on selectedRideId to force remount on change
            ======================================================== */}
            <div className={`
                flex-col h-screen overflow-y-auto flex-1
                ${selectedRideId ? 'flex fixed inset-0 z-50 md:static bg-white' : 'hidden md:flex items-center justify-center bg-transparent'}
            `}>
                
                {selectedRideId && selectedRide ? (
                    <div 
                        key={selectedRideId}
                        className="flex flex-col h-full w-full animate-slide-in-right bg-white"
                    >
                        {/* Mobile Only Header */}
                        <div className="md:hidden p-4 border-b border-gray-100 bg-white flex items-center shadow-sm">
                            <button 
                                onClick={() => setSelectedRideId(null)}
                                className="p-1.5 hover:bg-gray-100 rounded-full mr-2 transition-colors"
                            >
                                <ArrowLeftIcon size={20} />
                            </button>
                            <span className="text-base font-semibold text-gray-800">Ride Details</span>
                        </div>

                        {/* Matched ride → show Navigation (only when group is loaded) */}
                        {selectedRide.status === 'Matched' && (
                            groupLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                                        <p className="mt-4 text-gray-400 text-sm">Loading ride group...</p>
                                    </div>
                                </div>
                            ) : rideGroup ? (
                                <Navigation groupId={rideGroup._id} initialGroup={rideGroup} />
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-gray-400 text-sm">Could not load group details.</p>
                                </div>
                            )
                        )}

                        {/* Unmatched ride → show RideMatches */}
                        {selectedRide.status !== 'Matched' && (
                            <RideMatches rideId={selectedRide._id} />
                        )}
                    </div>
                ) : selectedRideId && !selectedRide ? (
                    /* Ride ID set (from location.state) but rides not loaded yet */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-400 text-sm">Loading ride...</p>
                        </div>
                    </div>
                ) : (
                    /* Empty State (Desktop Only) */
                    <div className="text-center p-10 animate-fade-in">
                        <div className="inline-block p-6 bg-white/60 backdrop-blur-sm rounded-full mb-4 shadow-sm">
                            <CarIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-500">Select a ride</h3>
                        <p className="text-sm text-gray-400 mt-1">Click on a ride from the left to view details</p>
                    </div>
                )}
            </div>
        </div>
    )
}