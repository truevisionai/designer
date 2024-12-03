/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLane } from '../models/tv-lane';
import { OpenDriveExporter } from './open-drive-exporter';

@Injectable( {
	providedIn: 'root'
} )
export class TvCarlaExporter extends OpenDriveExporter {

	// override default
	public writeLane ( xmlNode, lane: TvLane ): any {

		return super.writeLane( xmlNode, lane );

		// // below logic is probably not required
		// // carla tv-models importnig process does not parse any user data with travel direction

		// const laneXmlNode = super.writeLane( xmlNode, lane );

		// if ( lane.side == LaneSide.CENTER ) return;

		// let direction = "undirected";

		// if ( lane.side == LaneSide.LEFT && lane.type == OdLaneType.driving ) direction = "backward";

		// if ( lane.side === LaneSide.RIGHT && lane.type == OdLaneType.driving ) direction = "forward";

		// laneXmlNode.userData = {
		//     vectorLane: {
		//         attr_travelDir: direction
		//     }
		// }

	}

}
