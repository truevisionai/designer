# Truevision Designer

Truevision Designer is a 3D editor designed to create roads, intersections, and environments for testing and validating autonomous vehicles and robots.

![Image](docs/img/welcome.png)

## Features

- Create and modify roads and lanes
- Import/Export OpenDrive 1.4
- Export to the CARLA simulator
- Export 3D environments as GLTF or GLB files
- Import and place 3D assets in the environment using various prop tools

## Tools

### Road Tool
  - **Road Plan Tool** - For planning roads
  - **Road Circle Tool** - For creating roundabouts
  - **Road Divider Tool** - For dividing roads into two connected roads
  - **Road Elevation Tool** - For controlling road height
  - **Super Elevation Tool** - For adjusting road tilt or roll angle

### Lane Tools
  - **Lane Tool** - For inspecting and modifying lane properties
  - **Lane Width Tool** - For editing lane width
  - **Lane Height Tool** - For adjusting the height of lanes for sidewalks or curbs
  - **Lane Marking Tool** - For adding markings to a lane

### Junction Tools
  - **Junction Tool** - For creating custom junctions
  - **Maneuver Tool** - For editing junction maneuvers
  - **Traffic Signal Tool** - For adding signals to a junction
  - **Crosswalk Tool** - For adding crosswalks to roads/junctions

### Marking Tools
  - **Point Marking Tool** - For creating point markings 
  - **Text Marking Tool** - For adding text markings on roads, like STOP or BUS LANE
  - **Prop Point Tool** - For adding a single prop to the road/environment
  - **Prop Curve Tool** - For adding props along a curve/line
  - **Prop Polygon Tool** - For adding props in a polygonal area
  - **Prop Span Tool** - For adding props along a road span/geometry
  - **Road Sign Tool** - For adding road signals to roads

### Terrain
  - **Surface Tool** - For editing surfaces/terrain other than roads

## Download

Click here to download: [https://www.truevision.ai/download/designer](https://www.truevision.ai/download/designer)

## Documentation

The latest documentation can be found at: [https://www.truevision.ai/designer/docs](https://www.truevision.ai/designer/docs)

## Tutorials

The latest tutorials and videos can be found at: [https://www.youtube.com/channel/UCv4Gkf0Z0JyWdKQHakXpbAw/videos](https://www.youtube.com/channel/UCv4Gkf0Z0JyWdKQHakXpbAw/videos)

## Recommended System
- Intel i7 or above
- 16 GB RAM
- Ubuntu/Windows

## License

In brief, you are free to use and modify Truevision Designer for all non-commercial purposes only. Please read the license for more details.

Your access to and use of Truevision Designer on GitHub is governed by the Truevision Designer End User License Agreement. If you don't agree to those terms, as amended from time to time, you are not permitted to access or use Truevision Designer.


## MVVM Architecture

Always pass the Model to SetValueCommand or SetPositionCommand. Here’s why:
Model is the Source of Truth:

Changes should always be applied to the Model since it represents the persistent state of your application.
The ViewModel reflects the Model’s state and is regenerated dynamically when needed.
Why not pass the ViewModel?

ViewModels are transient and are tied to user interactions. If you pass a ViewModel, you might run into issues when the ViewModel is destroyed (e.g., when the road is unselected).
Passing the Model ensures that commands are consistent and reusable, even if the ViewModel or View is recreated.
Why not pass the View?

Views are purely visual and should never contain logic or state. Passing them tightly couples UI with business logic, violating MVVM principles.
