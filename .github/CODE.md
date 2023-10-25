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

Responsible for storing small and abstract addition/removal from data/map layer and in some cases 3d/visual layer. Should not store complex logic. 

## Factories

Responsible for creating different kinds of complex objects/classes.

## IO

Responsible for file/folder CRUD operations in OS

## Listeners

Responsible for listening to events and updating objects based on their relations

For example when road shape is changed we need to update elevation and other nodes 

## Managers

Responsible for managing state of different parts of the application. 

For eg. ToolManager manages the state of currently selected Tool. InspectorManager manages the state of currently selected inspector. PropManager handles the state of prop.
RoadStyleManager handles for RoadStyle.



## Services




