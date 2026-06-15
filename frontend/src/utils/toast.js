export const toast = {
  success: (message) => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { id: Date.now().toString(), message, type: 'success' } }));
  },
  error: (message) => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { id: Date.now().toString(), message, type: 'error' } }));
  }
};
