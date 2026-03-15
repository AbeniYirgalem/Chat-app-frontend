import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  hasSocketListener: false,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    const updatedChats = get().chats.map((chat) =>
      chat._id === selectedUser?._id ? { ...chat, unreadCount: 0 } : chat,
    );
    set({ selectedUser, chats: updatedChats });
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // refresh chats to update unread counts
      await get().getMyChatPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  initializeSocketListener: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || get().hasSocketListener) return;

    socket.on("newMessage", (newMessage) => {
      get().handleIncomingMessage(newMessage);
    });

    socket.on("messageDeleted", ({ messageId }) => {
      get().handleMessageDeleted(messageId);
    });

    socket.on("messagesRead", ({ messageIds }) => {
      get().markMessagesRead(messageIds);
    });

    set({ hasSocketListener: true });
  },

  handleIncomingMessage: (newMessage) => {
    const { selectedUser, messages, isSoundEnabled, chats, allContacts } =
      get();
    const { authUser } = useAuthStore.getState();
    const isIncoming = newMessage.receiverId === authUser?._id;
    const isCurrentChat =
      selectedUser &&
      (newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id);

    if (isCurrentChat) {
      set({ messages: [...messages, newMessage] });
    }

    if (isIncoming && !isCurrentChat) {
      const existingChat = chats.find(
        (chat) => chat._id === newMessage.senderId,
      );

      if (existingChat) {
        const updatedChats = chats.map((chat) =>
          chat._id === newMessage.senderId
            ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 }
            : chat,
        );
        set({ chats: updatedChats });
      } else {
        const contact = allContacts.find((c) => c._id === newMessage.senderId);
        const fallbackName = "New message";
        const newChat = {
          _id: newMessage.senderId,
          fullName: contact?.fullName || fallbackName,
          profilePic: contact?.profilePic,
          unreadCount: 1,
        };
        set({ chats: [...chats, newChat] });
      }
    }

    if (isIncoming && isSoundEnabled) {
      const notificationSound = new Audio("/sounds/notification.mp3");
      notificationSound.currentTime = 0;
      notificationSound
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
  },

  handleMessageDeleted: (messageId) => {
    const { messages } = get();
    set({ messages: messages.filter((msg) => msg._id !== messageId) });
  },

  markMessagesRead: (messageIds = []) => {
    if (!messageIds.length) return;
    const idsSet = new Set(messageIds.map(String));
    const updated = get().messages.map((msg) =>
      idsSet.has(msg._id?.toString()) ? { ...msg, isRead: true } : msg,
    );
    set({ messages: updated });
  },

  deleteMessage: async (messageId, scope = "me") => {
    try {
      await axiosInstance.delete(`/messages/${messageId}?scope=${scope}`);
      get().handleMessageDeleted(messageId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },
}));
