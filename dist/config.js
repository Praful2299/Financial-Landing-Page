window.FUNDING_CONFIG = {
  // Enable only after completing README launch setup, policies and testing.
  submissionEnabled: false,
  offers: Array.from({length: 9}, (_, i) => ({
    name: `Partner placement ${String(i + 1).padStart(2, '0')}`,
    description: 'Provider details and borrowing information will appear here.',
    url: '',
    category: 'Borrowing provider'
  }))
};
