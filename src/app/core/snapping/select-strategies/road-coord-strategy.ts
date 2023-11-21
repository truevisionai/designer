/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../../events/pointer-event-data';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { SelectStrategy } from './select-strategy';

export class RoadCoordStrategy extends SelectStrategy<TvRoadCoord> {

	constructor ( private includeJunctionRoads = false ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoadCoord {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoadCoord {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoadCoord {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord

	}

	dispose (): void {

		// console.log( 'dispose' );

	}

}
