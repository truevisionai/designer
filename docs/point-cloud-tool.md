# Point Cloud Tool

- [Point Cloud Tool](#point-cloud-tool)
	- [Overview](#overview)
	- [Supported Formats](#supported-formats)
	- [Open the Tool](#open-the-tool)
	- [Import Point Cloud](#import-point-cloud)
	- [Move Point Clouds](#move-point-clouds)
	- [Remove Point Cloud from Scene](#remove-point-cloud-from-scene)
	- [Adjust Properties of Point Cloud](#adjust-properties-of-point-cloud)
	- [View Modes](#view-modes)
	- [Properties](#properties)
	- [Troubleshooting](#troubleshooting)

<a name="overview"></a>

## Overview

The **Point Cloud Tool** helps you import and configure lidar point cloud files in Truevision Designer. It supports formats like PCD. You can work with multiple point clouds at once and position them individually for better context and alignment.

<a name="supported-formats"></a>

## Supported Formats

- PCD (.pcd)
- LAS (coming soon)
- LAZ (coming soon)

<a name="open-the-tool"></a>

## Open the Tool

Simply click the **Point Cloud Tool** button located on the Truevision Designer toolbar.

<a name="import-point-cloud"></a>

## Import Point Cloud

1. Click the **Point Cloud Tool** button.
2. Use the **Project Browser** to locate your point cloud file.
3. Drag and drop the file into the 3D scene.

<a name="move-point-cloud"></a>
## Move Point Clouds

1. Click the **Point Cloud Tool** button.
2. **Select** the point cloud by clicking on it in the scene 
3. **Drag** the point cloud to the desired position using your mouse.
4. For precise position, you can set the position of point cloud from **Inspector** panel

<a name="remove-point-cloud-from-scene"></a>

## Remove Point Cloud from Scene

1. Click the **Point Cloud Tool**.
2. Select the point cloud by clicking within its bounding box.
3. Press **CMD + Delete** (Mac) or **Ctrl + Delete** (Windows) to remove it.

<a name="adjust-properties-of-point-cloud"></a>

## Adjust Properties of Point Cloud

1. Click the **Point Cloud Tool**.
2. Select the desired point cloud.
3. Use the **Inspector** panel to modify its properties.

**Note:** These changes only affect how the point cloud appears in the current scene and won’t alter the original file or its appearance in other scenes.

## View Modes

PointCloudTool supports multiple visualization modes for better inspection and analysis:

- **RGB**: Colors points using their RGB values.
- **Height**: Colors points by their Z (height) value.
- **Intensity**: For LAS files, colors points based on intensity.
- **Classification**: Displays different classes (if available).
- **Single Color**: Renders all points in a specified color.

Switch modes using the `View Mode` field in the **Inspector** panel


<a name="properties"></a>

## Properties

Once a point cloud is added, the **Inspector Panel** provides the following adjustable settings:

* **Asset**: Name of the imported file
* **X, Y, Z (Position)**: Move the point cloud within the scene
* **X, Y, Z (Rotation)**: Rotate the point cloud
* **Opacity**: Set transparency (0 = invisible, 1 = fully visible)
* **Color**: Choose a color for the points
* **Point Size**: Set the display size of points (minimum is 1)
* **Points to Skip**: Skip a number of points to reduce density
* **Color Mode**:

  * Grey
  * Classification
  * Height
  * Color
  * Intensity
* **Use Custom Intensity**:

  * **Intensity Min/Max**: Define the range for intensity scaling

**Reminder:** To use custom intensity settings, make sure **Color Mode** is set to `Intensity`.


## Troubleshooting

**Q:** I cannot import my file.  
**A:** Ensure the file format is one of the supported types: `.pcd`

**Q:** My UI is unresponsive after loading a large file.  
**A:** Wait for processing to complete. For extremely large files, consider splitting them.
