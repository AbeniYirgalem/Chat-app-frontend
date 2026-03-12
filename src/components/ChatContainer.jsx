import { useEffect, useRef, useState } from "react";
import { CheckIcon, CheckCheckIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [contextMessageId, setContextMessageId] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const closeMenu = () => setContextMessageId(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("contextmenu", closeMenu);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("contextmenu", closeMenu);
    };
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader />
      <div className="flex-1 px-3 sm:px-6 overflow-y-auto py-4 sm:py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${
                  msg.senderId === authUser._id ? "chat-end" : "chat-start"
                } px-1 sm:px-2`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMessageId(msg._id);
                  }}
                >
                  {contextMessageId === msg._id && (
                    <div className="absolute -top-3 right-1 flex gap-2 text-[11px] text-slate-200 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded shadow-lg z-10">
                      <button
                        onClick={() => deleteMessage(msg._id, "me")}
                        className="hover:text-white transition-colors"
                        aria-label="Delete for me"
                      >
                        Delete
                      </button>
                      {msg.senderId === authUser._id && (
                        <button
                          onClick={() => deleteMessage(msg._id, "everyone")}
                          className="hover:text-white transition-colors"
                          aria-label="Delete for everyone"
                        >
                          Delete for all
                        </button>
                      )}
                    </div>
                  )}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-40 sm:h-48 object-cover max-w-full"
                    />
                  )}
                  {msg.text && (
                    <p className="mt-2 break-words whitespace-pre-line">
                      {msg.text}
                    </p>
                  )}
                  <div className="text-xs mt-1 opacity-75 flex items-center gap-2 justify-end">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.senderId === authUser._id && (
                      <span className="flex items-center gap-1">
                        {msg.isRead ? (
                          <CheckCheckIcon
                            className="w-4 h-4"
                            aria-label="Seen"
                          />
                        ) : (
                          <CheckIcon className="w-4 h-4" aria-label="Sent" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;
