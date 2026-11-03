namespace ReservaUPLA.Domain.Common;

// Reglas de un campo de texto. Reutilizable: cada entidad declara las suyas y ErroresDeValidacion las aplica.
// «Nombre» va al inicio de los mensajes («El motivo debe…»); «Mensaje_Obligatorio» se muestra si llega vacío.
public sealed record ReglaDeTexto(string Nombre, int Minimo, int Maximo, string Mensaje_Obligatorio);
