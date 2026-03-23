// ─── Formatação de data/hora ─────────────────────────────

var DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  day:   '2-digit',
  month: '2-digit',
  year:  'numeric',
})

var TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  hour:   '2-digit',
  minute: '2-digit',
})

var DATETIME_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  day:    '2-digit',
  month:  '2-digit',
  year:   'numeric',
  hour:   '2-digit',
  minute: '2-digit',
})

var WEEKDAY_MAP = {
  MONDAY:    'Segunda-feira',
  TUESDAY:   'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY:  'Quinta-feira',
  FRIDAY:    'Sexta-feira',
  SATURDAY:  'Sábado',
  SUNDAY:    'Domingo',
}

// Formata "2024-07-15T10:30:00" → "15/07/2024"
function formatDate(isoString) {
  if (!isoString) return '—'
  return DATE_FORMAT.format(new Date(isoString))
}

// Formata "2024-07-15T10:30:00" → "10:30"
function formatTime(isoString) {
  if (!isoString) return '—'
  return TIME_FORMAT.format(new Date(isoString))
}

// Formata "2024-07-15T10:30:00" → "15/07/2024 10:30"
function formatDateTime(isoString) {
  if (!isoString) return '—'
  return DATETIME_FORMAT.format(new Date(isoString))
}

// "HH:MM:SS" ou "HH:MM" → "10:30"
function formatLocalTime(timeString) {
  if (!timeString) return '—'
  return timeString.substring(0, 5)
}

// MONDAY → "Segunda-feira"
function formatDayOfWeek(day) {
  return WEEKDAY_MAP[day] || day
}

// ─── Formatação de moeda ─────────────────────────────────
var CURRENCY_FORMAT = new Intl.NumberFormat('pt-BR', {
  style:    'currency',
  currency: 'BRL',
})

function formatCurrency(value) {
  if (value === null || value === undefined) return '—'
  return CURRENCY_FORMAT.format(value)
}

// ─── Formatação de telefone ──────────────────────────────
// "11999999999" → "(11) 99999-9999"
function formatPhone(phone) {
  if (!phone) return '—'
  var digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 7) + '-' + digits.substring(7)
  }
  if (digits.length === 10) {
    return '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 6) + '-' + digits.substring(6)
  }
  return phone
}

// ─── Texto ───────────────────────────────────────────────

// Pega as iniciais de um nome: "João Silva" → "JS"
function getInitials(name) {
  if (!name) return '?'
  var parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Trunca texto longo
function truncate(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '…'
}

export {
  formatDate,
  formatTime,
  formatDateTime,
  formatLocalTime,
  formatDayOfWeek,
  formatCurrency,
  formatPhone,
  getInitials,
  truncate,
}
