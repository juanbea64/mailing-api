# Mailing API

API REST para gestión de suscripciones de mailing construida con NestJS y PostgreSQL.

## 🚀 Tecnologías

- **NestJS** - Framework de Node.js
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Base de datos
- **TypeScript** - Lenguaje de programación

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## ⚙️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/mailing-api.git
cd mailing-api
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar `.env` con tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=tiendana_mailing
```

5. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE tiendana_mailing;
```

6. Ejecutar migraciones:
```bash
npm run migration:run
```

7. Iniciar la aplicación:
```bash
npm run start:dev
```

## 📚 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/mailing` | Crear nueva suscripción |
| `GET` | `/mailing` | Obtener todas las suscripciones |

## 📝 Ejemplos de uso

### Crear suscripción básica
```bash
curl -X POST http://localhost:3000/mailing \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com"}'
```

### Crear suscripción completa
```bash
curl -X POST http://localhost:3000/mailing \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "user_id": "user-123",
    "items": [
      {"mailing_type": 1, "is_active": true},
      {"mailing_type": 2, "is_active": true}
    ]
  }'
```

### Tipos de mailing
| Valor | Tipo |
|-------|------|
| 1 | Newsletter |
| 2 | Promotions |
| 3 | Updates |

### Obtener todas las suscripciones
```bash
curl http://localhost:3000/mailing
```

## 🗃️ Scripts disponibles

```bash
# Desarrollo
npm run start:dev      # Iniciar en modo desarrollo
npm run start:watch    # Iniciar con hot-reload

# Producción
npm run build          # Compilar TypeScript
npm run start          # Iniciar en producción

# Migraciones
npm run migration:generate src/migrations/NombreMigracion  # Generar migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir última migración
```

## 📁 Estructura del proyecto

```
src/
├── main.ts                 # Punto de entrada
├── app.module.ts           # Módulo principal
├── data-source.ts          # Configuración de TypeORM
├── mailing/
│   ├── mailing.module.ts
│   ├── mailing.controller.ts
│   ├── mailing.service.ts
│   ├── dto/
│   │   └── create-mailing.dto.ts
│   └── entities/
│       ├── mailing.entity.ts
│       └── item-mailing.entity.ts
└── migrations/             # Migraciones de base de datos
```

## 📄 Licencia

ISC
