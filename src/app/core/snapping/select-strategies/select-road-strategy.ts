import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectStrategy } from './select-strategy';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';


export class SelectRoadStrategy extends SelectStrategy<TvRoad> {

	constructor ( private includeJunctionRoads = false ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoad {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord.road;
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoad {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord.road;

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoad {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord.road;

	}

	dispose (): void {

		// nothing to dispose

	}

}
