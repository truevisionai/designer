/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvOrientation } from '../tv-common';
import { TvJunctionType } from './tv-junction-type';
import { TvJunction } from './tv-junction';
import { TvRoad } from '../tv-road.model';

/**

Virtual junctions are not designed for real world traffic situations.
Their only use case are driveways that lead to parking lots or residential estates.

Virtual junctions are junctions that describe connections within a road.
Virtual junctions enable to create branches from a road without the need to
interrupt the geometry of the road.

Virtual junctions are intended as best practice for example for the following use cases:
- modeling driveways
- modeling entries and exits to parking lots
- modeling entries and exits to farm roads

Rules
- The main incoming road within a virtual junction does not need to end before the junction area.
- Virtual junctions shall not replace common junctions and crossings that connect multiple roads.
- Virtual junctions shall be used for branches off the main road only. The main road always has priority.
- Virtual junctions shall not have controllers and therefore no traffic lights.
- If no incoming road is defined the attribute @incomingRoad has the value -1.
- All connecting roads within the virtual junction shall either start or end at @sStart or at @sEnd.
- There shall only be one @sStart and one @sEnd definition for the virtual junction.
- The heading of the connecting roads and the @mainRoad shall be equal at @sStart and at @sEnd.
- The linked lanes shall fit smoothly as described for roads.
- The attributes @mainRoad, @sStart, @sEnd, @orientation shall only be valid for junctions of type virtual.

 */
export class TvVirtualJunction extends TvJunction {

	public type: TvJunctionType = TvJunctionType.VIRTUAL;

	public mainRoad: TvRoad;

	public sStart: number;

	public sEnd: number;

	public orientation: TvOrientation;

	constructor ( name: string, id: number, mainRoad: TvRoad, sStart: number, sEnd: number, orientation: TvOrientation ) {

		super( name, id );

		this.mainRoad = mainRoad;

		this.sStart = sStart;

		this.sEnd = sEnd;

		this.orientation = orientation;

	}

}

