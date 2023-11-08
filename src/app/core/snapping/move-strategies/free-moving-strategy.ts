import { Raycaster } from "three";
import { PointerEventData } from "../../../events/pointer-event-data";
import { TvMapInstance } from "../../../modules/tv-map/services/tv-map-instance";
import { MovingStrategy } from "./move-strategy";
import { Position } from "app/modules/scenario/models/position";
import { WorldPosition } from "app/modules/scenario/models/positions/tv-world-position";
import { SceneService } from "app/services/scene.service";

export class FreeMovingStrategy extends MovingStrategy<any> {

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

