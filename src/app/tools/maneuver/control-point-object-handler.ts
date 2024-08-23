import { Injectable } from "@angular/core";
import { BaseObjectHandler } from "app/core/object-handlers/base-object-handler";
import { BaseOverlayHandler } from "app/core/overlay-handlers/overlay-handler";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { SplineControlPoint } from "app/objects/spline-control-point";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { SplineService } from "app/services/spline/spline.service";


@Injectable( {
	providedIn: 'root'
} )
export class ManeuverControlPointHandler extends BaseObjectHandler<SplineControlPoint> {

	constructor (
		private splineService: SplineService,
		private junctionDebugger: JunctionDebugService,
	) {
		super();
	}

	onSelected ( object: SplineControlPoint ): void {

		object.select();

	}

	onUnselected ( object: SplineControlPoint ): void {

		object.unselect();

	}

	onAdded ( object: SplineControlPoint ): void {

		Log.info( 'Control point added' );

	}

	onUpdated ( object: SplineControlPoint ): void {

		const connectingRoad = this.findConnectingRoad( object.spline );

		if ( !connectingRoad ) {
			Log.error( 'Connecting road not found' );
			return;
		}

		this.splineService.update( object.spline );

		this.markAsDirty( connectingRoad.junction, connectingRoad );

		const mesh = this.junctionDebugger.findMesh( connectingRoad.junction, connectingRoad );

		if ( !mesh ) {
			Log.error( 'ManeuverMesh not found' );
			return;
		}

		this.junctionDebugger.updateManeuver( mesh );
	}

	onRemoved ( object: SplineControlPoint ): void {

		Log.info( 'Control point removed' );

	}

	private findConnectingRoad ( spline: AbstractSpline ): TvRoad {

		const road = this.splineService.findFirstRoad( spline );

		if ( !road.isJunction ) return;

		return road;
	}

	private markAsDirty ( junction: TvJunction, connectingRoad: TvRoad ): void {

		const connection = junction.getConnections().find( c => c.connectingRoad === connectingRoad );

		if ( connection ) {

			connection.laneLink.forEach( laneLink => {

				laneLink.dirty = true;

			} );

		}

	}

}


@Injectable( {
	providedIn: 'root'
} )
export class ControlPointOverlayHandler extends BaseOverlayHandler<AbstractControlPoint> {

	constructor () {
		super();
	}

	onHighlight ( object: AbstractControlPoint ): void {

		object.onMouseOver();

	}

	onSelected ( object: AbstractControlPoint ): void {

		object.select();

	}

	onDefault ( object: AbstractControlPoint ): void {

		object.unselect();

	}

	onUnselected ( object: AbstractControlPoint ): void {

		object.unselect();

	}

	onAdded ( object: AbstractControlPoint ): void {

		//

	}

	onUpdated ( object: AbstractControlPoint ): void {

		//

	}

	onRemoved ( object: AbstractControlPoint ): void {

		//

	}

	onClearHighlight (): void {

		//

	}

	clear (): void {

		//

	}

}
