import { PointerEventData } from '../../../events/pointer-event-data';
import { TvRoadCoord } from '../../../modules/tv-map/models/tv-lane-coord';
import { SelectStrategy } from './select-strategy';

export class OnRoadStrategy extends SelectStrategy<TvRoadCoord> {

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoadCoord {

		return this.onRoadGeometry( pointerEventData );

	}

}
