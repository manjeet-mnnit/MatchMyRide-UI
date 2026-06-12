import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, MoreVertical, Users, Clock, Crown, Timer, Navigation as NavIcon, Info, LogOut } from 'lucide-react';

export default function GroupHeader({ group, currentUser, onLeaveGroup, onReady, onStart, onShowGroupInfo, countdownEndTime, onBack }) {
    
    const navigate = useNavigate();
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [countdown, setCountdown] = useState(null);

    // Countdown timer effect
    useEffect(() => {
        if (!countdownEndTime) {
            setCountdown(null);
            return;
        }

        const updateCountdown = () => {
            const remaining = Math.max(0, Math.ceil((countdownEndTime - Date.now()) / 1000));
            setCountdown(remaining);
            
            if (remaining === 0) {
                setCountdown(null);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 100);

        return () => clearInterval(interval);
    }, [countdownEndTime]);

    if (!group) return null;

    const members = Array.isArray(group.members) ? group.members : [];
    const adminId = typeof group.admin === 'string' ? group.admin : group.admin?._id;
    const isAdmin = Boolean(currentUser?._id && adminId && adminId === currentUser._id);
    
    const isReady = members.some(member => member.user?._id === currentUser?._id && member.isReady === true);

    const handleShowOnMap = () => {
        navigate('/ride-map', { state: { groupId: group._id, group, currentUser } });
    };

    const handleShowNavigation = () => {
        navigate('/navigation', { state: { groupId: group._id, group } });
    }

    // Determine status label
    const getStatusLabel = () => {
        if (group.status === 'closed') return 'Closed';
        if (group.status === 'locked') return 'Locked';
        return 'Active';
    };

    return (
        <div className="bg-white text-gray-800 shadow-sm z-20 relative flex-shrink-0 border-b border-gray-200">
            
            {/* Single Row Header */}
            <div className="flex items-center justify-between md:px-4 pt-2 pb-1">
                <div className="flex items-center gap-1 md:gap-3 flex-1 min-w-0">
                    
                    {/* Back Button - Visible ONLY on Mobile */}
                    <button
                        onClick={onBack}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 md:hidden"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    
                    {/* Clickable Group Name + Subtitle (replaces View All) */}
                    <button 
                        onClick={onShowGroupInfo}
                        className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm md:text-lg font-bold truncate text-gray-900">{group.name}</h1>
                            {isAdmin && (
                                <span className="hidden sm:inline-flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] text-yellow-700 border border-yellow-200">
                                    <Crown size={10} /> ADMIN
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] md:text-xs text-gray-500">
                            {members.length} member{members.length !== 1 ? 's' : ''} · {getStatusLabel()}
                        </p>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                    
                    {/* Map Button - rectangular with border */}
                    <button
                        onClick={handleShowOnMap}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:cursor-pointer border border-gray-300"
                    >
                        <MapPin size={15} /> <span className="hidden sm:inline">Map</span>
                    </button>

                    {/* Navigate Button (when closed) - rectangular black bg */}
                    {group.status === 'closed' && ( 
                        <button 
                            onClick={handleShowNavigation}
                            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 hover:cursor-pointer text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
                        >
                            <NavIcon size={15} /> <span className="hidden sm:inline">Navigate</span>
                        </button>
                    )}

                    {/* Status / Start / Closed Button - rectangular */}
                    <div>
                        {countdown !== null ? (
                            <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-3 md:py-1.5 py-1 rounded-md text-sm font-bold flex items-center gap-1.5 whitespace-nowrap animate-pulse">
                                <Timer size={15} />
                                {countdown}s
                            </div>
                        ) : group.status === 'open' ? (
                            <button
                                onClick={onStart}
                                disabled={!isAdmin}
                                className={`px-3 md:py-1.5 py-1 rounded-md text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                    isAdmin 
                                        ? 'bg-gray-900 hover:bg-gray-800 hover:cursor-pointer text-white' 
                                        : 'bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200'
                                }`}
                            >
                                {isAdmin ? 'Start Ride' : 'Waiting...'}
                            </button>
                        ) : (
                            <div className={`px-3 md:py-1.5 py-1 rounded-md text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap border ${
                                group.status === 'locked' 
                                    ? 'bg-orange-50 text-orange-600 border-orange-200' 
                                    : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                                {group.status === 'locked' ? 'Locked' : 'Closed'}
                            </div>
                        )}
                    </div>

                    {/* Options Menu */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <MoreVertical size={20} />
                        </button>
                        
                        {showOptionsMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowOptionsMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-md z-50 py-1.5 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => { setShowOptionsMenu(false); onShowGroupInfo?.(); }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                                    >
                                        <Info size={16} className="text-gray-900" /> <span className="text-gray-900">Group details</span>
                                    </button>
                                    <div className="border-t border-gray-100 my-0.5"></div>
                                    <button
                                        onClick={() => { setShowOptionsMenu(false); onLeaveGroup?.(); }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm"
                                    >
                                        <LogOut size={16} className="text-red-600" /> <span>Leave group</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}