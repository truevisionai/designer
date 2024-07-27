/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { ManeuverToolService } from 'app/tools/maneuver/maneuver-tool.service';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { DebugState } from "../../services/debug/debug-state";
import { ManeuverMesh } from 'app/services/junction/junction.debug';
import { ManeuverControlPointInspector, ManeuverInspector } from './maneuver.inspector';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { TvRoad } from "../../map/models/tv-road.model";
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { Log } from 'app/core/utils/log';

export class ManeuverTool extends BaseTool<any> {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	constructor ( private tool: ManeuverToolService ) {

		super();

	}

	init () {

		super.init();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.tool.junctionDebugger.clear();
		this.tool.maneuverDebugger.clear();

	}

	onPointerMoved ( e: PointerEventData ) {

		this.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const newPosition = this.selectionService.handleTargetMovement( e, this.currentSelectedPoint );

		this.currentSelectedPoint.copyPosition( newPosition.position );

		this.currentSelectedPointMoved = true;

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService?.handleSelection( e );

	}

	onObjectAdded ( object: any ): void {

		// if ( object instanceof SplineControlPoint ) {
		//
		// 	this.tool.addControlPoint( object.spline, object );
		//
		// } else {
		//
		// 	super.onObjectAdded( object );
		//
		// }

		if ( object instanceof ManeuverMesh ) {

			this.addManeuver( object.junction, object.connection, object.link );

		} else {

			Log.error( 'Invalid object added', object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof ManeuverMesh ) {

			this.removeManeuver( object.junction, object.connection, object.link );

		} else {

			Log.error( 'Invalid object removed', object );

		}

	}

	addManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		this.tool.connectionService.addLink( junction, connection, link );

		this.tool.junctionDebugger.updateDebugState( junction, DebugState.SELECTED );

	}

	removeManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		this.tool.connectionService.removeLink( junction, connection, link );

		this.tool.junctionDebugger.updateDebugState( junction, DebugState.DEFAULT );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof ManeuverMesh ) {

			this.setInspector( new ManeuverInspector( object ) );

			this.tool.maneuverDebugger.updateDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof SplineControlPoint ) {

			this.setInspector( new ManeuverControlPointInspector( object ) );

		} else if ( object instanceof TvJunction ) {

			this.tool.junctionDebugger.updateDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectSelected( obj ) );

		}

	}

	onObjectUnselected ( object: any ) {

		if ( object instanceof ManeuverMesh ) {

			this.clearInspector();

			this.tool.maneuverDebugger.updateDebugState( object, DebugState.REMOVED );

		} else if ( object instanceof SplineControlPoint ) {

			this.clearInspector();

		} else if ( object instanceof TvJunction ) {

			this.tool.junctionDebugger.updateDebugState( object, DebugState.DEFAULT );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectUnselected( obj ) );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			this.tool.splineService.update( object.spline );

			const connectingRoad = this.findConnectingRoad( object.spline );

			if ( !connectingRoad ) return;

			this.tool.junctionDebugger.updateDebugState( connectingRoad.junction, DebugState.SELECTED );

			this.markAsDirty( connectingRoad.junction, connectingRoad );

		} else {

			super.onObjectUpdated( object );

		}

	}

	onDeleteKeyDown () {

		// dont delete anything via keyboard for now

	}

	private markAsDirty ( junction: TvJunction, connectingRoad: TvRoad ) {

		const connection = junction.getConnections().find( c => c.connectingRoad === connectingRoad );

		if ( connection ) {

			connection.laneLink.forEach( laneLink => {

				laneLink.dirty = true;

			} );

		}

	}

	private findConnectingRoad ( spline: AbstractSpline ): TvRoad {

		const road = this.tool.splineService.findFirstRoad( spline );

		if ( road.isJunction ) return;

		if ( !road.junction ) return;

		return road;
	}

}
