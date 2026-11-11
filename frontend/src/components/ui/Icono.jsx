// Íconos de línea del menú y de los indicadores. Son decorativos (aria-hidden): el texto de al lado dice lo mismo.
const TRAZOS = {
  inicio: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
  reservas: 'M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  nueva: 'M12 8v8M8 12h8M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  ambientes: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
  usuarios: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3',
  pendiente: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  aprobada: 'M8 12.5l2.5 2.5L16 9.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  rechazada: 'M9 9l6 6M15 9l-6 6M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  cancelada: 'M5.6 5.6l12.8 12.8M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  total: 'M4 20V11M10 20V5M16 20v-6M3 20h18',
  estrella: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  codigo: 'M3 6h18v12H3zM7 9h3v6H7zM13 10h5M13 14h5',
  correo: 'M3 6h18v12H3zM3 7l9 6 9-6',
  candado: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9zM12 15v2',
  ojo: 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  'ojo-tachado':
    'M4 4l16 16M9.6 6.2A10.6 10.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-2.6 3.2M6.3 8.2C3.6 9.9 2 12 2 12s3.6 6.5 10 6.5c1.2 0 2.3-.2 3.3-.5M10.3 10.3a2.5 2.5 0 0 0 3.4 3.4',
  llave: 'M13.25 7.25C13.25 8.4927 12.2427 9.5 11 9.5C9.7573 9.5 8.75 8.4927 8.75 7.25C8.75 6.0073 9.7573 5 11 5C12.2427 5 13.25 6.0073 13.25 7.25M11 9.5L11 17.75M11 13.25L13.25 13.25M11 15.5L12.5 15.5',
  altavoz: 'M4 9v6h4l5 4V5L8 9H4zM17 8.5a5 5 0 0 1 0 7M19.5 6a8 8 0 0 1 0 12',
  persona: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0',
  cuenta: 'M11 11C12.6567 11 14 9.6569 14 8C14 6.3431 12.6567 5 11 5C9.3433 5 8 6.3431 8 8C8 9.6569 9.3433 11 11 11M5 17.75C5 14.4363 7.6863 11.75 11 11.75C14.3137 11.75 17 14.4363 17 17.75',
  salir: 'M13.25 5L15.5 5C16.3284 5 17 5.6715 17 6.5L17 15.5C17 16.3284 16.3284 17 15.5 17L13.25 17M9.5 14L6.5 11L9.5 8M6.5 11L14 11',
  sol: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  luna: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  cerrar: 'M6 6l12 12M18 6 6 18',
  error: 'M12 7.5v5M12 16h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  info: 'M12 11v5M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  buscar: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  'sin-conexion': 'M4 4l16 16M8.6 8.6a11 11 0 0 1 10.8 2.1M2 10.5a15 15 0 0 1 3.3-2M5.5 14a8.7 8.7 0 0 1 5.4-2.3M8.7 17.5a4.5 4.5 0 0 1 4.2-.9M12 20h.01',
  reintentar: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  anterior: 'M15 18l-6-6 6-6',
  siguiente: 'M9 18l6-6-6-6',
  pausa: 'M9 6v12M15 6v12',
  reproducir: 'M8 5.5v13l10-6.5z',
}

export function Icono({ nombre, className = 'size-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  )
}
