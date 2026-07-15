import { useEffect, useState, useRef } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { API_URL } from "../../config/api";
import { showSuccess } from "../../utils/toast";

function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    connected,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    typing,
  } = useChat();

  // Conversation list state
  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // Active chat state
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConversationId, setDeleteConversationId] = useState(null);

  // Message edit/delete state
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showMessageDeleteModal, setShowMessageDeleteModal] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [messageActionLoading, setMessageActionLoading] = useState(false);

  // Mobile state - show chat panel on mobile when conversation is selected
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // State to track if we're starting a conversation (replaces useRef for proper state)
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  // Safe JSON.parse for localStorage with try-catch
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  })();
  const isVendor = currentUser.role === "vendor";
  const isAdmin = currentUser.role === "admin";

  // Helper function to get display name for conversation list
  const getConversationDisplayInfo = (conv) => {
    if (isAdmin) {
      // Admin sees both parties - show "User → Vendor" format
      const userName = conv.user?.name || "Unknown User";
      const vendorName = conv.vendor?.name || "Unknown Vendor";
      return {
        name: `${userName} → ${vendorName}`,
        image: conv.vendor?.image || conv.user?.avatar,
        initial: vendorName.charAt(0)?.toUpperCase() || userName.charAt(0)?.toUpperCase() || "?",
      };
    }
    const other = isVendor ? conv.user : conv.vendor;
    return {
      name: other?.name || "Unknown",
      image: other?.image || other?.avatar,
      initial: other?.name?.charAt(0)?.toUpperCase() || "?",
    };
  };

  // Handle starting a conversation when coming from vendor page
  useEffect(() => {
    const vendorId = searchParams.get("vendor");
    if (vendorId && !isVendor) {
      startConversationWithVendor(vendorId);
    } else {
      fetchConversations();
    }
  }, [searchParams]);

  // Load conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
      setMobileShowChat(true);
    } else {
      setConversation(null);
      setMessages([]);
      setMobileShowChat(false);
    }
  }, [conversationId]);

  // Join/leave conversation socket room
  useEffect(() => {
    if (conversationId && connected) {
      joinConversation(conversationId);
    }
    return () => {
      if (conversationId && connected) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, connected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { conversationId: msgConvId, message } = event.detail || {};
      if (!message) return;

      // Update active chat messages
      if (msgConvId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      }

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === msgConvId) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              // Increment unread if not the active conversation
              ...(msgConvId !== conversationId && {
                [isVendor ? "unreadCountVendor" : "unreadCountUser"]:
                  (conv[isVendor ? "unreadCountVendor" : "unreadCountUser"] ||
                    0) + 1,
              }),
            };
          }
          return conv;
        })
      );
    };

    window.addEventListener("new_message", handleNewMessage);
    return () => window.removeEventListener("new_message", handleNewMessage);
  }, [conversationId, isVendor]);

  // Listen for message updates (edits)
  useEffect(() => {
    const handleMessageUpdated = (event) => {
      const { conversationId: msgConvId, message } = event.detail || {};
      if (!message || msgConvId !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) => (m._id === message._id ? message : m))
      );
    };

    window.addEventListener("message_updated", handleMessageUpdated);
    return () => window.removeEventListener("message_updated", handleMessageUpdated);
  }, [conversationId]);

  // Listen for message deletes
  useEffect(() => {
    const handleMessageDeleted = (event) => {
      const { conversationId: msgConvId, message } = event.detail || {};
      if (!message || msgConvId !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) => (m._id === message._id ? message : m))
      );
    };

    window.addEventListener("message_deleted", handleMessageDeleted);
    return () => window.removeEventListener("message_deleted", handleMessageDeleted);
  }, [conversationId]);

  const startConversationWithVendor = async (vendorId) => {
    // Prevent duplicate calls using state (proper React pattern)
    if (isStartingConversation) return;
    setIsStartingConversation(true);

    try {
      const token = localStorage.getItem("token");
      const vendorRes = await fetch(`${API_URL}/api/vendors/${vendorId}`);
      const vendorData = await vendorRes.json();

      if (!vendorRes.ok) {
        setListError("Vendor not found");
        setListLoading(false);
        return;
      }

      const vendor = vendorData.vendor;
      const res = await fetch(`${API_URL}/api/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId: vendorId,
          service: vendor.service,
          message: "",
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        navigate(`/chat/${data.conversation._id}`, { replace: true });
        fetchConversations();
      } else {
        setListError(data.message || "Failed to start conversation");
        setListLoading(false);
      }
    } catch (err) {
      setListError("Failed to start conversation");
      setListLoading(false);
    } finally {
      setIsStartingConversation(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setConversations(data.conversations);
      } else {
        setListError(data.message);
      }
    } catch (err) {
      setListError("Failed to fetch conversations");
    } finally {
      setListLoading(false);
    }
  };

  const fetchConversation = async (id) => {
    setChatLoading(true);
    setChatError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setConversation(data.conversation);
        setMessages(data.messages);
        markAsRead(id);
        // Clear unread count in list
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === id
              ? {
                  ...conv,
                  [isVendor ? "unreadCountVendor" : "unreadCountUser"]: 0,
                }
              : conv
          )
        );
      } else {
        setChatError(data.message);
      }
    } catch (err) {
      setChatError("Failed to load conversation");
    } finally {
      setChatLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversationId) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Create optimistic message for immediate UI feedback
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content: messageContent,
      sender: { _id: currentUser.id },
      createdAt: new Date().toISOString(),
      messageType: "text",
      isOptimistic: true,
    };

    try {
      if (connected) {
        // Add optimistic message
        setMessages((prev) => [...prev, optimisticMessage]);
        socketSendMessage(conversationId, messageContent);
        setSending(false);
        inputRef.current?.focus();
      } else {
        // Add optimistic message for HTTP fallback too
        setMessages((prev) => [...prev, optimisticMessage]);

        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/api/chat/${conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: messageContent }),
          }
        );

        const data = await res.json();
        if (data.status === "success") {
          // Replace optimistic message with real one
          setMessages((prev) => {
            const filtered = prev.filter((m) => m._id !== optimisticMessage._id);
            if (filtered.some((m) => m._id === data.message._id)) {
              return filtered;
            }
            return [...filtered, data.message];
          });
        } else {
          // Rollback optimistic message on failure
          setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
          setChatError("Failed to send message");
        }
        setSending(false);
        inputRef.current?.focus();
      }
    } catch (err) {
      // Rollback optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
      setChatError("Failed to send message");
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value && connected) {
      startTyping(conversationId);
    } else if (connected) {
      stopTyping(conversationId);
    }
  };

  const handleUpdatePrice = async () => {
    if (!newPrice) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat/${conversationId}/price`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price: Number(newPrice) }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setConversation(data.conversation);
        setMessages((prev) => [...prev, data.message]);
        setShowPriceModal(false);
        setNewPrice("");
      }
    } catch (err) {
      setChatError("Failed to update price");
    }
  };

  const handleCreateBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat/${conversationId}/booking`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setConversation((prev) => ({
          ...prev,
          booking: data.booking._id,
          status: "booking_created",
        }));
        setMessages((prev) => [...prev, data.message]);
        showSuccess("Booking created successfully!");
      }
    } catch (err) {
      setChatError("Failed to create booking");
    }
  };

  const handleBackToList = () => {
    navigate("/chat");
    setMobileShowChat(false);
  };

  const handleDeleteClick = (e, convId) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConversationId(convId);
    setShowDeleteModal(true);
  };

  const handleDeleteConversation = async () => {
    if (!deleteConversationId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat/${deleteConversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        // Remove from local state
        setConversations((prev) =>
          prev.filter((conv) => conv._id !== deleteConversationId)
        );

        // If deleted conversation was active, navigate away
        if (conversationId === deleteConversationId) {
          navigate("/chat");
          setConversation(null);
          setMessages([]);
          setMobileShowChat(false);
        }

        setShowDeleteModal(false);
        setDeleteConversationId(null);
      } else {
        setChatError(data.message || "Failed to delete conversation");
      }
    } catch (err) {
      setChatError("Failed to delete conversation");
    }
  };

  // Check if message can be edited (within 15 minutes)
  const canEditMessage = (msg) => {
    if (msg.isDeleted || msg.messageType !== "text") return false;
    const messageAge = Date.now() - new Date(msg.createdAt).getTime();
    const editWindowMs = 15 * 60 * 1000;
    return messageAge <= editWindowMs;
  };

  // Start editing a message
  const handleEditClick = (msg) => {
    setEditingMessage(msg);
    setEditContent(msg.content);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  // Save edited message
  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;

    setMessageActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat/messages/${editingMessage._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setMessages((prev) =>
          prev.map((m) => (m._id === data.message._id ? data.message : m))
        );
        setEditingMessage(null);
        setEditContent("");
      } else {
        setChatError(data.message || "Failed to edit message");
      }
    } catch (err) {
      setChatError("Failed to edit message");
    } finally {
      setMessageActionLoading(false);
    }
  };

  // Confirm delete message
  const handleDeleteMessageClick = (msgId) => {
    setDeleteMessageId(msgId);
    setShowMessageDeleteModal(true);
  };

  // Delete message
  const handleDeleteMessage = async () => {
    if (!deleteMessageId) return;

    setMessageActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat/messages/${deleteMessageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setMessages((prev) =>
          prev.map((m) => (m._id === data.message._id ? data.message : m))
        );
        setShowMessageDeleteModal(false);
        setDeleteMessageId(null);
      } else {
        setChatError(data.message || "Failed to delete message");
      }
    } catch (err) {
      setChatError("Failed to delete message");
    } finally {
      setMessageActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Active",
      },
      agreed: { bg: "bg-blue-100", text: "text-blue-700", label: "Price Agreed" },
      booking_created: {
        bg: "bg-violet-100",
        text: "text-violet-700",
        label: "Booking Created",
      },
      closed: { bg: "bg-stone-100", text: "text-stone-600", label: "Closed" },
    };
    return badges[status] || badges.active;
  };

  // For chat header display
  const getChatHeaderInfo = () => {
    if (!conversation) return { name: "", image: null, initial: "?" };
    if (isAdmin) {
      const userName = conversation.user?.name || "Unknown User";
      const vendorName = conversation.vendor?.name || "Unknown Vendor";
      return {
        name: `${userName} ↔ ${vendorName}`,
        image: conversation.vendor?.image,
        initial: vendorName.charAt(0)?.toUpperCase() || "?",
      };
    }
    const other = isVendor ? conversation.user : conversation.vendor;
    return {
      name: other?.name || "Unknown",
      image: other?.image || other?.avatar,
      initial: other?.name?.charAt(0)?.toUpperCase() || "?",
    };
  };
  const chatHeaderInfo = getChatHeaderInfo();
  const typingUser = typing[conversationId];

  // Render conversation list sidebar
  const renderSidebar = () => (
    <div
      className={`${
        mobileShowChat ? "hidden md:flex" : "flex"
      } flex-col w-full md:w-80 lg:w-96 bg-white border-r border-stone-200 h-full`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-stone-200">
        <h2 className="text-xl font-serif text-slate-800">Messages</h2>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {listLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="spinner-luxury"></div>
          </div>
        ) : listError ? (
          <div className="p-4 text-red-600 text-sm">{listError}</div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {conversations.map((conv) => {
              const unreadCount = isAdmin
                ? 0 // Admin doesn't have personal unread count
                : isVendor
                ? conv.unreadCountVendor
                : conv.unreadCountUser;
              const displayInfo = getConversationDisplayInfo(conv);
              const isActive = conv._id === conversationId;
              const badge = getStatusBadge(conv.status);

              return (
                <Link
                  key={conv._id}
                  to={`/chat/${conv._id}`}
                  className={`block p-4 hover:bg-stone-50 transition-colors relative group ${
                    isActive ? "bg-orange-50 border-l-4 border-orange-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full ${isAdmin ? "bg-gradient-to-br from-violet-100 to-purple-100" : "bg-gradient-to-br from-orange-100 to-amber-100"} flex items-center justify-center flex-shrink-0`}>
                      {displayInfo.image ? (
                        <img
                          src={displayInfo.image}
                          alt={displayInfo.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className={`${isAdmin ? "text-violet-600" : "text-orange-600"} font-medium`}>
                          {displayInfo.initial}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-slate-800 truncate text-sm">
                          {displayInfo.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                              {unreadCount}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteClick(e, conv._id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                            title="Delete conversation"
                          >
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {conv.context?.service}
                      </p>
                      <p className="text-xs text-stone-600 truncate mt-1">
                        {conv.lastMessage?.content || "No messages yet"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs text-stone-400">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 text-stone-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-stone-500 text-sm mb-3">No conversations yet</p>
            {!isVendor && (
              <Link
                to="/vendors"
                className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Browse Vendors
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render chat area
  const renderChatArea = () => (
    <div
      className={`${
        mobileShowChat ? "flex" : "hidden md:flex"
      } flex-col flex-1 h-full bg-warm-50`}
    >
      {conversationId && conversation ? (
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-stone-200 p-4 flex items-center gap-4">
            {/* Mobile back button */}
            <button
              onClick={handleBackToList}
              aria-label="Back to conversation list"
              className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className={`w-12 h-12 rounded-full ${isAdmin ? "bg-gradient-to-br from-violet-100 to-purple-100" : "bg-gradient-to-br from-orange-100 to-amber-100"} flex items-center justify-center flex-shrink-0`}>
              {chatHeaderInfo.image ? (
                <img
                  src={chatHeaderInfo.image}
                  alt={chatHeaderInfo.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className={`${isAdmin ? "text-violet-600" : "text-orange-600"} font-medium`}>
                  {chatHeaderInfo.initial}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-slate-800 truncate">
                {chatHeaderInfo.name}
              </h2>
              <p className="text-sm text-stone-500 truncate">
                {conversation?.context?.service}
              </p>
              {isAdmin && (
                <p className="text-xs text-violet-500 font-medium">Admin View</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {conversation?.context?.agreedPrice && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  Rs. {conversation.context.agreedPrice.toLocaleString("en-IN")}
                </span>
              )}
              {!connected && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                  Reconnecting...
                </span>
              )}
            </div>
          </div>

          {/* Price and Booking Actions */}
          {conversation?.status !== "closed" &&
            conversation?.status !== "booking_created" && (
              <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-center justify-between">
                <div className="text-sm text-amber-800">
                  <span className="font-medium">Original Price:</span> Rs.{" "}
                  {conversation?.context?.originalPrice?.toLocaleString("en-IN")}
                  {conversation?.context?.agreedPrice && (
                    <>
                      {" "}
                      <span className="font-medium">Agreed:</span> Rs.{" "}
                      {conversation.context.agreedPrice.toLocaleString("en-IN")}
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {isVendor && (
                    <button
                      onClick={() => setShowPriceModal(true)}
                      className="px-3 py-1 bg-violet-500 text-white rounded-lg text-sm hover:bg-violet-600 transition-colors"
                    >
                      Set Price
                    </button>
                  )}
                  {!isVendor && conversation?.context?.agreedPrice && (
                    <button
                      onClick={handleCreateBooking}
                      className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                    >
                      Create Booking
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="spinner-luxury"></div>
              </div>
            ) : chatError ? (
              <div className="text-center text-red-600">{chatError}</div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwn =
                    msg.sender?._id === currentUser.id ||
                    msg.sender === currentUser.id;
                  const isSystem = msg.messageType === "system";
                  const isPriceUpdate = msg.messageType === "price_update";
                  const isAdminMessage = msg.senderRole === "admin";

                  if (isSystem) {
                    return (
                      <div key={msg._id} className="text-center">
                        <span className="inline-block px-4 py-2 bg-stone-100 text-stone-600 rounded-full text-sm">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  if (isPriceUpdate) {
                    return (
                      <div key={msg._id} className="text-center">
                        <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
                    >
                      <div className="relative max-w-[75%]">
                        {/* Edit/Delete buttons for own messages */}
                        {isOwn && !msg.isDeleted && (
                          <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {canEditMessage(msg) && (
                              <button
                                onClick={() => handleEditClick(msg)}
                                className="p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                                title="Edit message"
                              >
                                <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessageClick(msg._id)}
                              className="p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete message"
                            >
                              <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div
                          className={`${
                            msg.isDeleted
                              ? "bg-stone-100 border border-stone-200 text-stone-400 italic rounded-2xl"
                              : isAdminMessage
                              ? `bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-2xl ${isOwn ? "rounded-br-md" : "rounded-bl-md"}`
                              : isOwn
                              ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl rounded-br-md"
                              : "bg-white border border-stone-200 text-slate-700 rounded-2xl rounded-bl-md"
                          } px-4 py-3 shadow-soft`}
                        >
                          {isAdminMessage && !msg.isDeleted && (
                            <p className="text-xs font-semibold text-violet-200 mb-1">
                              Admin
                            </p>
                          )}
                          {msg.messageType === "image" && msg.imageUrl && !msg.isDeleted && (
                            <img
                              src={
                                msg.imageUrl.startsWith("http")
                                  ? msg.imageUrl
                                  : `${API_URL}${msg.imageUrl}`
                              }
                              alt="Shared"
                              className="rounded-lg mb-2 max-w-full"
                            />
                          )}
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isDeleted
                                ? "text-stone-400"
                                : isAdminMessage
                                ? "text-violet-100"
                                : isOwn
                                ? "text-orange-100"
                                : "text-stone-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.isEdited && !msg.isDeleted && (
                              <span className="ml-1">(edited)</span>
                            )}
                            {isOwn && msg.isRead && !msg.isDeleted && " ✓✓"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {typingUser && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 text-stone-500 rounded-2xl px-4 py-3 text-sm">
                      {typingUser.userName} is typing...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          {conversation?.status !== "closed" && (
            <form
              onSubmit={handleSend}
              className="bg-white border-t border-stone-200 p-4"
            >
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  aria-label="Message input"
                  className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  aria-label="Send message"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </form>
          )}

          {conversation?.status === "closed" && (
            <div className="bg-stone-100 p-4 text-center text-stone-500">
              This conversation is closed
            </div>
          )}
        </>
      ) : (
        // Empty state - no conversation selected
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <svg
              className="w-16 h-16 text-stone-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Select a conversation
            </h3>
            <p className="text-stone-500 text-sm">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className="h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-20">
      <div className="h-[calc(100vh-80px)] flex">
        {renderSidebar()}
        {renderChatArea()}
      </div>

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-luxury-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-serif text-slate-800 mb-4">
              Set Agreed Price
            </h3>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePrice}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Confirm Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-luxury-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-slate-800 mb-2 text-center">
              Delete Conversation
            </h3>
            <p className="text-stone-600 text-sm text-center mb-6">
              Are you sure you want to delete this conversation? This will remove
              it from your view. The other party will still see the conversation
              until they also delete it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConversationId(null);
                }}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Message Modal */}
      {editingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-luxury-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-serif text-slate-800 mb-4">
              Edit Message
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-300 focus:ring focus:ring-orange-100 outline-none mb-4 resize-none"
              rows={3}
              placeholder="Edit your message..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={messageActionLoading}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={messageActionLoading || !editContent.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {messageActionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {showMessageDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-luxury-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-slate-800 mb-2 text-center">
              Delete Message
            </h3>
            <p className="text-stone-600 text-sm text-center mb-6">
              Are you sure you want to delete this message? It will be replaced
              with "This message was deleted" for everyone in the conversation.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMessageDeleteModal(false);
                  setDeleteMessageId(null);
                }}
                disabled={messageActionLoading}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                disabled={messageActionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {messageActionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Chat;
