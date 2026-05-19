import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions that take getToken from useAuth() and optional clerkId fallback
export const syncUserProfile = async (getToken, userData) => {
  const token = await getToken();
  const res = await api.post('/users/sync', userData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getUserProfile = async (getToken, clerkId) => {
  const token = await getToken();
  const res = await api.get(`/users/profile?clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateUserPreferences = async (getToken, clerkId, preferences) => {
  const token = await getToken();
  const res = await api.put('/users/preferences', { clerkId, preferences }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Bookmarks
export const addBookmarkAPI = async (getToken, bookmarkData) => {
  const token = await getToken();
  const res = await api.post('/bookmarks', bookmarkData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getBookmarksAPI = async (getToken, clerkId) => {
  const token = await getToken();
  const res = await api.get(`/bookmarks?clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteBookmarkAPI = async (getToken, id, clerkId) => {
  const token = await getToken();
  const res = await api.delete(`/bookmarks/${id}?clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const checkBookmarkAPI = async (getToken, url, clerkId) => {
  const token = await getToken();
  const res = await api.get(`/bookmarks/check?url=${encodeURIComponent(url)}&clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Comments
export const getCommentsAPI = async (articleUrl) => {
  const res = await api.get(`/comments?articleUrl=${encodeURIComponent(articleUrl)}`);
  return res.data;
};

export const addCommentAPI = async (getToken, commentData) => {
  const token = await getToken();
  const res = await api.post('/comments', commentData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteCommentAPI = async (getToken, id, clerkId) => {
  const token = await getToken();
  const res = await api.delete(`/comments/${id}?clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Likes
export const getArticleLikesAPI = async (articleUrl, clerkId) => {
  const res = await api.get(`/likes?articleUrl=${encodeURIComponent(articleUrl)}&clerkId=${clerkId || ''}`);
  return res.data;
};

export const toggleLikeAPI = async (getToken, likeData) => {
  const token = await getToken();
  const res = await api.post('/likes/toggle', likeData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Notifications
export const getNotificationsAPI = async (getToken, clerkId) => {
  const token = await getToken();
  const res = await api.get(`/notifications?clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const markNotificationReadAPI = async (getToken, id, clerkId) => {
  const token = await getToken();
  const res = await api.put(`/notifications/${id}/read`, { clerkId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Admin
export const getAdminStatsAPI = async (getToken, clerkId) => {
  const token = await getToken();
  const res = await api.get(`/users/admin/stats?clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllUsersAPI = async (getToken, clerkId) => {
  const token = await getToken();
  const res = await api.get(`/users/admin/users?clerkId=${clerkId || ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateUserRoleAPI = async (getToken, id, role, clerkId) => {
  const token = await getToken();
  const res = await api.put(`/users/admin/users/${id}/role`, { role, clerkId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Summaries
export const getArticleSummaryAPI = async (summaryData) => {
  const res = await api.post('/summaries', summaryData);
  return res.data;
};
