import { MouseButton, PointerEventData } from "app/events/pointer-event-data";
import { AnyControlPoint } from "app/modules/three-js/objects/control-point";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvPosTheta } from "app/modules/tv-map/models/tv-pos-theta";
import { TvMapQueries } from "app/modules/tv-map/queries/tv-map-queries";
import { Vector3 } from "three";
import { PickingHelper } from "../services/picking-helper.service";
import { SceneService } from "../services/scene.service";
import { BaseTool } from "./base-tool";

export class RoadRampTool extends BaseTool {

	name: string = 'RoadRampTool';

	lane: TvLane;
	start: TvPosTheta;
	end = new Vector3();

	onPointerDown ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		console.log( 'is down', this.isPointerDown );

		if ( !this.isLaneSelected( e ) ) return;

		this.lane = null;
		this.start = null;
	}

	isLaneSelected ( e: PointerEventData ): boolean {

		const interactedLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !interactedLane ) return false;

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		const result = TvMapQueries.getLaneByCoords( e.point.x, e.point.y, posTheta );

		this.start = TvMapQueries.getRoadPosition( result.road.id, posTheta.s, posTheta.t );

		this.lane = interactedLane;

		// get the exisiting lane road mark at s and clone it
		// const roadMark = interactedLane.getRoadMarkAt( posTheta.s ).clone( posTheta.s );
	}

	onPointerMoved ( e: PointerEventData ) {

		console.log( 'is down', this.isPointerDown, this.pointerDownAt );

		if ( this.lane && this.start ) {

			this.end.copy( e.point );

		}

	}

	onPointerUp ( e: PointerEventData ) {

		console.log( 'is down', this.isPointerDown, this.pointerDownAt );

		if ( this.lane && this.start ) {

			console.log( 'create ramp', this.lane, this.start, this.end );

			SceneService.add( AnyControlPoint.create( '', this.start.toVector3() ) );
			SceneService.add( AnyControlPoint.create( '', this.end ) );

		}

	}

}
