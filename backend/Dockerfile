# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar arquivos de projeto
COPY ["src/CatalogOrders.Api/CatalogOrders.Api.csproj", "src/CatalogOrders.Api/"]
COPY ["src/CatalogOrders.Application/CatalogOrders.Application.csproj", "src/CatalogOrders.Application/"]
COPY ["src/CatalogOrders.Domain/CatalogOrders.Domain.csproj", "src/CatalogOrders.Domain/"]
COPY ["src/CatalogOrders.Infrastructure/CatalogOrders.Infrastructure.csproj", "src/CatalogOrders.Infrastructure/"]

# Restaurar dependências
RUN dotnet restore "src/CatalogOrders.Api/CatalogOrders.Api.csproj"

# Copiar todo o código fonte
COPY . .

# Build da aplicação
WORKDIR "/src/src/CatalogOrders.Api"
RUN dotnet build "CatalogOrders.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "CatalogOrders.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Instalar curl para healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Criar diretório para logs
RUN mkdir -p /app/logs

# Copiar arquivos publicados
COPY --from=publish /app/publish .

# Expor porta
EXPOSE 8080
EXPOSE 8081

# Variáveis de ambiente
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/swagger/index.html || exit 1

# Entry point
ENTRYPOINT ["dotnet", "CatalogOrders.Api.dll"]

