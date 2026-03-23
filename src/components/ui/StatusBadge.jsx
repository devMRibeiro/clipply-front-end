import React from 'react'

var STATUS_MAP = {
  SCHEDULED:  { label: 'Agendado',   className: 'badge-info' },
  CONFIRMED:  { label: 'Confirmado', className: 'badge-success' },
  CANCELLED:  { label: 'Cancelado',  className: 'badge-danger' },
  COMPLETED:  { label: 'Concluído',  className: 'badge-neutral' },
  NO_SHOW:    { label: 'Não veio',   className: 'badge-warning' },
}

function StatusBadge(props) {
  var status = props.status
  var config = STATUS_MAP[status] || { label: status, className: 'badge-neutral' }

  return React.createElement(
    'span',
    { className: config.className },
    config.label
  )
}

export default StatusBadge
