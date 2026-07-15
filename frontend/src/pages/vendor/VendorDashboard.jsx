import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config/api";

// Status badge configurations
const STATUS_CONFIG = {
  pending_setup: {
    label: "Pending Setup",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  active: {
    label: "Active",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  suspended: {
    label: "Suspended",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
  deactivated: {
    label: "Deactivated",
    color: "bg-stone-100 text-stone-700 border-stone-200",
    icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  under_review: {
    label: "Under Review",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
};

// Booking status colors for recent bookings
const BOOKING_STATUS_COLORS = {
  draft: "bg-stone-100 text-stone-600",
  requested: "bg-amber-100 text-amber-700",
  vendor_accepted: "bg-blue-100 text-blue-700",
  vendor_declined: "bg-red-100 text-red-700",
  payment_pending: "bg-purple-100 text-purple-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-cyan-100 text-cyan-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled_by_user: "bg-red-100 text-red-600",
  cancelled_by_vendor: "bg-red-100 text-red-600",
  refund_pending: "bg-orange-100 text-orange-700",
  refunded: "bg-stone-100 text-stone-600",
  disputed: "bg-red-100 text-red-700",
  resolved: "bg-teal-100 text-teal-700",
  closed: "bg-stone-100 text-stone-600",
  expired: "bg-stone-100 text-stone-500",
};

function VendorDashboard() {
  const [stats, setStats] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Use Promise.allSettled so one failed request doesn't block the other
        const [statsResult, profileResult] = await Promise.allSettled([
          fetch(`${API_URL}/api/vendor/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/vendor/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Handle stats result
        if (statsResult.status === "fulfilled" && statsResult.value.ok) {
          const statsData = await statsResult.value.json();
          setStats(statsData);
        } else if (statsResult.status === "rejected" || !statsResult.value?.ok) {
          // Stats are critical - show error but continue loading profile
          console.error("Failed to fetch dashboard stats");
        }

        // Handle profile result
        if (profileResult.status === "fulfilled" && profileResult.value.ok) {
          const profileData = await profileResult.value.json();
          setVendorProfile(profileData.data || profileData.vendor);
        } else if (profileResult.status === "rejected" || !profileResult.value?.ok) {
          // Profile failed but we can still show dashboard with available data
          console.error("Failed to fetch vendor profile");
        }

        // Only show error if both requests failed
        if (
          (statsResult.status === "rejected" || !statsResult.value?.ok) &&
          (profileResult.status === "rejected" || !profileResult.value?.ok)
        ) {
          setError("Unable to load dashboard data");
        }

        setLoading(false);
      } catch (err) {
        setError("Unable to load dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const vendorStatus = vendorProfile?.status || "active";
  const statusConfig = STATUS_CONFIG[vendorStatus] || STATUS_CONFIG.active;
  const metrics = vendorProfile?.metrics || {};

  const statCards = [
    {
      title: "Total Bookings",
      count: stats?.stats?.totalBookings || 0,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Pending",
      count: stats?.stats?.pendingBookings || 0,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-amber-500 to-yellow-500",
    },
    {
      title: "Confirmed",
      count: stats?.stats?.confirmedBookings || 0,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Completed",
      count: stats?.stats?.completedBookings || 0,
      icon: "M5 13l4 4L19 7",
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Active Chats",
      count: stats?.stats?.activeConversations || 0,
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      color: "from-violet-500 to-purple-500",
    },
  ];

  const metricCards = [
    {
      title: "Response Rate",
      value: `${metrics.responseRate || 0}%`,
      description: "Booking requests responded to",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: metrics.responseRate >= 80 ? "text-emerald-600" : metrics.responseRate >= 50 ? "text-amber-600" : "text-red-600",
    },
    {
      title: "Acceptance Rate",
      value: `${metrics.bookingAcceptRate || 0}%`,
      description: "Bookings accepted",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: metrics.bookingAcceptRate >= 70 ? "text-emerald-600" : metrics.bookingAcceptRate >= 40 ? "text-amber-600" : "text-red-600",
    },
    {
      title: "Completion Rate",
      value: `${metrics.completionRate || 0}%`,
      description: "Bookings completed successfully",
      icon: "M5 13l4 4L19 7",
      color: metrics.completionRate >= 90 ? "text-emerald-600" : metrics.completionRate >= 70 ? "text-amber-600" : "text-red-600",
    },
    {
      title: "Avg Response Time",
      value: metrics.responseTime ? `${Math.round(metrics.responseTime / 60)}h` : "N/A",
      description: "Average time to respond",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: metrics.responseTime <= 120 ? "text-emerald-600" : metrics.responseTime <= 480 ? "text-amber-600" : "text-red-600",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Status Badge */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
                Vendor Dashboard
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-2">
                Welcome Back
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4"></div>
            </div>

            {/* Vendor Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusConfig.icon} />
              </svg>
              <span className="font-medium">{statusConfig.label}</span>
            </div>
          </div>

          {/* Profile Views */}
          {metrics.profileViews > 0 && (
            <p className="text-sm text-stone-500 mt-4">
              <span className="font-medium text-slate-700">{metrics.profileViews.toLocaleString()}</span> profile views
            </p>
          )}
        </div>

        {/* Warning for non-active status */}
        {vendorStatus !== "active" && (
          <div className={`mb-8 p-4 rounded-xl border ${
            vendorStatus === "suspended" ? "bg-red-50 border-red-200 text-red-700" :
            vendorStatus === "under_review" ? "bg-blue-50 border-blue-200 text-blue-700" :
            "bg-amber-50 border-amber-200 text-amber-700"
          }`}>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">
                  {vendorStatus === "suspended" && "Your account has been suspended"}
                  {vendorStatus === "under_review" && "Your account is under review"}
                  {vendorStatus === "pending_setup" && "Please complete your profile setup"}
                  {vendorStatus === "deactivated" && "Your account is deactivated"}
                </p>
                <p className="text-sm mt-1 opacity-80">
                  {vendorStatus === "suspended" && "Please contact support for more information."}
                  {vendorStatus === "under_review" && "We're reviewing your profile. This usually takes 1-2 business days."}
                  {vendorStatus === "pending_setup" && "Complete your profile to start receiving bookings."}
                  {vendorStatus === "deactivated" && "Reactivate your account to resume receiving bookings."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 hover:shadow-elegant transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-soft`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={card.icon}
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-serif font-semibold text-slate-800">
                {card.count}
              </p>
              <p className="text-sm text-stone-500 mt-1">{card.title}</p>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="mb-12">
          <h2 className="text-xl font-serif text-slate-800 mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                    </svg>
                  </div>
                  <span className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </span>
                </div>
                <p className="font-medium text-slate-700">{metric.title}</p>
                <p className="text-xs text-stone-500 mt-1">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-luxury-xl shadow-elegant p-8 mb-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm uppercase tracking-wider mb-2">
                Total Revenue
              </p>
              <p className="text-4xl font-serif font-bold">
                Rs. {(metrics.totalRevenue || stats?.stats?.totalRevenue || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-orange-100 mt-2">
                From {stats?.stats?.completedBookings || 0} completed bookings
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/vendor/bookings"
            className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Manage Bookings</h3>
                <p className="text-sm text-stone-500">
                  View and manage your bookings
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/chat"
            className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-violet-600"
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
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Messages</h3>
                <p className="text-sm text-stone-500">
                  {stats?.stats?.unreadMessages || 0} unread messages
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/vendor/profile"
            className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Edit Profile</h3>
                <p className="text-sm text-stone-500">
                  Update your vendor profile
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-slate-800">
              Recent Bookings
            </h2>
            <Link
              to="/vendor/bookings"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {stats?.recentBookings?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Booking ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-b border-stone-100 hover:bg-warm-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                        {booking.bookingId || booking._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {booking.userName}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {booking.service}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        Rs. {booking.price?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            BOOKING_STATUS_COLORS[booking.status] || "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {booking.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-sm">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">No recent bookings</p>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-slate-800">
              Recent Conversations
            </h2>
            <Link
              to="/chat"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {stats?.recentConversations?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentConversations.map((conv) => (
                <Link
                  key={conv._id}
                  to={`/chat/${conv._id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-warm-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <span className="text-orange-600 font-medium">
                      {conv.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {conv.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-stone-500 truncate">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400">
                      {conv.lastMessage?.createdAt
                        ? new Date(conv.lastMessage.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                    {conv.unreadCountVendor > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-xs rounded-full mt-1">
                        {conv.unreadCountVendor}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">No conversations yet</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default VendorDashboard;
