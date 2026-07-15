import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await res.json();
      setStats(data.data);
      setLoading(false);
    } catch (err) {
      setError("Unable to load dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApprove = async (userId) => {
    if (!window.confirm("Are you sure you want to approve this vendor application?")) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/admin/vendor-applications/${userId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Vendor application approved successfully!");
        fetchStats(); // Refresh the data
      } else {
        alert(data.message || "Failed to approve application");
      }
    } catch (err) {
      alert("Failed to approve application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled

    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/admin/vendor-applications/${userId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Vendor application rejected");
        fetchStats(); // Refresh the data
      } else {
        alert(data.message || "Failed to reject application");
      }
    } catch (err) {
      alert("Failed to reject application");
    } finally {
      setActionLoading(null);
    }
  };

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

  const statCards = [
    {
      title: "Total Vendors",
      count: stats?.counts?.vendors || 0,
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      link: "/admin/vendors",
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Categories",
      count: stats?.counts?.categories || 0,
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      link: "/admin/categories",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Services",
      count: stats?.counts?.services || 0,
      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      link: "/admin/services",
      color: "from-violet-500 to-purple-500",
    },
    {
      title: "Users",
      count: stats?.counts?.users || 0,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Bookings",
      count: stats?.counts?.bookings || 0,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "from-rose-500 to-pink-500",
    },
    {
      title: "Pending Applications",
      count: stats?.counts?.pendingApplications || 0,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "from-amber-500 to-yellow-500",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Admin Panel
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-800 mt-2">
            Dashboard
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-12">
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
                {card.link && (
                  <Link
                    to={card.link}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Manage →
                  </Link>
                )}
              </div>
              <p className="text-3xl font-serif font-semibold text-slate-800">
                {card.count}
              </p>
              <p className="text-sm text-stone-500 mt-1">{card.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <Link
            to="/admin/vendors"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Add New Vendor</h3>
                <p className="text-sm text-stone-500">
                  Create a new vendor listing
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/categories"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Add New Category</h3>
                <p className="text-sm text-stone-500">Create a new category</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/services"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Add New Service</h3>
                <p className="text-sm text-stone-500">Create a new service</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Pending Vendor Applications */}
        {stats?.pendingVendorApplications?.length > 0 && (
          <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-slate-800">
                Pending Vendor Applications
              </h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {stats.counts?.pendingApplications || 0} pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Applicant
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Business Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Applied On
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pendingVendorApplications.map((application) => (
                    <tr
                      key={application._id}
                      className="border-b border-stone-100 hover:bg-warm-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-slate-700 font-medium">{application.name}</p>
                          <p className="text-stone-500 text-sm">{application.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {application.vendorApplication?.businessName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {application.vendorApplication?.serviceCategory || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-sm">
                        {application.vendorApplication?.appliedAt
                          ? new Date(application.vendorApplication.appliedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(application._id)}
                            disabled={actionLoading === application._id}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === application._id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(application._id)}
                            disabled={actionLoading === application._id}
                            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100">
          <h2 className="text-xl font-serif text-slate-800 mb-6">
            Recent Bookings
          </h2>

          {stats?.recentBookings?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
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
                            booking.isConfirmed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {booking.isConfirmed ? "Confirmed" : "Pending"}
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
      </div>
    </section>
  );
}

export default Dashboard;
