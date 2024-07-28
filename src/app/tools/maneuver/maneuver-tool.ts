/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { ManeuverToolHelper } from 'app/tools/maneuver/maneuver-tool-helper.service';
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
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ControlPointStrategy } from "../../core/strategies/select-strategies/control-point-strategy";
import { ObjectTagStrategy, ObjectUserDataStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { FollowHeadingMovingStrategy } from "../../core/strategies/move-strategies/follow-heading-moving-strategy";

export class ManeuverTool extends BaseTool<any> {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	debug = true;

	constructor ( public helper: ManeuverToolHelper ) {

		super();

	}

	init () {

		this.selectionService = this.helper.base.selection;

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( ManeuverMesh.name, new ObjectTagStrategy( 'link' ) );
		this.selectionService.registerStrategy( TvJunction.name, new ObjectUserDataStrategy( 'junction', 'junction' ) );

		this.selectionService.registerTag( SimpleControlPoint.name, SimpleControlPoint.name );
		this.selectionService.registerTag( SplineControlPoint.name, SimpleControlPoint.name );
		this.selectionService.registerTag( ManeuverMesh.name, ManeuverMesh.name );
		this.selectionService.registerTag( TvJunction.name, TvJunction.name );

		this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

		this.setTypeName( TvJunction.name );
		this.setDebugService( this.helper.junctionDebugger );
		this.setDataService( this.helper.junctionService );

		super.init();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.helper.junctionDebugger.clear();
		this.helper.maneuverDebugger.clear();

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

		this.selectionService.handleSelection( e );

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

		this.helper.connectionService.addLink( junction, connection, link );

		this.helper.junctionDebugger.updateDebugState( junction, DebugState.SELECTED );

	}

	removeManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		this.helper.connectionService.removeLink( junction, connection, link );

		this.helper.junctionDebugger.updateDebugState( junction, DebugState.DEFAULT );

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) Log.debug( 'ManeuverTool.onObjectSelected', object?.toString() );

		if ( object instanceof ManeuverMesh ) {

			this.setInspector( new ManeuverInspector( object ) );

			this.helper.maneuverDebugger.updateDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof SplineControlPoint ) {

			this.setInspector( new ManeuverControlPointInspector( object ) );

		} else if ( object instanceof TvJunction ) {

			this.helper.junctionDebugger.updateDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectSelected( obj ) );

		}

	}

	onObjectUnselected ( object: any ) {

		if ( object instanceof ManeuverMesh ) {

			this.clearInspector();

			this.helper.maneuverDebugger.updateDebugState( object, DebugState.REMOVED );

		} else if ( object instanceof SplineControlPoint ) {

			this.clearInspector();

		} else if ( object instanceof TvJunction ) {

			this.helper.junctionDebugger.updateDebugState( object, DebugState.DEFAULT );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectUnselected( obj ) );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			this.helper.splineService.update( object.spline );

			const connectingRoad = this.findConnectingRoad( object.spline );

			if ( !connectingRoad ) return;

			this.helper.junctionDebugger.updateDebugState( connectingRoad.junction, DebugState.SELECTED );

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

		const road = this.helper.splineService.findFirstRoad( spline );

		if ( road.isJunction ) return;

		if ( !road.junction ) return;

		return road;
	}

}
