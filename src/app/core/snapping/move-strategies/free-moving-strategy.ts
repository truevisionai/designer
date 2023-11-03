import { Raycaster } from "three";
import { PointerEventData } from "../../../events/pointer-event-data";
import { TvMapInstance } from "../../../modules/tv-map/services/tv-map-source-file";
import { MovingStrategy } from "./move-strategy";
import { Position } from "app/modules/scenario/models/position";
import { WorldPosition } from "app/modules/scenario/models/positions/tv-world-position";
import { LanePosition } from "app/modules/scenario/models/positions/tv-lane-position";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";
import { SceneService } from "app/services/scene.service";

export class FreeMovingStrategy extends MovingStrategy {

	private raycaster = new Raycaster();

	init () {

		this.raycaster.far = 1000;

	}

	getPosition ( e: PointerEventData ): Position {

		this.raycaster.setFromCamera( e.mouse, e.camera );

		const raycastableObjects = [ TvMapInstance.map.gameObject, SceneService.bgForClicks ];

		const intersections = this.raycaster.intersectObjects( raycastableObjects, true ).filter( i => i.object.visible );

		if ( intersections.length > 0 ) {

			return new WorldPosition( intersections[ 0 ].point );

		} else {

			return new WorldPosition( e.point );

		}
	}

}

export class AnyLaneMovingStrategy extends MovingStrategy {

	constructor ( private contact?: TvContactPoint ) {

		super();

	}

	getPosition ( e: PointerEventData ): Position {

		const laneCoord = this.onLaneCoord( e );

		if ( !laneCoord ) return;

		let offset = 0

		if ( this.contact == TvContactPoint.START ) {
			offset -= laneCoord.lane.getWidthValue( laneCoord.s ) * 0.5;
		}

		if ( this.contact == TvContactPoint.END ) {
			offset += laneCoord.lane.getWidthValue( laneCoord.s ) * 0.5;
		}

		return new LanePosition( laneCoord.roadId, laneCoord.laneId, offset, laneCoord.s, null );

	}

}
