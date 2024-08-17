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


# Unit Testing
## The Three Laws of TDD
By now everyone knows that TDD asks us to write unit tests first, before we write produc- tion code. But that rule is just the tip of the iceberg. Consider the following three laws:1
- First Law You may not write production code until you have written a failing unit test. 
- Second Law - You may not write more of a unit test than is sufficient to fail, and not compiling is failing.
- Third Law You may not write more production code than is sufficient to pass the cur- rently failing test.

## Tips
- Readability is perhaps even more important in unit tests than it is in production code
- Follow BUILD-OPERATE-CHECK flow
- We want to test a single concept in each test function. 
- We don’t want long test functions that go testing one miscellaneous thing after another.
- Minimize the number of asserts per concept and test just one con- cept per test function.

## F.I.R.S.T.

Clean tests follow five other rules that form the above acronym:
- **Fast** Tests should be fast. They should run quickly. When tests run slow, you won’t want to run them frequently. If you don’t run them frequently, you won’t find problems early enough to fix them easily. You won’t feel as free to clean up the code. Eventually the code will begin to rot.
- **Independent** Tests should not depend on each other. One test should not set up the condi- tions for the next test. You should be able to run each test independently and run the tests in any order you like. When tests depend on each other, then the first one to fail causes a cas- cade of downstream failures, making diagnosis difficult and hiding downstream defects.
- **Repeatable** Tests should be repeatable in any environment. You should be able to run the tests in the production environment, in the QA environment, and on your laptop while riding home on the train without a network. If your tests aren’t repeatable in any environ- ment, then you’ll always have an excuse for why they fail. You’ll also find yourself unable to run the tests when the environment isn’t available.
- **Self-Validating** The tests should have a boolean output. Either they pass or fail. You should not have to read through a log file to tell whether the tests pass. You should not have to manually compare two different text files to see whether the tests pass. If the tests aren’t self-validating, then failure can become subjective and running the tests can require a long manual evaluation.
- **Timely** The tests need to be written in a timely fashion. Unit tests should be written just before the production code that makes them pass. If you write tests after the production code, then you may find the production code to be hard to test. You may decide that some production code is too hard to test. You may not design the production code to be testable.


# Error Management

When dealing with data parsing within the same file, it’s essential to balance between handling errors directly and throwing exceptions. The general rule of thumb is:

- Use Exceptions Rather Than Return Codes
- Use Unchecked Exceptions
- Provide Context with Exceptions to determine the source and location of an error
- Define Exception Classes in Terms of a Caller’s Needs
- Return SPECIAL CASE PATTERN if applicable
- Dont return NULL
- Dont pass NULL

Others

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

In your application, you have a service method (`getRoad`) that throws an exception if the road ID is not found. The challenge is determining where to handle this exception effectively: in the service, the tool, or both.

### Recommended Approach: Centralized Error Handling in the Service

**Pros:**
1. **Consistency**: Centralizing error handling in the service ensures a consistent response to errors across all tools.
2. **Code Reusability**: You avoid duplicating error handling code in each tool class.
3. **Maintainability**: Easier to maintain and update error handling logic in one place rather than multiple places.

**Cons:**
1. **Granularity**: Handling exceptions at the service level may not provide the specific context needed by different tools. However, this can be mitigated by providing detailed error information in the exception.

### Implementation in Service

Modify the `getRoad` method in your `RoadService` to handle the exception and return a meaningful result (e.g., `null`):

```typescript
getRoad(roadId: number): TvRoad | null {
  try {
    return this.mapService.map.getRoadById(roadId);
  } catch (error) {
    if (error instanceof ModelNotFoundException) {
      Log.error(`Road with ID ${roadId} not found.`);
      return null; // Handle the error by returning null
    } else {
      throw error; // Re-throw unexpected errors
    }
  }
}
```

### Usage in Tool

Update the `RoadSignlTool` to handle the `null` value returned by the `getRoad` method:

```typescript
onPointerMoved(pointerEventData: PointerEventData): void {
  this.highlight(pointerEventData);

  if (!this.isPointerDown) return;

  if (!this.currentSelectedObject) return;

  const road = this.tool.roadService.getRoad(this.currentSelectedObject.roadId);

  if (!road) {
    Log.error(`Road with ID ${this.currentSelectedObject.roadId} could not be retrieved.`);
    return;
  }

  const position = this.tool.roadService.findRoadCoord(pointerEventData.point);

  if (!position) return;

  this.currentSelectedObject.s = position.s;

  this.updateRoadSignal(road, this.currentSelectedObject);

  this.currentSelectedPointMoved = true;
}
```

### Advantages of This Approach

1. **Centralized Error Handling**: By handling the error in the service, you ensure that all tools using `getRoad` benefit from consistent error handling.
2. **Simplified Tool Logic**: Tool classes do not need to implement repetitive error handling logic, making them simpler and easier to maintain.
3. **Clear Separation of Concerns**: The service is responsible for data retrieval and error handling, while the tools focus on user interactions and application logic.

### Handling in Tools Separately (Alternative Approach)

If you prefer to handle exceptions in each tool separately, the pros and cons are as follows:

**Pros:**
1. **Context-Specific Handling**: Each tool can handle the error in a way that makes sense for its specific context.
2. **Granularity**: Tools can provide more detailed and specific error messages to the user.

**Cons:**
1. **Repetition**: You will need to duplicate error handling code across multiple tools.
2. **Inconsistency**: Different tools might handle the same error in different ways, leading to inconsistent user experiences.
3. **Maintenance**: More places to update if error handling logic changes.

### Implementation in Tools Separately

Each tool class would need to implement try-catch blocks around the `getRoad` call:

```typescript
onPointerMoved(pointerEventData: PointerEventData): void {
  this.highlight(pointerEventData);

  if (!this.isPointerDown) return;

  if (!this.currentSelectedObject) return;

  try {
    const road = this.tool.roadService.getRoad(this.currentSelectedObject.roadId);
    if (!road) return; // Optionally handle null if service returns it instead of throwing

    const position = this.tool.roadService.findRoadCoord(pointerEventData.point);

    if (!position) return;

    this.currentSelectedObject.s = position.s;

    this.updateRoadSignal(road, this.currentSelectedObject);

    this.currentSelectedPointMoved = true;
  } catch (error) {
    if (error instanceof ModelNotFoundException) {
      Log.error(`Road with ID ${this.currentSelectedObject.roadId} not found.`);
    } else {
      Log.error('Unexpected error: ' + error.message);
    }
  }
}
```

### Conclusion

The recommended approach is to handle the exception in the service (`RoadService`) to maintain consistency, reduce code duplication, and simplify the tool classes. This approach centralizes error handling and makes the application more maintainable. If more context-specific handling is needed, consider providing additional information in the exceptions or using a combination of both approaches.
