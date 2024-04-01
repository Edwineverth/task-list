### Sistema de Tareas en Segundo Plano con NestJS, Redis y Bull

Este proyecto implementa un sistema de gestión de tareas en segundo plano utilizando NestJS como framework de backend, Redis para almacenamiento de datos y manejo de estado, y Bull como librería de colas para procesar tareas asincrónicamente.

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

Node.js (Preferiblemente la última versión LTS)
Docker y Docker Compose
Un cliente Redis (opcional para pruebas directas en Redis)

### Docker Compose para Redis
Utiliza el siguiente esquema en tu archivo docker-compose.yml para configurar y ejecutar una instancia de Redis:
```yaml
version: '3'
services:
  redis:
    image: redis:latest
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:

```
### Iniciar el Proyecto
Para iniciar tu proyecto NestJS junto con Redis:

```sh
docker-compose up -d
npm i
npm start
```
### Limpieza de Redis
Una vez que todas las tareas de un lote han sido procesadas, el sistema automáticamente limpia las claves relacionadas en Redis para mantener la base de datos ordenada y eficiente.


### Actualización de Tareas:

```curl
curl --location 'http://localhost:3000/task/subscribe' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTE5MTAxNzYsImV4cCI6MTcxMTkxMDIzNn0.I0m1lqw_VDozs4g4ihl_a3BNzrM48H8MOE4cB-j87iQ'
```
### API Swagger: 
http://localhost:3000/api-docs#/

## Autorización
Para acceder a las rutas protegidas, necesitas enviar un token de autorización en el encabezado de la solicitud. Puedes obtener un token de autorización enviando una solicitud POST a la ruta /auth/login con un cuerpo de solicitud JSON que contenga las credenciales de usuario.

```json
{
  "username": "admin",
  "password": "admin"
}
```
## Collection Postman 
TASK_LIST.postman_collection.json


## Autor
- [Edwin Belduma](https://github.com/Edwineverth)
