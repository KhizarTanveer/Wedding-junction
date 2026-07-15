import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../config/api";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        setConversations(data.conversations);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startConversation = async (vendorId, service, message) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId, service, message }),
      });

      const data = await response.json();

      if (data.status === "success") {
        if (!data.isExisting) {
          setConversations((prev) => [data.conversation, ...prev]);
        }
        return data.conversation;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    conversations,
    setConversations,
    loading,
    error,
    refetch: fetchConversations,
    startConversation,
  };
}

export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchMessages = useCallback(
    async (page = 1) => {
      if (!conversationId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/chat/${conversationId}?page=${page}&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.status === "success") {
          setConversation(data.conversation);
          setMessages(data.messages);
          setPagination(data.pagination);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (content, messageType = "text") => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/chat/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content, messageType }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setMessages((prev) => [...prev, data.message]);
        return data.message;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      throw err;
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/api/chat/${conversationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return {
    messages,
    setMessages,
    conversation,
    loading,
    error,
    pagination,
    refetch: fetchMessages,
    sendMessage,
    markAsRead,
  };
}

export default useConversations;
