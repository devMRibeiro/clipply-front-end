// Roles de usuário
var ROLES = {
  ADMIN:        'ADMIN',
  PROFESSIONAL: 'PROFESSIONAL',
  SUPPORT:      'SUPPORT',
}

// Status de agendamento
var APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW:   'NO_SHOW',
}

// Dias da semana (na ordem usada pela API)
var DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export { ROLES, APPOINTMENT_STATUS, DAYS_OF_WEEK }
