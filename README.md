# CMS Backend Services

This repository contains the backend microservices for our Content Management System (CMS) project.

## Project Structure

This is a monorepo containing the following services:

- `api-gateway/`: Express.js API Gateway / Backend for Frontend (BFF)
- `auth-service/`: Nest.js Authentication Service
- `content-service/`: Nest.js Content Management Service
- `user-management-service/`: Nest.js User Management Service
- `analytics-service/`: Nest.js Analytics Service
- `media-service/`: Nest.js Media Management Service
- `search-service/`: Nest.js Search Service
- `shared/`: Shared libraries and utilities

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker and Docker Compose
- MongoDB and PostgreSQL (can be run in Docker)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/cms-backend-services.git
   cd cms-backend-services
   ```

2. Install dependencies for all services:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` in each service directory and update the values as needed.

### Running the Services

To run all services:

```
docker-compose up
```

To run a specific service:

```
cd <service-name>
npm run start:dev
```

## Development

- Follow the coding standards and guidelines outlined in our project documentation.
- Write unit and integration tests for new features.
- Use the shared libraries in the `shared/` directory for common functionality.

## API Documentation

API documentation is available through Swagger UI when running each service. Access it at:

`http://localhost:<service-port>/api-docs`

## Contributing

Please read our CONTRIBUTING.md file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
