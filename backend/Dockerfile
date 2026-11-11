# API de ReservaUPLA en un contenedor (Render). Compila con el SDK de .NET 10 y publica en la imagen de ejecución.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS compilar
WORKDIR /origen
COPY src/ReservaUPLA.Domain/ReservaUPLA.Domain.csproj src/ReservaUPLA.Domain/
COPY src/ReservaUPLA.Application/ReservaUPLA.Application.csproj src/ReservaUPLA.Application/
COPY src/ReservaUPLA.Infrastructure/ReservaUPLA.Infrastructure.csproj src/ReservaUPLA.Infrastructure/
COPY src/ReservaUPLA.WebApi/ReservaUPLA.WebApi.csproj src/ReservaUPLA.WebApi/
RUN dotnet restore src/ReservaUPLA.WebApi/ReservaUPLA.WebApi.csproj
COPY . .
RUN dotnet publish src/ReservaUPLA.WebApi/ReservaUPLA.WebApi.csproj -c Release -o /aplicacion --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS ejecutar
WORKDIR /aplicacion
COPY --from=compilar /aplicacion .
# Render entrega el puerto en PORT; en local se usa 8080.
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} exec dotnet ReservaUPLA.WebApi.dll"]
