import { Injectable } from "@angular/core";
import { DebugState } from "../../services/debug/debug-state";
import { ManeuverMesh } from "../../services/junction/junction.debug";
import { AbstractSplineDebugService } from "../../services/debug/abstract-spline-debug.service";
import { BaseDebugger } from "../../core/interfaces/base-debugger";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverRoadDebugger extends BaseDebugger<ManeuverMesh> {

	constructor ( private splineDebugger: AbstractSplineDebugService ) {

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

		this.splineDebugger.showControlPoints( object.connection.connectingRoad.spline );
		this.splineDebugger.showLines( object.connection.connectingRoad.spline );
	}

	onUnselected ( object: ManeuverMesh ): void {

		object.unselect();

		this.splineDebugger.hideControlPoints( object.connection.connectingRoad.spline );
		this.splineDebugger.hideLines( object.connection.connectingRoad.spline );

	}

	onDefault ( object: ManeuverMesh ): void {

		console.error( 'Method not implemented.', object );

	}

	onRemoved ( object: ManeuverMesh ): void {

		console.error( 'Method not implemented.', object );

	}

}
