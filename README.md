# CMS Backend Services

This repository contains the backend microservices for the StoryPull (CMS) project.

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

## Git Flow Workflow
1. Create the develop branch: This branch will be used for ongoing development work. A develop branch is created from the main branch.
2. Create feature branches: When starting work on a new feature or bug fix, create a new feature branch from the develop branch.
3. Develop and merge the feature branch into develop: Make any necessary changes to your local code on the feature branch. Once the feature is complete and tested, merge the branch back into the develop branch.
4. Create the release branch: When it’s time to prepare a new release, create a new release branch from the develop branch with a descriptive name that includes the version number, for example, release/1.0. Test the release thoroughly to catch any bugs or issues to ensure it’s production-ready.
5. Merge the release branch into main: Once the release is ready, merge the release branch into the main branch and tag it with a version number. Use a pull request to ensure code reviews and approval from other team members.
6. Repeat the process: Once the release is complete, switch back to the develop branch and start the process over again with a new feature branch.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

