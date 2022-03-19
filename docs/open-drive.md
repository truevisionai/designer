# OpenDRIVE: Introduction

- [Introduction](#getting-started)
    - [What is OpenDRIVE?](#open-drive)    
    - [Hello Road](#hello-road)
- [Using Designer](#using-designer)    
    
    
<a name="open-drive"></a>    
## What is OpenDRIVE
Truevision provides support for importing & describing road networks via OpenDRIVE. OpenDRIVE® files are designed to describe entire road networks with respect to all data belonging to the road environment. They do not describe the entities acting on or interacting with the road.


The OpenDRIVE file format provides the following features:
- XML format
- hierarchical structure
- analytical definition of road geometry (plane elements, lateral / vertical profile, lane width etc.)
- various types of lanes
- junctions and junction groups
- logical inter-connection of lanes
- signs and signals incl. dependencies
- signal controllers (e.g. for junctions)
- road and road-side objects
- user-defineable data beads
- and more

### Road Layout

The following figure depicts the principles of road layout:

<img src="../../../img/docs/open-drive-road-layout.png" width="100%">

> Note: Support for OpenDRIVE version 1.4 & above is provided. Some of the OpenDRIVE tags are not supported. 

<a name="hello-road"></a>    
## Hello Road

In the section, we'll look to create our very first simple road using OpenDRIVE. You can create OpenDRIVE in two ways
- Using Truevision ScenarioDesigner
- Manually writing or modifying the XML


The ScenarioDesigner is a much easier way to design roads as you'll not need to know anythign about OpenDRIVE and you can just visually create road by clicking and changing and few properties etc.

Manually writing the XML file means you'll need to understand all the tags and element in OpenDRIVE, which can be quite a long excercise depending on how deeply you want to understand the format. Instead of covering everything, we'll be covering some of the most important elements which will improve your speed to iterate without spending too much time.

<a name="using-designer"></a>    
## Using Designer

Follow the screenshots below to create a simple road with muliple lanes.

Open Designer
<img src="../../../img/docs/step-1-open-designer.png" alt="" width="605"/>

Create Road
<img src="../../../img/docs/step-2-create-road.png" alt="" width="605"/>

Add Lanes
<img src="../../../img/docs/step-3-add-lanes.png" alt="" width="605"/>

Modify Lane Type
<img src="../../../img/docs/step-4-modify-lane-type.png" alt="" width="605"/>

Modify Lane Width
<img src="../../../img/docs/step-5-modify-lane-width.png" alt="" width="605"/>

Add Roadmarks
<img src="../../../img/docs/step-6-add-roadmarks.png" alt="" width="605"/>

Modify Roadmarks
<img src="../../../img/docs/step-7-modify-roadmarks.png" alt="" width="605"/>

Export File
<img src="../../../img/docs/step-8-export-file.png" alt="" width="605"/>

Now, you can just import the file in the simulator with [import command](import-commands.md#import-open-drive)