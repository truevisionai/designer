import { Injectable } from "@angular/core";
import { BaseDebugService } from "app/core/interfaces/debug.service";
import { Object3DArrayMap } from "app/core/models/object3d-array-map";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Object3D } from "three";
import { DebugState } from "../debug/debug-state";
import { JunctionService } from "./junction.service";
import { ManeuverMesh } from "./junction.debug";


@Injectable( {
	providedIn: 'root'
} )
export class ManeuverDebugService extends BaseDebugService<ManeuverMesh> {

	private points = new Object3DArrayMap<ManeuverMesh, Object3D[]>();

	constructor () {

		super();

	}

	setDebugState ( junction: ManeuverMesh, state: DebugState ): void {

		if ( !junction ) return;

		this.setBaseState( junction, state );
	}

	onHighlight ( object: ManeuverMesh ): void {

		console.error( 'Method not implemented.', object );

	}

	onUnhighlight ( object: ManeuverMesh ): void {

		console.error( 'Method not implemented.', object );

	}

	onSelected ( object: ManeuverMesh ): void {

		object.select();

		const controlPoints = object.connection.connectingRoad.spline.controlPoints;

		for ( let i = 0; i < controlPoints.length; i++ ) {

			const controlPoint = controlPoints[ i ];

			controlPoint.visible = true;

			this.points.addItem( object, controlPoint );

		}

	}

	onUnselected ( object: ManeuverMesh ): void {

		object.unselect();

		this.points.removeKey( object );

	}

	onDefault ( object: ManeuverMesh ): void {

		console.error( 'Method not implemented.', object );

	}

	onRemoved ( object: ManeuverMesh ): void {

		console.error( 'Method not implemented.', object );

	}

}
