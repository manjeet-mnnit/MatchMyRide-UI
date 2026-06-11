import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Phone, MapPin, Clock, 
    CheckCircle2, Circle, Users 
} from 'lucide-react'
import axios from '../api/axiosInstance'

export default function RideMatches({ rideId }) {
    const [matches, setMatches] = useState([])
    const [selected, setSelected] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true)
            try {
                const res = await axios.post(
                    '/rides/matched-v2',
                    { rideId }
                )
                setMatches(res.data.rides)
            } catch (err) {
                setMessage(err.response?.data?.message || 'Could not fetch matches')
            } finally {
                setLoading(false)
            }
        }

        if (rideId) fetchMatches()
        else {
            setMessage('Ride ID not provided')
            setLoading(false)
        }
    }, [rideId])

    const toggleSelection = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((uid) => uid !== id))
        } else {
            setSelected([...selected, id])
        }
    }

    const handleCreateGroup = async () => {
        if (selected.length === 0) return;
        
        try {
            const invites = matches
                .filter((match) => selected.includes(match.user._id))
                .map((match) => ({
                    user: match.user._id,
                    ride: match._id,
                }))
            
            const res = await axios.post(
                '/groups/create', 
                {
                    rideId,
                    invites,
                }
            )
            
            if (res.data.group?._id)
                navigate('/my-groups', { state: { groupId: res.data.group._id } })
            else
                setMessage('Invalid response from server')

        } catch (err) {
            setMessage(err.response?.data?.message || 'Group creation failed')
        }
    }

    // Helper to format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
            + ' at ' 
            + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            
            {/* INJECT ANIMATION STYLES */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
            `}</style>

            {/* 1. Header Section */}
            <div className="hidden md:block px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                <div className="flex justify-between items-center pt-1">
                    <h2 className="text-xs font-bold tracking-widest text-green-700 uppercase">
                        Potential Matches
                    </h2>
                    <span className="text-xs font-medium text-gray-400">
                        <span className="text-green-600 font-semibold">{matches.length}</span> found
                    </span>
                </div>
                {message && <p className="text-red-500 mt-2 text-sm bg-red-50 p-2 rounded-lg">{message}</p>}
            </div>

            {/* 2. Scrollable Match Cards */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-3">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-sm">Finding compatible rides...</p>
                    </div>
                )}

                {!loading && matches.length === 0 && (
                    <div className="text-center py-16 px-4">
                        <Users className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                        <h3 className="font-semibold text-base text-gray-600">No matches yet</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">
                            We couldn't find anyone with a similar route and time right now. Check back later!
                        </p>
                    </div>
                )}

                {matches.map((ride, index) => {
                    const isSelected = selected.includes(ride.user._id);
                    
                    return (
                        <div
                            key={ride._id}
                            onClick={() => toggleSelection(ride.user._id)}
                            style={{ animationDelay: `${index * 60}ms` }}
                            className={`
                                group relative rounded-xl border cursor-pointer transition-all duration-200 animate-slide-up
                                ${isSelected 
                                    ? 'bg-blue-50/50 border-blue-200 shadow-md ring-1 ring-blue-300' 
                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md shadow-sm'}
                            `}
                        >
                            {/* User Info Row */}
                            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-50">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
                                    <img 
                                        src={ride.user.avatar} 
                                        alt={`${ride.user.fullName}'s avatar`} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                {/* Name & Phone */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        {ride.user.fullName}
                                    </h4>
                                    <div className="flex items-center text-xs text-gray-400 mt-0.5 gap-1">
                                        <Phone size={11} />
                                        <span>Hidden</span>
                                    </div>
                                </div>
                                {/* Selection Indicator */}
                                <div className={`transition-colors ${isSelected ? 'text-blue-500' : 'text-gray-200 group-hover:text-gray-300'}`}>
                                    {isSelected 
                                        ? <CheckCircle2 size={22} className="fill-blue-500 text-white" /> 
                                        : <Circle size={22} />
                                    }
                                </div>
                            </div>

                            {/* Route & Time Details */}
                            <div className="px-5 py-3.5 space-y-2.5">
                                {/* Route */}
                                <div className="flex items-start gap-2.5">
                                    <MapPin size={14} className="text-gray-300 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5">Route</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {ride.source} → {ride.destination}
                                        </p>
                                    </div>
                                </div>
                                {/* Time */}
                                <div className="flex items-center gap-2.5">
                                    <Clock size={14} className="text-gray-300 shrink-0" />
                                    <p className="text-sm text-gray-500">
                                        {formatDate(ride.datetime)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* 3. Sticky Action Footer */}
            <div className="px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 z-10 shrink-0">
                <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
                    <span className="text-sm text-gray-400">
                        <span className="font-semibold text-gray-600">{selected.length}</span>/{matches.length} Selected
                    </span>
                    <button
                        onClick={handleCreateGroup}
                        disabled={selected.length === 0}
                        className={`
                            py-2.5 px-8 rounded-xl text-sm font-bold transition-all duration-200
                            flex items-center justify-center gap-2
                            ${selected.length > 0 
                                ? 'bg-gray-800 text-white hover:bg-gray-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    )
}