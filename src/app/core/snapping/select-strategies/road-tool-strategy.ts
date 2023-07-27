import { Line2 } from 'three/examples/jsm/lines/Line2';
import { PointerEventData } from '../../../events/pointer-event-data';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { TvMapQueries } from '../../../modules/tv-map/queries/tv-map-queries';
import { LineFactoryService } from '../../factories/line-factory.service';
import { SceneService } from '../../services/scene.service';
import { SelectStrategy } from './select-strategy';

export class RoadToolStrategy extends SelectStrategy<TvRoad> {

	private road: TvRoad;
	private line: Line2;

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoad {

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		if ( Math.abs( roadCoord.t ) > 1 ) return;

		const points = roadCoord.road.getReferenceLinePoints().map( p => p.toVector3() );

		const line = this.line = LineFactoryService.createLine( points, 0xff0000 );

		SceneService.add( line );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoad {

		if ( this.line ) SceneService.remove( this.line );

		const roadCoord = TvMapQueries.findRoadCoord( pointerEventData.point );

		if ( !roadCoord ) return;

		const points = roadCoord.road.getReferenceLinePoints().map( p => p.toVector3() );

		const line = this.line = LineFactoryService.createLine( points, 0xffffff );

		SceneService.add( line );

		return roadCoord.road;
	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

	}

}
