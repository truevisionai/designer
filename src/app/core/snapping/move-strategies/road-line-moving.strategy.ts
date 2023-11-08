import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/modules/scenario/models/position';
import { MovingStrategy } from './move-strategy';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadPosition } from 'app/modules/scenario/models/positions/tv-road-position';


export class RoadLineMovingStrategy extends MovingStrategy<TvRoad> {

	getPosition ( event: PointerEventData, target: TvRoad ): Position {

		const posTheta = target.getCoordAt( event.point );

		return new RoadPosition( target, posTheta.s, 0 );

	}

}
