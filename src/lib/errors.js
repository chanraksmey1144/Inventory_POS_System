import { ApiError } from './api'

const STATUS_MESSAGES = {
  400: 'The request was invalid. Please review the information and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource could not be found.',
  422: 'Please check the highlighted fields and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) {
    if (error.status && STATUS_MESSAGES[error.status]) {
      return STATUS_MESSAGES[error.status]
    }
    return error.message
  }
  if (error?.message) return error.message
  return 'An unexpected error occurred. Please try again.'
}

export function fieldErrors(error) {
  if (error instanceof ApiError && error.errors && typeof error.errors === 'object') {
    const result = {}
    Object.entries(error.errors).forEach(([key, messages]) => {
      result[key] = Array.isArray(messages) ? messages[0] : messages
    })
    return result
  }
  return {}
}
