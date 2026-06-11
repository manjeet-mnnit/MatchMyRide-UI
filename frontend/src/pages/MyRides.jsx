import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftIcon, CarIcon } from 'lucide-react'
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

    // Handler for the Action Button
    const handleRideAction = async (ride) => {
        if (ride.status === 'Matched') {
            const res = await axios.get(`/rides/group/${ride._id}`)
            navigate(`/navigation`, { state: { groupId: res.data?.group?._id, group: res.data?.group } })
        } else {
            navigate('/ride-matches', { state: { rideId: ride._id } })
        }
    }

    return (
        <div className='bg-background h-screen w-full flex overflow-hidden relative'>
            
            {/* INJECT CUSTOM ANIMATION STYLES */}
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
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
               LEFT SIDE: LIST VIEW
               - Hidden on mobile IF a ride is selected
               - Takes 1/3 width on desktop
            ======================================================== */}
            <div className={`
                flex flex-col w-full md:w-1/3 lg:w-1/4 border-r border-border bg-surface h-full z-10
                ${selectedRideId ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="flex justify-between pt-4 px-4 border-b border-border bg-surface sticky top-0 z-20">
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center text-sm text-muted hover:text-primary mb-4 transition-colors hover:cursor-pointer"
                    >
                        <ArrowLeftIcon size={16} /> <span className="ml-2">Back to Dashboard</span>
                    </button>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-content">Rides</h2>
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading && <p className="text-center text-muted animate-pulse">Loading rides...</p>}
                    
                    {message && <p className="text-center text-error mb-4">{message}</p>}
                    
                    {!loading && rides.length === 0 && (
                        <div className="text-center p-8 text-muted border-2 border-dashed rounded-xl">
                            <p>No rides created yet.</p>
                        </div>
                    )}

                    {rides.map((ride, index) => (
                        <div
                            key={ride._id}
                            onClick={() => handleRideSelect(ride._id)}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className={`
                                cursor-pointer rounded-xl p-4 border transition-all duration-200 animate-slide-up
                                ${selectedRideId === ride._id 
                                    ? 'bg-primary/10 border-primary shadow-md' 
                                    : 'bg-surface shadow-sd border-transparent hover:shadow-lg hover:border-border'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${ride.status === 'Matched' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {ride.status || 'Pending'}
                                </span>
                                <span className="text-xs text-muted">{new Date(ride.datetime).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-semibold text-content truncate">{ride.destination}</h3>
                            <p className="text-sm text-muted truncate">From: {ride.source}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* =======================================================
               RIGHT SIDE: DETAIL VIEW
               - Hidden on mobile IF NO ride selected
               - Takes 2/3 width on desktop
               - Uses 'key' on selectedRideId to force remount on change
            ======================================================== */}
            <div className={`
                flex-col bg-background h-full overflow-y-auto
                ${selectedRideId ? 'flex fixed inset-0 z-50 md:static md:w-2/3 lg:w-3/4' : 'hidden md:flex md:w-2/3 lg:w-3/4 items-center justify-center'}
            `}>
                
                {selectedRideId && selectedRide ? (
                    <div 
                        key={selectedRideId}
                        className="flex flex-col h-full w-full animate-slide-in-right bg-background"
                    >
                        {/* Mobile Only Header */}
                        <div className="md:hidden p-4 border-b border-border bg-surface flex items-center shadow-sm">
                            <button 
                                onClick={() => setSelectedRideId(null)}
                                className="p-1 hover:bg-gray-100 rounded-full mr-2"
                            >
                                <ArrowLeftIcon />
                            </button>
                            <span className="text-lg">Ride Details</span>
                        </div>

                        {/* Matched ride → show Navigation (only when group is loaded) */}
                        {selectedRide.status === 'Matched' && (
                            groupLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-4 text-muted text-sm">Loading ride group...</p>
                                    </div>
                                </div>
                            ) : rideGroup ? (
                                <Navigation groupId={rideGroup._id} initialGroup={rideGroup} />
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-muted text-sm">Could not load group details.</p>
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
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted text-sm">Loading ride...</p>
                        </div>
                    </div>
                ) : (
                    /* Empty State (Desktop Only) */
                    <div className="text-center p-10 animate-fade-in opacity-50">
                        <div className="inline-block p-6 bg-surface rounded-full mb-4">
                            <CarIcon />
                        </div>
                        <h3 className="text-xl font-medium text-content">Select a ride</h3>
                        <p className="text-muted">Click on a ride from the left to view details</p>
                    </div>
                )}
            </div>
        </div>
    )
}