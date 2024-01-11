# Coding Guidelines

This document outlines the structure and responsibilities of various components in our codebase. Adhering to these guidelines ensures maintainability, consistency, and efficiency in our development process.

## Folder Structure 



```md
src/app
├── commands - Command classes for handling small, abstract data manipulations.
├── core - Essential utilities and helpers used across the application.
├── builders - Classes dedicated to creating 3d objects/mesh from data
├── factories - Classes dedicated to creating complex objects or classes.
├── io - Operations related to file and folder CRUD within the OS.
├── managers - Classes managing states of various app components.
├── services - Business logic for complex backend operations.
├── tools - Utility and helper classes providing various functionalities.
├── map - Data structures for map 
├── scenario - Data structures for scenario
```


## Responsibilities

- road.model holds road data
- road.service holds data operations for roads
- road.factory holds logic to create new roads
- road.builder holds logic to create 3d object
- road.manager holds logic to manage roads and operations

### Commands
- Handle minor, abstract changes to data or visual layers.
- Should not contain complex logic, delegate to services or managers as needed.

### Factories
- Responsible for creating complex objects or classes.
- Should focus on object creation only, leaving logic for updates or management to services or managers.

### IO
- Handle all file and folder CRUD operations within the OS.

### Listeners 
- Act upon system or user events, updating objects accordingly.
- Delegate complex logic to services or managers, focusing on responding to events only.

### Managers
- Manage various application states.
- Example roles include managing active tools, current inspectors, or visual attributes of roads.
- Manage complex operations related to creation of objects

### Services
- Contain business logic for data operations.
- Centralize and standardize critical operations, making them available to external entities.

### Models
- Store and maintain consistent data.
- Can contain data validation or manipulation logic but should not handle comprehensive business logic.
- Should not trigger events, leaving that responsibility to commands or services.

### Builders
- Builders should build the object
  - MapMeshBuilder
  - RoadMeshBuilder
  - RoadObjectMeshBuilder   

Mesh Builders are responsible for building 3d objects based on map/data layer

## Additional Best Practices

### Consistency
- Maintain clear, documented purposes for all directories and components.

### Documentation
- Provide thorough documentation for each component, including its role, examples, and standards.

### Error Handling
- Implement consistent error and exception handling, especially for IO operations.

### Testing
- Establish guidelines for testing all components to ensure independent functionality and correct interactions.

### Code Review and Quality
- Encourage regular code reviews and utilize static analysis tools to uphold coding standards and clarity.

### Dependency Management
- Manage external libraries or tools effectively to prevent conflicts and ensure smooth updates and deployment.

Following these guidelines helps create a robust, clear, and efficient codebase, simplifying both individual contributions and team collaborations.
