# Road Tool
- [Road Tool](#road-tool)
	- [Overview](#overview)
	- [Create Road](#create-road)
	- [Move Control Point](#move-control-point)
	- [Move Road](#move-road)
	- [Select Road](#select-road)
	- [Connect Roads](#connect-roads)
	- [Delete Road Control Point](#delete-road-control-point)
	- [Delete Road](#delete-road)
	- [Create Intersection](#create-intersection)
		- [Automatic Intersections](#automatic-intersections)
		- [Custom Intersections](#custom-intersections)
	- [Create Road Loops](#create-road-loops)


<a name="overview"></a>
## Overview

Road tool helps you create different types of road geometries and shapes to fit your needs.

<a name="create-roads"></a>
## Create Road

1. Select `Road Tool` icon from `Toolbar`
2. If another road is selected, click on empty area to unselect.
3. Use `shift + left click` to create control points. 
4. If you want to create a new road then first unselect the previous road by `left click` and then `shift + left click` again to start creating a new road.
5. You can change the style of the road by dragging `RoadStyle` asset from `ProjectBrowser`


<a name="move-conrol-point"></a>
## Move Control Point
1. Select `Road Tool` icon from `Toolbar`
2. `Left Click` the road you want to edit. The road is highlighted, and the control points are displayed and connected by light blue lines.
3. Click and drag the desired control point to move it.
4. You can alsoo click to select the point, and then type a precise position in the Attributes pane.

<a name="move-road"></a>
## Move Road
1. Select `Road Tool` icon from `Toolbar`
2. `Left Click` the road you want to shift. The road is highlighted, and the control points are displayed and connected by light blue control lines.

<a name="select-road"></a>
## Select Road

You can select a road for editing and modification by taking the pointer above the road and using `left click`

<a name="connect-roads"></a>
## Connect Roads

Two roads can be connected using road nodes. 
- Select a node from road A using `left click`
- Select another node from road B using `left click` 
- Two roads will now be connected through a new road C which also be modified if required

<a name="delete-road-control-point"></a>
## Delete Road Control Point
1. Select `Road Tool` icon from `Toolbar`
2. `Left Click` the road you want to delete the point from. The road is highlighted, and the control points are displayed and connected by light blue lines.
3. Click the control point you want to delete.
4. Press the Delete key, or select Edit > Delete from the menu bar.


<a name="delete-road"></a>
## Delete Road
1. Select `Road Tool` icon from `Toolbar`
2. `Left Click` the road you want to delete.
3. Press the `Delete` key, or select Edit > Delete from the menu bar.


<a name="create-intersection"></a>
## Create Intersection


<a name="automatic-intersections"></a>
### Automatic Intersections

- Four-Way Intersections
  - To create a four-way intersection, create two roads that fully overlap:
- T-Junctions
  - To create a T-junction, create two roads where one ends within the extents of the other
- Ramps
  - To create onramps, offramps, and road splits, refer to the Slip Road Tool documentation.

<a name="custom-intersections"></a>
### Custom Intersections

To create custom intersection, refer to the Junction Tool documentation.


<a name="create-road-loops"></a>
## Create Road Loops

