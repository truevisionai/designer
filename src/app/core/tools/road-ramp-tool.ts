import { MouseButton, PointerEventData } from "app/events/pointer-event-data";
import { AnyControlPoint } from "app/modules/three-js/objects/control-point";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvPosTheta } from "app/modules/tv-map/models/tv-pos-theta";
import { TvMapQueries } from "app/modules/tv-map/queries/tv-map-queries";
import { Vector3 } from "three";
import { PickingHelper } from "../services/picking-helper.service";
import { SceneService } from "../services/scene.service";
import { BaseTool } from "./base-tool";
import { AutoSpline } from "../shapes/auto-spline";
import { TvArcGeometry } from "app/modules/tv-map/models/geometries/tv-arc-geometry";

export class RoadRampTool extends BaseTool {

	name: string = 'RoadRampTool';

	lane: TvLane;
	start = new Vector3;
	end = new Vector3();
	posTheta: TvPosTheta;;

	onPointerDown ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		if ( !e.point ) return;

		console.log( 'is down', this.isPointerDown );

		if ( !this.isLaneSelected( e ) ) return;

		this.lane = null;
		this.start = null;
		this.end = null;
	}

	isLaneSelected ( e: PointerEventData ): boolean {

		const interactedLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !interactedLane ) return false;

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		const result = TvMapQueries.getRoadByCoords( e.point.x, e.point.y, posTheta );

		// TvMapQueries.getRoadPosition( result.road.id, posTheta.s, posTheta.t );

		this.start = e.point.clone();
		this.posTheta = posTheta;
		this.lane = interactedLane;

		// this.makeSpline( this.start, this.lane, posTheta );

		// get the exisiting lane road mark at s and clone it
		// const roadMark = interactedLane.getRoadMarkAt( posTheta.s ).clone( posTheta.s );
	}

	// makeRampRoad(A: Vector3, B: Vector3, posTheta: TvPosTheta) {
	//     const direction = posTheta.toDirectionVector();
	//     const normalizedDirection = direction.clone().normalize();

	//     const upVector = new Vector3(0, 0, 1);
	//     const perpendicular = normalizedDirection.clone().cross(upVector);

	//     const midPoint = A.clone().add(B).multiplyScalar(0.5);

	//     const distanceAB = A.distanceTo(B);
	//     const offsetFactor = 0.25 * distanceAB;

	//     const v2 = A.clone().add(normalizedDirection.clone().multiplyScalar(offsetFactor));
	//     const v3 = midPoint.clone().add(perpendicular.clone().multiplyScalar(offsetFactor));

	//     const road = this.map.addDefaultRoad();

	//     road.addControlPointAt(A);
	//     road.addControlPointAt(v2);
	//     road.addControlPointAt(v3);
	//     road.addControlPointAt(B);

	//     console.log("road", [A, v2, v3, B]);

	//     road.updateGeometryFromSpline();
	// }

	makeRampRoad(A: Vector3, B: Vector3, posTheta: TvPosTheta) {
        const direction = posTheta.toDirectionVector();
        const normalizedDirection = direction.clone().normalize();

        const upVector = new Vector3(0, 0, 1);
        const perpendicular = normalizedDirection.clone().cross(upVector);

        const distanceAB = A.distanceTo(B);

        const v2 = A.clone().add(normalizedDirection.clone().multiplyScalar(distanceAB / 3));
        const v3 = B.clone().add(perpendicular.clone().multiplyScalar(-distanceAB / 3));

        const road = this.map.addDefaultRoad();

        road.addControlPointAt(A);
        road.addControlPointAt(v2);
        road.addControlPointAt(v3);
        road.addControlPointAt(B);

        console.log("road", [A, v2, v3, B]);

        road.updateGeometryFromSpline();
    }


	onPointerMoved ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		if ( this.lane && this.start ) {

			this.end = e.point.clone();

		}

	}

	onPointerUp ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		// console.log( 'is down', this.isPointerDown, this.pointerDownAt, 'up at', e.point );

		if ( this.lane && this.start ) {

			// console.log( 'create ramp', this.lane, this.start, this.end );

			// SceneService.add( AnyControlPoint.create( '', this.start ) );
			// SceneService.add( AnyControlPoint.create( '', this.end ) );

			this.makeRampRoad( this.start, this.end, this.posTheta );

			this.start = null;
			this.lane = null;
			this.end = null;

		}

	}

}
