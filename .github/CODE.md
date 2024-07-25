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

### Testing
- Establish guidelines for testing all components to ensure independent functionality and correct interactions.

### Code Review and Quality
- Encourage regular code reviews and utilize static analysis tools to uphold coding standards and clarity.

### Dependency Management
- Manage external libraries or tools effectively to prevent conflicts and ensure smooth updates and deployment.

Following these guidelines helps create a robust, clear, and efficient codebase, simplifying both individual contributions and team collaborations.


## Prioritization

MoSCoW method
The MosCow Method is a four-step process for prioritizing product requirements around their return on investment (ROI). 
It stands for “must haves,” “should haves,” “could haves,” and “will not haves.” 

Here’s a breakdown of the model: 

Must Have (M): These are the requirements needed for the project's success.
Should Have (S): These are important requirements for the project but not necessary.
Could Have (C ):  These requirements are “nice to have.” But don’t have as much impact as the others. 
Will Not Have (W): These requirements aren’t a priority for the project.


# Error Management

When dealing with data parsing within the same file, it’s essential to balance between handling errors directly and throwing exceptions. The general rule of thumb is:

- **Throw exceptions** for errors that are truly exceptional and unexpected, such as invalid data formats, missing critical elements, or data that violates your application's constraints.
- **Handle errors directly** for expected and manageable issues, such as optional fields or non-critical missing data, where you can provide a fallback value or skip the problematic part without impacting the overall functionality.

### Where to Throw Exceptions

Throw exceptions when:
1. **Critical Data Missing**: When a critical piece of data is missing, and you cannot proceed without it.
2. **Invalid Data**: When the data format is incorrect or doesn’t meet the required specifications.
3. **Violates Business Logic**: When the data violates the core business logic or constraints of your application.

### Where to Handle Errors Directly

Handle errors directly when:
1. **Optional Data Missing**: When optional data is missing, and you can proceed without it or use a default value.
2. **Minor Data Issues**: When there are minor data issues that do not impact the overall functionality of your application.
3. **Recoverable Errors**: When you can recover from the error without significant consequences.

### Example Implementation

Here's how you can refactor your code with this approach in mind:

#### Define Custom Exceptions

```typescript
export class ModelNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelNotFoundException';
  }
}

export class InvalidDataException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDataException';
  }
}
```

#### Example Methods

1. **Method that Throws Exceptions for Critical Errors**

```typescript
public importJunctions(openDRIVE: XmlElement) {
  readXmlArray(openDRIVE?.junction, (xml) => {
    try {
      const junction = this.map.getJunctionById(parseInt(xml.attr_id));
      if (!junction) {
        throw new ModelNotFoundException(`Junction with ID ${xml.attr_id} not found.`);
      }
      this.parseJunctionConnections(junction, xml);
      this.parseJunctionPriorities(junction, xml);
      this.parseJunctionControllers(junction, xml);
    } catch (error) {
      if (error instanceof ModelNotFoundException) {
        Log.error('Junction not found');
      } else {
        Log.error('Unknown error: ' + error.message);
      }
    }
  });
}
```

2. **Method that Handles Errors Directly**

```typescript
public parseHeader(xmlElement: XmlElement): TvMapHeader {
  const revMajor = parseFloat(xmlElement.attr_revMajor);
  const revMinor = parseFloat(xmlElement.attr_revMinor);
  const name = xmlElement.attr_name || 'Unnamed'; // Handle missing name directly
  const version = parseFloat(xmlElement.attr_version) || 1.0; // Provide default version
  const date = xmlElement.attr_date || new Date().toISOString(); // Use current date if missing
  const north = parseFloat(xmlElement.attr_north);
  const south = parseFloat(xmlElement.attr_south);
  const east = parseFloat(xmlElement.attr_east);
  const west = parseFloat(xmlElement.attr_west);
  const vendor = xmlElement.attr_vendor || 'Unknown'; // Handle missing vendor directly

  if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
    throw new InvalidDataException('Invalid geographical bounds in map header.');
  }

  return new TvMapHeader(revMajor, revMinor, name, version, date, north, south, east, west, vendor);
}
```

### Summary of Best Practices

- **Throw exceptions** when encountering critical, unexpected errors that prevent the continuation of normal execution.
- **Handle errors directly** when dealing with expected, manageable issues that you can work around without disrupting the overall process.
- **Document your error handling strategy** to ensure consistency and clarity across your codebase.
