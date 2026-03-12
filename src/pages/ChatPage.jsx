import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, initializeSocketListener } = useChatStore();
  const { socket } = useAuthStore();

  useEffect(() => {
    initializeSocketListener();
  }, [initializeSocketListener, socket]);

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[calc(100vh-48px)] min-h-[620px] px-2 sm:px-4">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div
          className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col min-h-0`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className={`${selectedUser ? "flex" : "hidden"} md:flex flex-1 flex-col bg-slate-900/50 backdrop-blur-sm min-h-0`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
