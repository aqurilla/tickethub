# Tickethub
A ticketing application implemented using a microservices based architecture

## Application features:
- Client using React & Next.js
- Services run using Docker & Kubernetes
- Skaffold for managing Kubernetes deployments & services
- Database-per-service
- Event-bus
- Typescript
- Testing
- Handling concurrency issues
- Central library as an NPM module for shared code 

## Observed issues:
- `ts-node-dev` can have issues if the resources specified in the deployment file
  are too restrictive. Using the `--poll` flag with with `ts-node-dev` may also help in some cases. It is also recommended
  to use the `node:lts-alpine` base image
