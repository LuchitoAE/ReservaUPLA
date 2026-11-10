namespace ReservaUPLA.Domain.Comun;

// Lo único que se guarda de una contraseña: su sal y su hash. La contraseña misma nunca se guarda.
public sealed record ContrasenaCifrada(byte[] Sal, byte[] Hash);
