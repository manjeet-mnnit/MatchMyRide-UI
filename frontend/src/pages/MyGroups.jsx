import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Users, ArrowLeft } from 'lucide-react';
import GroupChat from '../components/chat/GroupChat';

export default function MyGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Fetch Groups
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axiosInstance.get('/groups/my-groups');
                setGroups(res.data.groups || []);                
            } catch (err) {
                setError('Failed to load groups');
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    // 2. Handle Initial State from Navigation (e.g., if redirected from Create Group)
    useEffect(() => {
        if (location.state?.groupId) {
            setSelectedGroupId(location.state.groupId);
        }
    }, [location.state]);

    // 3. Selection Handler
    const handleGroupSelect = (id) => {
        setSelectedGroupId(id);
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden relative bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
            
            {/* Custom Animation Styles */}
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
               LEFT SIDE: GROUP LIST
               - Hidden on mobile IF a group is selected
               - Fixed width on desktop
            ======================================================== */}
            <div className={`
                flex flex-col w-full md:w-[380px] lg:w-[400px] border-r border-gray-200 bg-white h-screen shrink-0 z-10
                ${selectedGroupId ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={() => navigate('/')} 
                            className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Your Groups</h2>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full">
                                {groups.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center p-8 space-y-3">
                             {[1,2,3].map(i => (
                                 <div key={i} className="w-full h-16 bg-gray-50 animate-pulse rounded-lg"/>
                             ))}
                        </div>
                    )}

                    {error && <p className="text-center text-red-500 text-sm px-4 py-3">{error}</p>}

                    {!loading && groups.length === 0 && (
                        <div className="text-center p-8 text-gray-400">
                            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">You are not part of any groups.</p>
                        </div>
                    )}

                    {groups.map((group, index) => {
                        const isActive = selectedGroupId === group._id;
                        
                        return (
                            <div
                                key={group._id}
                                onClick={() => handleGroupSelect(group._id)}
                                style={{ animationDelay: `${index * 40}ms` }}
                                className={`
                                    group cursor-pointer flex items-center gap-3.5 px-4 py-3 mx-3 mb-2 rounded-xl
                                    transition-all duration-200 animate-slide-up
                                    ${isActive 
                                        ? 'bg-slate-50 border border-slate-200 border-l-[3px] border-l-slate-800 shadow-sm' 
                                        : 'border border-transparent hover:bg-gray-50/80'}
                                `}
                            >
                                {/* Group Icon - Rounded Square */}
                                <div className={`
                                    w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                                    transition-colors duration-200
                                    ${isActive 
                                        ? 'bg-transparent text-gray-900' 
                                        : 'bg-gray-50 text-gray-400 group-hover:text-gray-900'}
                                `}>
                                    <Users size={20} />
                                </div>

                                {/* Group Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                                            {group.name}
                                        </h3>
                                        <span className="text-[11px] text-gray-400 ml-2 shrink-0">
                                            {new Date(group.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {group.members?.length} member{group.members?.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* =======================================================
               RIGHT SIDE: CHAT INTERFACE
               - Desktop: Visible always (shows placeholder if null)
               - Mobile: Covers screen when group selected
            ======================================================== */}
            <div className={`
                h-screen overflow-hidden relative flex-1
                ${selectedGroupId ? 'flex fixed w-full inset-0 z-50 md:static bg-white' : 'hidden md:flex items-center justify-center bg-transparent'}
            `}>
                {selectedGroupId ? (
                    // This wrapper ensures the animation plays when the ID changes
                    <div key={selectedGroupId} className="w-full h-full animate-slide-in-right">
                        <GroupChat 
                            groupId={selectedGroupId} 
                            onBack={() => setSelectedGroupId(null)} 
                        />
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center p-10 animate-fade-in">
                        <div className="inline-block p-6 bg-white/60 backdrop-blur-sm rounded-full mb-4 shadow-sm">
                            <Users className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-500">Select a group</h3>
                        <p className="text-sm text-gray-400 mt-1">Click on a group from the left to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}