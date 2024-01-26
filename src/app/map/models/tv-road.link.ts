/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadLinkChild } from './tv-road-link-child';
import { TvRoadLinkNeighbor } from './tv-road-link-neighbor';

export class TvRoadLink {
	public predecessor: TvRoadLinkChild;
	public successor: TvRoadLinkChild;
	public neighbor: TvRoadLinkNeighbor[] = [];

	getNeighbors (): TvRoadLinkNeighbor[] {
		return this.neighbor;
	}

	getNeighborCount (): number {
		return this.neighbor.length;
	}

	getNeighbour ( i: number ): TvRoadLinkNeighbor {
		return this.neighbor[ i ];
	}
}
