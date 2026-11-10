// Identificador de una reserva: el UUID que genera PostgreSQL. Lo que no tenga esta forma no es una reserva, así que
// «/reservas/nuevas» es una dirección que no existe (diseño C02) y no el detalle de una reserva.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const esIdentificadorDeReserva = (valor) => UUID.test(valor ?? '')
