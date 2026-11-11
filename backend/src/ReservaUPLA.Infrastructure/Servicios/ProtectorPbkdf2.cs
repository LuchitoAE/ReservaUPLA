using System.Security.Cryptography;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;

namespace ReservaUPLA.Infrastructure.Servicios;

// PBKDF2 con SHA-256, 600 000 iteraciones, sal aleatoria de 16 bytes y hash de 32 bytes (como NovaPortal).
// La comparación tarda lo mismo acierte o no (FixedTimeEquals): no da pistas por el tiempo de respuesta.
internal sealed class ProtectorPbkdf2 : IProtectorDeContrasenas
{
    private const int Iteraciones = 600_000;
    private const int BytesSal = 16;
    private const int BytesHash = 32;

    public ContrasenaCifrada Cifrar(string contrasena)
    {
        var sal = RandomNumberGenerator.GetBytes(BytesSal);

        return new ContrasenaCifrada(sal, Derivar(contrasena, sal));
    }

    public bool Verificar(string contrasena, ContrasenaCifrada guardada) =>
        guardada.Sal.Length > 0 && CryptographicOperations.FixedTimeEquals(Derivar(contrasena, guardada.Sal), guardada.Hash);

    private static byte[] Derivar(string contrasena, byte[] sal) =>
        Rfc2898DeriveBytes.Pbkdf2(contrasena, sal, Iteraciones, HashAlgorithmName.SHA256, BytesHash);
}
