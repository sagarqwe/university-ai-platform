export function formatTime(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

export function formatDate(ts) {
  if (!ts) return 'Invalid Date';
  try { return new Date(ts).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

export function getConfidenceColor(score) {
  if (score >= 0.8) return '#34d399';
  if (score >= 0.5) return '#fbbf24';
  return '#f87171';
}

export function parseApiError(err) {
  if (!err) return 'An unknown error occurred';
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error)   return err.response.data.error;
  if (err.message) return err.message;
  return 'Request failed';
}

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str, n = 80) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
