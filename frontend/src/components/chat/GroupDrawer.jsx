import { X, Crown, MapPin, Calendar, Clock, User, Users, CheckCircle, XCircle, UserPlus, UserMinus } from 'lucide-react';

export default function GroupDrawer({ group, currentUser, isOpen, onClose, onAcceptInvite, onRejectInvite, onRemoveMember }) {
    if (!isOpen) return null;

    const isAdmin = currentUser && group.admin._id === currentUser._id;
    const userInvite = group.invites?.find(inv => inv.user._id === currentUser._id);

    const formatDateTime = (datetime) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get ride details of current user from member
    const rideDetails = group.members && group.members.length > 0 ? group.members.find(m => m.user._id === currentUser._id)?.ride : null;

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        // For names like "User1", return first and last character e.g. "U1"
        if (name.length > 1) {
            return (name[0] + name[name.length - 1]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px]"
                onClick={onClose}
            ></div>

            {/* Drawer Panel */}
            <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
                
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-5 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">Group details</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 border border-gray-300 text-gray-500 rounded-full hover:bg-gray-50 transition-colors"
                        aria-label="Close drawer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-8">
                    
                    {/* Group Info Section */}
                    <section>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                            Group Information
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                            <div className="flex justify-between items-center px-4 py-3.5">
                                <span className="text-sm text-gray-500">Name</span>
                                <span className="text-sm font-bold text-gray-900">{group.name}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3.5">
                                <span className="text-sm text-gray-500">Created by</span>
                                <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                    <Crown size={14} className="text-gray-400" />
                                    {group?.admin?.fullName || 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3.5">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className="text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                    {group.status === 'open' ? 'Active' : group.status}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Ride Details Section */}
                    {rideDetails && (
                        <section>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                                Ride Details
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                                <div className="px-4 py-3.5">
                                    <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
                                        <MapPin size={14} />
                                        <span className="text-sm">Route</span>
                                    </div>
                                    <p className="text-sm text-gray-900 leading-relaxed">
                                        {rideDetails.source} &rarr; {rideDetails.destination}
                                    </p>
                                </div>
                                <div className="px-4 py-3.5">
                                    <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
                                        <Calendar size={14} />
                                        <span className="text-sm">Date & time</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                        {formatDateTime(rideDetails.datetime)}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Members List Section */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                Members
                            </h3>
                            <span className="text-xs font-medium text-slate-500">{group.members?.length || 0}</span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                            {group.members?.map((member) => {
                                const isMemberAdmin = member.user?._id === group.admin?._id;
                                const isReady = member.isReady === true;
                                
                                return (
                                    <div key={member.user._id} className="flex items-center justify-between px-4 py-3.5">
                                        <div className="flex items-center gap-3.5">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
                                                {member.user?.avatar ? (
                                                    <img src={member.user.avatar} alt={member.user.fullName} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    getInitials(member.user.fullName)
                                                )}
                                            </div>
                                            
                                            {/* Info */}
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                    {member.user?.fullName}
                                                    {isMemberAdmin && <Crown size={14} className="text-gray-400" />}
                                                </p>
                                                <p className={`text-xs mt-0.5 ${isReady ? 'text-green-700' : 'text-slate-400'}`}>
                                                    {isReady ? 'Ready' : 'Not Ready'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {isAdmin && !isMemberAdmin && (
                                            <button
                                                onClick={() => onRemoveMember?.(member.user)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                aria-label="Remove member"
                                            >
                                                <UserMinus size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Pending Invites for Current User */}
                    {userInvite && (
                        <section>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                                Your Pending Invite
                            </h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                                <p className="text-sm text-gray-700 mb-3">
                                    You have a pending invite to join this group.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onAcceptInvite?.(userInvite._id)}
                                        className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <CheckCircle size={16} />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => onRejectInvite?.(userInvite._id)}
                                        className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Admin Controls Section */}
                    {isAdmin && (
                        <section>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                                Admin Controls
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <button className="w-full px-4 py-3.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-900">
                                    <UserPlus size={16} className="text-gray-500" />
                                    Add Member
                                </button>
                                {group.requests && group.requests.length > 0 && (
                                    <>
                                        <div className="border-t border-gray-100"></div>
                                        <div className="px-4 py-3.5 bg-blue-50/50 flex justify-between items-center">
                                            <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                                                <Users size={16} /> {group.requests.length} Join Request(s)
                                            </p>
                                            <button className="text-sm text-blue-600 hover:underline font-medium">
                                                Review
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Future Feature Placeholder */}
                    <section className="opacity-50">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                            Live Location Sharing
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <p className="text-sm text-gray-500 mb-3">
                                Share your real-time location with group members during the ride.
                            </p>
                            <button
                                disabled
                                className="w-full bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed text-sm font-medium"
                            >
                                Coming Soon
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </>
    );
}
