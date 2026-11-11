namespace ReservaUPLA.Domain.Comun;

// Reglas de un campo de texto. Reutilizable: cada entidad declara las suyas y ErroresDeValidacion las aplica.
// «Nombre» va al inicio de los mensajes («El motivo debe…»); «MensajeObligatorio» se muestra si llega vacío.
public sealed record ReglaDeTexto(string Nombre, int Minimo, int Maximo, string MensajeObligatorio);
