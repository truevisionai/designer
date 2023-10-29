# Coding Guidelines

## Folder Structure 

```md
src/app
├── commands 
├── core
├── factories
├── io
├── managers - 
├── services - 
├── tools - store all tool classes
```

## Responsibility

## Commands

- Responsible for storing small and abstract addition/removal from data/map layer and in some cases 3d/visual layer. 
- Should not store complex logic. 

## Factories

- Responsible for creating different kinds of complex objects/classes.
- Factories should solely focus on creation 
- Updation logic should go in services

## IO

- Responsible for file/folder CRUD operations in OS

## Listeners

- Responsible for listening to events and updating objects based on their relations.
- Listeners will listen to certain events and then use services to run complex logic
> For example when road shape is changed we need to update elevation and other nodes 

## Managers

- Responsible for managing state of different parts of the application. 

> For eg. ToolManager manages the state of currently selected Tool. InspectorManager manages the state of currently selected inspector. PropManager handles the state of prop.

> RoadStyleManager handles for RoadStyle.

## Services

Responsible for storing business logic of different complex operations like 
- Creating a junction
- Automatically creating maneuvers
- Cutting a road

## Models

- Responsible for store data
- Should contain logic for manipulating only own data
- Should not contain business logic
- Should not fire events as it increased responsibility of the data model. Events should be fire from the ideally Commands or Services

