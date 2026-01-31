/**
 * Validation utilities for form inputs
 */

export function validateStatusCode(code: number): string | null {
  if (code < 100 || code > 599) {
    return 'Status code must be between 100 and 599';
  }
  return null;
}

export function validateJSON(value: string): string | null {
  if (!value.trim()) return null;
  try {
    JSON.parse(value);
    return null;
  } catch (err) {
    return 'Invalid JSON syntax';
  }
}

export function validateHeaderName(name: string): string | null {
  if (!name.trim()) {
    return 'Header name cannot be empty';
  }
  if (!/^[a-zA-Z0-9-]+$/.test(name)) {
    return 'Header name can only contain letters, numbers, and hyphens';
  }
  return null;
}

export function validateHeaderValue(value: string): string | null {
  // Header values can contain most ASCII characters except control characters
  if (/[\x00-\x1F\x7F]/.test(value)) {
    return 'Header value contains invalid control characters';
  }
  return null;
}

export function validateURL(url: string): string | null {
  if (!url.trim()) {
    return 'URL cannot be empty';
  }
  try {
    new URL(url);
    return null;
  } catch (err) {
    return 'Invalid URL format';
  }
}

export function validateRateLimit(limit: number): string | null {
  if (limit < 0) {
    return 'Rate limit cannot be negative';
  }
  if (limit > 10000) {
    return 'Rate limit too high (max: 10000)';
  }
  return null;
}

export function validateMaxRequests(max: number): string | null {
  if (max < 0) {
    return 'Max requests cannot be negative';
  }
  if (max > 100000) {
    return 'Max requests too high (max: 100000)';
  }
  return null;
}
