# Parking Spot Tool

- [Parking Spot Tool](#parking-spot-tool)
	- [Feature Highlights](#feature-highlights)
	- [Overview](#overview)
	- [Prerequisites](#prerequisites)
	- [Activate The Tool](#activate-the-tool)
	- [Create A Parking Curve](#create-a-parking-curve)
	- [Add Or Reposition Control Points](#add-or-reposition-control-points)
	- [Tune Stall Settings](#tune-stall-settings)
	- [Work With Parking Nodes](#work-with-parking-nodes)
	- [Bake The Curve](#bake-the-curve)
	- [Delete Elements](#delete-elements)
	- [Tips](#tips)

## Feature Highlights

- Draw free-form parking curves that preview stalls in real-time while you edit.
- Add, move, and remove curve control points to match kerb geometry or parking aisles.
- Configure stall width, depth, angle, side selection, and marking colour directly from the inspector.
- Drag parking nodes to reposition baked stalls and see the parking graph update immediately.
- Bake preview stalls into the parking graph to generate nodes, edges, and regions for downstream tooling.
- Delete curves, points, or nodes with undo support through the shared command history.

## Overview

Use the Parking Spot Tool to sketch curb-side or lot parking layouts, preview stall footprints, and convert finished designs into the parking graph. The workflow mirrors other geometric tools in the editor, so selecting, dragging, and baking follow familiar patterns.

## Prerequisites

- At least one road must exist in the map (curve creation is blocked otherwise).
- The parking graph visualiser should be active (enabled automatically when the tool loads).

## Activate The Tool

1. Open the `Parking Spot Tool` from the toolbar or `Tools > Parking Spot`.
2. The tool loads the current parking graph and displays existing curves, nodes, and regions.

## Create A Parking Curve

1. With the tool active, click in the scene to place the initial point.
2. A new parking curve is created and the first stall preview appears.

## Add Or Reposition Control Points

- **Add Point**: Select the curve (or one of its points) and click elsewhere to append the new control point.
- **Move Point**: Drag a parking curve control point to refine the curve shape. The stall preview refreshes automatically.
- **Remove Point**: Select a control point and press `Delete` (or use the inspector action).

## Tune Stall Settings

Select the parking curve and use the inspector to update:

- **Width** – Stall width along the curve direction.
- **Length** – Stall depth perpendicular to the curve.
- **Stall Angle** – Angle offset in degrees.
- **Side** – Left, right, or both sides of the curve.
- **Colour** – Edge marking colour rendered in the preview and baked graph.

Changes reflect instantly in the preview.

## Work With Parking Nodes

- Each baked stall exposes parking nodes that can be dragged directly in the viewport.
- While dragging a node, the associated graph edges and stall polygons update in real-time, making it easy to fine tune clearances.

## Bake The Curve

1. Select the parking curve.
2. In the inspector, click **Bake Parking Curve**.
3. The curve generates parking nodes, edges, and regions in the parking graph. Baked nodes remain editable with the tool.

## Delete Elements

- **Curve**: Select the curve and choose **Delete Parking Curve** in the inspector or press `Delete`.
- **Control Point**: Select a point and press `Delete`.
- **Node**: Select a parking node and press `Delete` to remove the associated stalls (uses the shared parking graph delete command).

## Tips

- Use undo/redo after baking or moving nodes if you want to compare layouts quickly.
- Keep stall angle small on tight corners; the tool automatically merges or widens stalls that fall below minimum width/area thresholds.
- Re-open the tool to refresh the parking graph view if you import or load new parking data from the scene file.
