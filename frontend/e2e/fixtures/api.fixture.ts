/**
 * Direct API helpers for test setup/teardown
 * These functions make direct HTTP calls to the backend API
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Generic API request helper
 */
export async function apiRequest<T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: object,
  token?: string
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const status = response.status;

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText, status };
    }

    // Handle empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    return { data, status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    };
  }
}

/**
 * Login and get auth token
 */
export async function apiLogin(
  email: string,
  password: string
): Promise<{ token: string; user: any } | null> {
  const response = await apiRequest<{ token: string; user: any }>(
    '/api/auth/login',
    'POST',
    { email, password }
  );

  if (response.error || !response.data) {
    console.warn('API login failed:', response.error);
    return null;
  }

  return response.data;
}

/**
 * Create a test conversation between user and vendor
 */
export async function createTestConversation(
  token: string,
  vendorId: string
): Promise<{ id: string } | null> {
  const response = await apiRequest<{ _id: string; id?: string }>(
    '/api/conversations',
    'POST',
    { vendorId },
    token
  );

  if (response.error || !response.data) {
    console.warn('Failed to create conversation:', response.error);
    return null;
  }

  return { id: response.data._id || response.data.id || '' };
}

/**
 * Set agreed price on a conversation
 */
export async function setConversationPrice(
  token: string,
  conversationId: string,
  price: number
): Promise<boolean> {
  const response = await apiRequest(
    `/api/conversations/${conversationId}/price`,
    'PATCH',
    { agreedPrice: price },
    token
  );

  return !response.error;
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  token: string,
  conversationId: string,
  content: string
): Promise<{ id: string } | null> {
  const response = await apiRequest<{ _id: string }>(
    `/api/conversations/${conversationId}/messages`,
    'POST',
    { content },
    token
  );

  if (response.error || !response.data) {
    return null;
  }

  return { id: response.data._id };
}

/**
 * Create a booking with specific status
 */
export async function createBookingWithStatus(
  token: string,
  vendorId: string,
  status: string,
  eventData?: {
    eventDate?: string;
    eventType?: string;
    guestCount?: number;
  }
): Promise<{ bookingId: string } | null> {
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const response = await apiRequest<{ _id: string; id?: string }>(
    '/api/bookings',
    'POST',
    {
      vendorId,
      eventDate: eventData?.eventDate || defaultDate,
      eventType: eventData?.eventType || 'Wedding',
      guestCount: eventData?.guestCount || 200,
      status,
    },
    token
  );

  if (response.error || !response.data) {
    console.warn('Failed to create booking:', response.error);
    return null;
  }

  return { bookingId: response.data._id || response.data.id || '' };
}

/**
 * Create a completed booking (for review tests)
 */
export async function createCompletedBooking(
  token: string,
  vendorId: string
): Promise<{ bookingId: string } | null> {
  return createBookingWithStatus(token, vendorId, 'completed');
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  token: string,
  bookingId: string,
  status: string,
  reason?: string
): Promise<boolean> {
  const body: Record<string, any> = { status };
  if (reason) {
    body.reason = reason;
  }

  const response = await apiRequest(
    `/api/bookings/${bookingId}/status`,
    'PATCH',
    body,
    token
  );

  return !response.error;
}

/**
 * Get booking details
 */
export async function getBooking(
  token: string,
  bookingId: string
): Promise<any | null> {
  const response = await apiRequest(`/api/bookings/${bookingId}`, 'GET', undefined, token);

  if (response.error || !response.data) {
    return null;
  }

  return response.data;
}

/**
 * Delete a booking (cleanup)
 */
export async function deleteBooking(
  token: string,
  bookingId: string
): Promise<boolean> {
  const response = await apiRequest(
    `/api/bookings/${bookingId}`,
    'DELETE',
    undefined,
    token
  );

  return !response.error;
}

/**
 * Delete a conversation (cleanup)
 */
export async function deleteConversation(
  token: string,
  conversationId: string
): Promise<boolean> {
  const response = await apiRequest(
    `/api/conversations/${conversationId}`,
    'DELETE',
    undefined,
    token
  );

  return !response.error;
}

/**
 * Get list of vendors
 */
export async function getVendors(
  token?: string
): Promise<any[] | null> {
  const response = await apiRequest<any[]>('/api/vendors', 'GET', undefined, token);

  if (response.error || !response.data) {
    return null;
  }

  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Get first available vendor ID
 */
export async function getFirstVendorId(token?: string): Promise<string | null> {
  const vendors = await getVendors(token);
  if (vendors && vendors.length > 0) {
    return vendors[0]._id || vendors[0].id || null;
  }
  return null;
}

/**
 * Create a password reset token (for testing reset flow)
 */
export async function requestPasswordReset(
  email: string
): Promise<boolean> {
  const response = await apiRequest(
    '/api/auth/forgot-password',
    'POST',
    { email }
  );

  return !response.error;
}

/**
 * Cleanup test data - removes all test bookings and conversations
 * This should be called in test teardown
 */
export async function cleanupTestData(token: string): Promise<void> {
  try {
    // Get and delete user's bookings
    const bookingsResponse = await apiRequest<any[]>('/api/bookings', 'GET', undefined, token);
    if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
      for (const booking of bookingsResponse.data) {
        const bookingId = booking._id || booking.id;
        if (bookingId) {
          await deleteBooking(token, bookingId);
        }
      }
    }

    // Get and delete user's conversations
    const conversationsResponse = await apiRequest<any[]>('/api/conversations', 'GET', undefined, token);
    if (conversationsResponse.data && Array.isArray(conversationsResponse.data)) {
      for (const conversation of conversationsResponse.data) {
        const conversationId = conversation._id || conversation.id;
        if (conversationId) {
          await deleteConversation(token, conversationId);
        }
      }
    }
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
}

/**
 * Create test user via API
 */
export async function createTestUser(userData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: any } | null> {
  const response = await apiRequest<{ token: string; user: any }>(
    '/api/auth/register',
    'POST',
    {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'user',
    }
  );

  if (response.error || !response.data) {
    console.warn('Failed to create test user:', response.error);
    return null;
  }

  return response.data;
}

/**
 * Delete test user via API (cleanup)
 */
export async function deleteTestUser(token: string): Promise<boolean> {
  const response = await apiRequest('/api/users/me', 'DELETE', undefined, token);
  return !response.error;
}
