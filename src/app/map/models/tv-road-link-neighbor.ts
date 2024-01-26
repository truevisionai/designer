/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvRoadLinkNeighbor {
	public attr_side;
	public attr_elementId;
	public attr_direction;

	constructor ( side: string, elementId: string, direction: string ) {
		this.attr_side = side;
		this.attr_elementId = elementId;
		this.attr_direction = direction;
	}
}
