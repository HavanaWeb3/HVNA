'use client';

import { useEffect, useState, useCallback } from 'react';
import type { UserFilter } from '@/lib/utils/bot-detection';

interface UserAnalysis {
  isLikelyBot: boolean;
  isSuspicious: boolean;
  isProtected: boolean;
  botScore: number;
  indicators: Array<{
    type: string;
    reason: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  recommendation: 'safe_to_delete' | 'needs_review' | 'protected';
}

interface AdminUser {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  avatar: string | null;
  emailVerified: boolean;
  status: string | null;
  trustScore: number | null;
  createdAt: string;
  isAdmin: boolean;
  _count: {
    posts: number;
    followers: number;
    following: number;
    comments: number;
    likes: number;
  };
  analysis: UserAnalysis;
}

interface UsersResponse {
  users: AdminUser[];
  counts: Record<UserFilter, number>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type DialogType = 'delete' | 'bulk-delete' | 'contact' | null;

interface DialogState {
  type: DialogType;
  user?: AdminUser;
  users?: AdminUser[];
}

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState<Record<UserFilter, number>>({
    all: 0,
    verified: 0,
    unverified: 0,
    'likely-bots': 0,
    suspicious: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog state
  const [dialog, setDialog] = useState<DialogState>({ type: null });
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        filter,
        search,
        page: page.toString(),
        limit: '50'
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        const responseData = data as UsersResponse;
        setUsers(responseData.users);
        setCounts(responseData.counts);
        setTotal(responseData.total);
        setTotalPages(responseData.totalPages);
      } else {
        setError((data as { error?: string }).error || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const handleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteUser = async (user: AdminUser, reason?: string) => {
    setActionLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (reason) {
        headers['X-Deletion-Reason'] = reason;
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (response.ok) {
        setDialog({ type: null });
        setDeleteReason('');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: Array.from(selectedIds),
          confirmedBotsOnly: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setDialog({ type: null });
        setSelectedIds(new Set());
        fetchUsers();
      } else {
        setError(data.error || 'Failed to delete users');
      }
    } catch (err) {
      setError('Failed to delete users');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactUser = async (user: AdminUser, message: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Account Notice from Contentlynk',
          message,
          reason: 'unusual_username'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setDialog({ type: null });
        alert('Contact logged successfully');
      } else {
        setError(data.error || 'Failed to contact user');
      }
    } catch (err) {
      setError('Failed to contact user');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PROBATION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status || 'ACTIVE'] || 'bg-gray-100 text-gray-800';
  };

  const filterTabs: Array<{ id: UserFilter; label: string; icon: string }> = [
    { id: 'all', label: 'All Users', icon: '👥' },
    { id: 'verified', label: 'Verified', icon: '✓' },
    { id: 'unverified', label: 'Unverified', icon: '⚠️' },
    { id: 'likely-bots', label: 'Likely Bots', icon: '🤖' },
    { id: 'suspicious', label: 'Needs Review', icon: '🔍' }
  ];

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            👥 User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage user accounts with smart bot detection
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                filter === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {filter === 'likely-bots' && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={selectedIds.size === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Select all ({users.length})
              </label>
              <button
                onClick={() => {
                  const selectedUsers = users.filter(u => selectedIds.has(u.id));
                  setDialog({ type: 'bulk-delete', users: selectedUsers });
                }}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Delete {selectedIds.size} Bots
              </button>
            </div>
          )}

          {filter !== 'likely-bots' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              💡 Switch to &quot;Likely Bots&quot; filter to enable bulk deletion
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{counts.all}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.verified}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Verified</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{counts.unverified}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unverified</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{counts['likely-bots']}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Likely Bots</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{counts.suspicious}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Needs Review</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No users found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              {search ? 'Try adjusting your search' : 'No users match this filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  {filter === 'likely-bots' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <span className="sr-only">Select</span>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      user.analysis.isLikelyBot ? 'bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    {filter === 'likely-bots' && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {user.username[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </span>
                            {user.isAdmin && (
                              <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.analysis.isLikelyBot && (
                              <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded">
                                🤖 Bot
                              </span>
                            )}
                            {user.analysis.isSuspicious && !user.analysis.isLikelyBot && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
                                🔍 Review
                              </span>
                            )}
                            {user.emailVerified && user.analysis.indicators.some(i => i.type === 'username') && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                                👤 Unusual
                              </span>
                            )}
                            {user.analysis.isProtected && (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded">
                                🛡️ Protected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-300 text-sm">
                        {user.email || <span className="text-gray-400">No email</span>}
                      </div>
                      <div className="text-xs mt-1">
                        {user.emailVerified ? (
                          <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400">⚠️ Unverified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status || 'ACTIVE'}
                      </span>
                      {user.trustScore !== null && user.trustScore !== 100 && (
                        <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                          Trust: {user.trustScore}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>{user._count.posts} posts</div>
                      <div>{user._count.followers} followers</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.emailVerified && user.email && (
                          <button
                            onClick={() => setDialog({ type: 'contact', user })}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            Contact
                          </button>
                        )}
                        <button
                          onClick={() => setDialog({ type: 'delete', user })}
                          disabled={user.isAdmin}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {dialog.type === 'delete' && dialog.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {dialog.user.analysis.isLikelyBot ? (
                // Simple bot deletion dialog
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🤖 Delete Bot Account?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This account has been identified as a likely bot:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {dialog.user.analysis.indicators.map((indicator, i) => (
                      <li key={i}>{indicator.reason}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    This will permanently delete this account and any associated data.
                  </p>
                </>
              ) : dialog.user.emailVerified ? (
                // Protected/verified user dialog
                <>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                    ⚠️ WARNING: Delete Verified User?
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      This user has a VERIFIED email address.
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                      They may be a legitimate user with an unusual username.
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p><strong>User:</strong> {dialog.user.username}</p>
                    <p><strong>Email:</strong> {dialog.user.email} ✓ VERIFIED</p>
                    <p><strong>Joined:</strong> {new Date(dialog.user.createdAt).toLocaleDateString()}</p>
                    <p><strong>Posts:</strong> {dialog.user._count.posts}</p>
                    <p><strong>Followers:</strong> {dialog.user._count.followers}</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for deletion (required):
                    </label>
                    <textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter reason for deleting this verified user..."
                    />
                  </div>
                </>
              ) : (
                // Suspicious/needs review dialog
                <>
                  <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
                    🔍 Delete User Requiring Review?
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p><strong>User:</strong> {dialog.user.username}</p>
                    <p><strong>Email:</strong> {dialog.user.email || 'None'}</p>
                    <p><strong>Status:</strong> {dialog.user.status || 'ACTIVE'}</p>
                    <p><strong>Activity:</strong> {dialog.user._count.posts} posts, {dialog.user._count.followers} followers</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                      This account has mixed signals:
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                      {dialog.user.analysis.indicators.map((indicator, i) => (
                        <li key={i}>{indicator.reason}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDialog({ type: null });
                    setDeleteReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                {dialog.user.emailVerified && dialog.user.email && (
                  <button
                    onClick={() => setDialog({ type: 'contact', user: dialog.user })}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Contact User
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(dialog.user!, deleteReason || undefined)}
                  disabled={actionLoading || (dialog.user.emailVerified && !deleteReason.trim())}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : dialog.user.emailVerified ? '⚠️ Delete Anyway' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Dialog */}
      {dialog.type === 'bulk-delete' && dialog.users && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🤖 Delete Bot Accounts?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You are about to delete <strong>{dialog.users.length}</strong> accounts identified as likely bots:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-4">
                <li>Unverified emails</li>
                <li>Zero activity</li>
                <li>Random usernames</li>
              </ul>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                This will permanently delete these accounts and any associated data.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDialog({ type: null })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : `Delete ${dialog.users.length} Bots`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact User Dialog */}
      {dialog.type === 'contact' && dialog.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📧 Contact User: {dialog.user.username}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Send an email to: <strong>{dialog.user.email}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message:
                </label>
                <textarea
                  id="contactMessage"
                  rows={6}
                  defaultValue={`Dear ${dialog.user.username},

We noticed your account has an unusual username that may have been auto-generated during registration. If you'd like to change it to something more memorable, you can do so in your profile settings.

If you need any assistance, please reply to this email.

Best regards,
Contentlynk Team`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDialog({ type: null })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const textarea = document.getElementById('contactMessage') as HTMLTextAreaElement;
                    handleContactUser(dialog.user!, textarea.value);
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Bot Detection Logic:</strong> Users are flagged as likely bots when they have unverified emails,
          zero activity (no posts, followers, or engagement), and random-looking usernames. Users with verified emails,
          corporate email domains, or any content activity are protected from accidental deletion.
        </p>
      </div>
    </div>
  );
}
