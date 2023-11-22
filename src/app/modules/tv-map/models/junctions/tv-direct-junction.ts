import { TvOrientation } from "../tv-common";
import { TvRoad } from "../tv-road.model";
import { TvJunction } from "./tv-junction";
import { TvJunctionType } from "./tv-junction-type";


/**

Roads that lead into a junction can directly be linked to roads that lead out of a junction.
Direct junctions are intended to model entries and exits without adding additional
connecting roads. This approach reduces the number of roads required to model entries
and exits in comparison to the common junction modeling approach

Rules
------------------------------------------------------------------------------------
Direct junctions shall only be used for non-overlapping roads.
The @linkedRoad attribute shall only be used for junctions with @type="direct".
The @connectingRoad attribute shall not be used for junctions with @type="direct".
The linked lanes shall fit smoothly as described for roads
The junction shall be placed where the headings of road and ramp are identical.
 *
 */
export class TvDirectJunction extends TvJunction {

	public type: TvJunctionType = TvJunctionType.DIRECT;

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
