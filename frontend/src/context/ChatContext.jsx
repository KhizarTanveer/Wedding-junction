import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";
import { showWarning, showSuccess } from "../utils/toast";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Track if we've shown connection error toast to avoid spamming
  const hasShownErrorToast = useRef(false);
  const hasShownReconnectToast = useRef(false);
  const socketRef = useRef(null);

  /**
   * Clear all chat state (called on logout)
   */
  const clearChatState = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setConnected(false);
    setConnectionError(null);
    setIsReconnecting(false);
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    setTyping({});
    setUnreadCounts({});
    setOnlineUsers(new Set());
    hasShownErrorToast.current = false;
    hasShownReconnectToast.current = false;
  }, []);

  // Handler functions - defined before initializeSocket to avoid race condition
  const handleNewMessage = useCallback((data) => {
    const { message, conversationId } = data;

    // Verify the user has access to this conversation before adding messages
    // Only update if the conversation exists in the user's conversation list
    setConversations((prevConversations) => {
      const conversationExists = prevConversations.some((conv) => conv._id === conversationId);

      // If conversation doesn't exist in user's list, don't process this message
      if (!conversationExists) {
        return prevConversations;
      }

      // Dispatch custom event for Chat.jsx to handle (only for valid conversations)
      window.dispatchEvent(
        new CustomEvent("new_message", {
          detail: { conversationId, message },
        })
      );

      // Update conversation list with new message
      return prevConversations.map((conv) =>
        conv._id === conversationId
          ? {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
            }
          : conv
      );
    });

    setMessages((prev) => {
      // Only add if this is the active conversation
      if (prev.length > 0 && prev[0]?.conversation === conversationId) {
        // Check if message already exists
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      }
      return prev;
    });
  }, []);

  const handleMessageNotification = useCallback((data) => {
    const { conversationId } = data;

    // Update unread count
    setUnreadCounts((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || 0) + 1,
    }));
  }, []);

  const handleTyping = useCallback((data) => {
    const { conversationId, userId, userName, isTyping } = data;

    setTyping((prev) => {
      if (isTyping) {
        return { ...prev, [conversationId]: { userId, userName } };
      } else {
        const newTyping = { ...prev };
        delete newTyping[conversationId];
        return newTyping;
      }
    });
  }, []);

  const handleMessagesRead = useCallback((data) => {
    const { conversationId } = data;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.conversation === conversationId ? { ...msg, isRead: true } : msg
      )
    );
  }, []);

  const handleUserOnline = useCallback((data) => {
    setOnlineUsers((prev) => new Set([...prev, data.userId]));
  }, []);

  const handleUserOffline = useCallback((data) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  }, []);

  /**
   * Initialize socket connection
   */
  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const newSocket = io(API_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);

      // Show success toast if we were previously disconnected
      if (hasShownErrorToast.current && !hasShownReconnectToast.current) {
        showSuccess("Chat connection restored");
        hasShownReconnectToast.current = true;
      }
    });

    newSocket.on("disconnect", (reason) => {
      setConnected(false);

      // If it was a server-side disconnect or transport error, user should know
      if (reason === "io server disconnect" || reason === "transport error") {
        setConnectionError("Connection lost. Attempting to reconnect...");
      }
    });

    newSocket.on("connect_error", (error) => {
      setConnectionError(error.message || "Unable to connect to chat server");

      // Show warning toast only once per session
      if (!hasShownErrorToast.current) {
        showWarning("Chat connection issue. Some features may be unavailable.");
        hasShownErrorToast.current = true;
      }
    });

    newSocket.io.on("reconnect_attempt", (attempt) => {
      setIsReconnecting(true);
      setConnectionError(`Reconnecting... (attempt ${attempt})`);
    });

    newSocket.io.on("reconnect", () => {
      setIsReconnecting(false);
      setConnectionError(null);

      if (!hasShownReconnectToast.current) {
        showSuccess("Chat connection restored");
        hasShownReconnectToast.current = true;
      }
    });

    newSocket.io.on("reconnect_failed", () => {
      setIsReconnecting(false);
      setConnectionError("Unable to reconnect. Please refresh the page.");
    });

    // Message handlers - now guaranteed to be defined before this point
    newSocket.on("new_message", handleNewMessage);
    newSocket.on("message_notification", handleMessageNotification);
    newSocket.on("typing", handleTyping);
    newSocket.on("messages_read", handleMessagesRead);
    newSocket.on("user_online", handleUserOnline);
    newSocket.on("user_offline", handleUserOffline);

    return newSocket;
  }, [handleNewMessage, handleMessageNotification, handleTyping, handleMessagesRead, handleUserOnline, handleUserOffline]);

  // Initialize socket connection on mount
  useEffect(() => {
    const newSocket = initializeSocket();
    if (newSocket) {
      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [initializeSocket]);


  // Socket actions
  const joinConversation = useCallback(
    (conversationId) => {
      if (socket && connected) {
        socket.emit("join_conversation", conversationId);
      }
    },
    [socket, connected]
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      if (socket && connected) {
        socket.emit("leave_conversation", conversationId);
      }
    },
    [socket, connected]
  );

  const sendMessage = useCallback(
    (conversationId, content, messageType = "text") => {
      if (socket && connected) {
        socket.emit("send_message", { conversationId, content, messageType });
      }
    },
    [socket, connected]
  );

  const startTyping = useCallback(
    (conversationId) => {
      if (socket && connected) {
        socket.emit("typing_start", conversationId);
      }
    },
    [socket, connected]
  );

  const stopTyping = useCallback(
    (conversationId) => {
      if (socket && connected) {
        socket.emit("typing_stop", conversationId);
      }
    },
    [socket, connected]
  );

  const markAsRead = useCallback(
    (conversationId) => {
      if (socket && connected) {
        socket.emit("mark_read", conversationId);
        // Clear local unread count
        setUnreadCounts((prev) => {
          const newCounts = { ...prev };
          delete newCounts[conversationId];
          return newCounts;
        });
      }
    },
    [socket, connected]
  );

  // Get total unread count
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const value = {
    socket,
    connected,
    connectionError,
    isReconnecting,
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    typing,
    unreadCounts,
    totalUnread,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    clearChatState,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
