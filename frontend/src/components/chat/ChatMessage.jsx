import { Check, CheckCheck, AlertCircle } from 'lucide-react';

export default function ChatMessage({ message, currentUser, isLastInGroup }) {
    const isOwnMessage = message.sender._id === currentUser?._id;
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getDeliveryStatus = () => {
        if (message.failed) {
            return <AlertCircle size={14} className="text-red-400" />;
        }
        if (message.read) {
            return <CheckCheck size={14} className="text-blue-400" />;
        }
        if (message.delivered) {
            return <CheckCheck size={14} className="text-gray-400" />;
        }
        // Default: sent (single tick)
        return <Check size={14} className="text-gray-400" />;
    };

    return (
        <div className={`flex gap-2 items-start ${isLastInGroup ? 'mb-3' : 'mb-0.5'} ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Small Avatar for received messages (WhatsApp-style) */}
            {!isOwnMessage && (
                <div className={`flex-shrink-0 w-[26px] h-[26px] ${isLastInGroup ? 'visible' : 'invisible'}`}>
                    <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold text-[11px] overflow-hidden">
                        {message.sender?.avatar ? (
                            <img
                                src={message.sender.avatar} 
                                alt={message.sender.fullName} 
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <>
                                {message.sender.fullName?.charAt(0).toUpperCase() || '?'}
                            </> 
                        )}
                    </div>
                </div>
            )}

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender Name (only for other's messages and first in group) */}
                {!isOwnMessage && isLastInGroup && (
                    <span className="text-[11px] text-gray-500 font-medium mb-0.5 pl-0.5">
                        {message.sender.fullName}
                    </span>
                )}

                {/* Message Content */}
                <div
                    className={`px-3 py-1.5 rounded-2xl shadow-sm ${
                        isOwnMessage
                            ? 'bg-slate-800 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap break-words m-0 leading-snug">
                        {message.content}
                    </p>
                </div>

                {/* Timestamp and Status */}
                <div className={`flex items-center gap-[3px] mt-0.5 px-0.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[11px] text-gray-400">
                        {formatTime(message.createdAt)}
                    </span>
                    {isOwnMessage && (
                        <span className="flex items-center ml-[1px]">
                            {getDeliveryStatus()}
                        </span>
                    )}
                </div>
            </div>

            {/* Spacer for own messages to maintain alignment */}
            {isOwnMessage && (
                <div className="w-[26px] flex-shrink-0"></div>
            )}
        </div>
    );
}

export function DateSeparator({ date }) {
    const formatDate = (dateStr) => {
        const msgDate = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time parts for comparison
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        msgDate.setHours(0, 0, 0, 0);

        if (msgDate.getTime() === today.getTime()) {
            return 'TODAY';
        } else if (msgDate.getTime() === yesterday.getTime()) {
            return 'YESTERDAY';
        } else {
            return msgDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            }).toUpperCase();
        }
    };

    return (
        <div className="flex items-center justify-center my-4 gap-3">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="text-[11px] text-gray-400 font-medium tracking-wider">
                {formatDate(date)}
            </span>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
        </div>
    );
}

export function TypingIndicator({ typingUsers }) {
    if (!typingUsers || typingUsers.length === 0) return null;

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0]} is typing`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
        } else {
            return 'Multiple people are typing';
        }
    };

    return (
        <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-7 flex-shrink-0"></div>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-2xl">
                <span className="text-sm text-gray-600">{getTypingText()}</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}

export function NewMessageIndicator({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-medium animate-bounce"
        >
            <span>↓</span>
            <span>New messages</span>
        </button>
    );
}
