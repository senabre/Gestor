export default {
  // Auth
  login: 'Login',
  signup: 'Sign up',
  email: 'Email',
  password: 'Password',
  loading: 'Processing...',
  hasAccount: 'Already have an account? Log in',
  noAccount: "Don't have an account? Sign up",
  operationSuccess: 'Operation completed successfully',
  operationError: 'An error occurred. Please try again',

  // Navigation
  teams: 'Teams',
  fees: 'Fees',
  staff: 'Staff',
  playerSalaries: 'Salaries',
  invoices: 'Invoices',
  settings: 'Settings',
  logout: 'Log out',

  // Teams
  addTeam: 'Add Team',
  editTeam: 'Edit Team',
  teamName: 'Team name',
  confirmDeleteTeam: 'Are you sure you want to delete this team?',
  edit: 'Edit',
  delete: 'Delete',
  cancel: 'Cancel',
  save: 'Save',
  create: 'Create',

  // Fees
  teamFees: 'Team Fees',
  totalPlayers: 'Total Players',
  totalFees: 'Total Fees',
  totalCollected: 'Total Collected',
  totalPending: 'Total Pending',
  players: 'Players',
  collected: 'Collected',
  pending: 'Pending',
  collectionProgress: 'Collection Progress',
  viewDetails: 'View details',

  // Payments
  payments: 'Payments',
  registerPayment: 'Register Payment',
  date: 'Date',
  amount: 'Amount',
  receiptNumber: 'Receipt No.',
  notes: 'Notes',
  actions: 'Actions',
  printReceipt: 'Print receipt',
  noPayments: 'No payments registered',
  confirmDeletePayment: 'Are you sure you want to delete this payment? This action cannot be undone.',
  errorDeletingPayment: 'Error deleting payment. Please try again.',

  // Settings
  otherSettings: 'Other Settings',
  theme: 'Theme',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  language: 'Language',
  langEs: 'Spanish',
  langVal: 'Valencian',
  langEn: 'English'
} as const;