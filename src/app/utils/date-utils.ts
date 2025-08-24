/**
 * Utility functions for date formatting and handling
 */

/**
 * Safely converts various date formats to a Date object
 * @param date - Date to convert (can be Date, Firestore Timestamp, string, or number)
 * @returns Date object or null if invalid
 */
export function safeDate(date: any): Date | null {
  try {
    if (!date) {
      return null;
    }
    
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      const converted = date.toDate();
      return isNaN(converted.getTime()) ? null : converted;
    }
    
    // Handle string or number
    if (typeof date === 'string' || typeof date === 'number') {
      const converted = new Date(date);
      return isNaN(converted.getTime()) ? null : converted;
    }
    
    return null;
  } catch (error) {
    console.warn('Error converting date:', error, date);
    return null;
  }
}

/**
 * Formats a date for display with fallback handling
 * @param date - Date to format
 * @param fallback - Fallback text if date is invalid (default: 'Invalid date')
 * @returns Formatted date string
 */
export function formatDate(date: any, fallback: string = 'Invalid date'): string {
  const safeD = safeDate(date);
  if (!safeD) {
    return fallback;
  }
  
  try {
    return safeD.toLocaleDateString();
  } catch (error) {
    console.warn('Error formatting date:', error, date);
    return fallback;
  }
}

/**
 * Formats a date and time for display with fallback handling
 * @param date - Date to format
 * @param fallback - Fallback text if date is invalid (default: 'Invalid date')
 * @returns Formatted datetime string
 */
export function formatDateTime(date: any, fallback: string = 'Invalid date'): string {
  const safeD = safeDate(date);
  if (!safeD) {
    return fallback;
  }
  
  try {
    return safeD.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting datetime:', error, date);
    return fallback;
  }
}

/**
 * Formats a date relative to now (e.g., "2h ago", "Just now")
 * @param date - Date to format
 * @param fallback - Fallback text if date is invalid (default: 'Invalid date')
 * @returns Relative time string
 */
export function formatRelativeDate(date: any, fallback: string = 'Invalid date'): string {
  const safeD = safeDate(date);
  if (!safeD) {
    return fallback;
  }
  
  try {
    const now = new Date();
    const diffMs = now.getTime() - safeD.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return safeD.toLocaleDateString();
  } catch (error) {
    console.warn('Error formatting relative date:', error, date);
    return fallback;
  }
}

/**
 * Formats a date for a specific locale and options
 * @param date - Date to format
 * @param locale - Locale string (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 * @param fallback - Fallback text if date is invalid (default: 'Invalid date')
 * @returns Formatted date string
 */
export function formatDateCustom(
  date: any, 
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  fallback: string = 'Invalid date'
): string {
  const safeD = safeDate(date);
  if (!safeD) {
    return fallback;
  }
  
  try {
    return safeD.toLocaleDateString(locale, options);
  } catch (error) {
    console.warn('Error formatting custom date:', error, date);
    return fallback;
  }
}
