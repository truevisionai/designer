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
import { JunctionGatePoint, SimpleControlPoint } from "../../objects/simple-control-point";
import { ControlPointStrategy } from "../../core/strategies/select-strategies/control-point-strategy";
import { ObjectTagStrategy, ObjectUserDataStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { FollowHeadingMovingStrategy } from "../../core/strategies/move-strategies/follow-heading-moving-strategy";
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { LaneUtils } from 'app/utils/lane.utils';
import { Line2 } from 'three/examples/jsm/lines/Line2';

export class ManeuverTool extends BaseTool<any> {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	debug = true;

	private lastGate: JunctionGatePoint;

	private line: Line2;

	protected get currentJunction (): TvJunction {
		return this.selectionService?.getLastSelected<TvJunction>( TvJunction.name );
	}

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

		if ( this.lastGate ) {

			const positions = [ this.lastGate.position, e.point ];

			if ( this.line ) {

				DebugDrawService.instance.updateDebugLine( this.line, positions );

			}

		}

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		if ( this.currentSelectedPoint instanceof JunctionGatePoint ) return;

		const newPosition = this.selectionService.handleTargetMovement( e, this.currentSelectedPoint );

		this.currentSelectedPoint.copyPosition( newPosition.position );

		this.currentSelectedPointMoved = true;

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onObjectAdded ( object: any ): void {

		Log.debug( 'ManeuverTool.onObjectAdded', object?.toString() );

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

			Log.error( 'Invalid object added' );
			console.error( 'Invalid object added', object );

		}

	}

	onObjectRemoved ( object: any ): void {

		Log.debug( 'ManeuverTool.onObjectRemoved', object?.toString() );

		if ( object instanceof ManeuverMesh ) {

			this.removeManeuver( object.junction, object.connection, object.link );

		} else {

			Log.error( 'Invalid object removed' );
			console.error( 'Invalid object removed', object );
		}

	}

	createManever ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ) {

		if ( !LaneUtils.canConnect( incoming, outgoing ) ) {
			Log.error( 'Invalid lane directions' );
			return;
		}

		const entry = LaneUtils.isEntry( incoming.lane, incoming.contact ) ? incoming : outgoing;
		const exit = LaneUtils.isExit( outgoing.lane, outgoing.contact ) ? outgoing : incoming;

		if ( entry === exit ) {
			Log.error( 'Invalid entry or exit' );
			return;
		}

		const connection = this.helper.connectionFactory.createSingleConnection( junction, entry, exit );

		if ( !connection ) {
			Log.error( 'Unable to create connection' );
			return;
		}

		const link = connection.laneLink[ 0 ];

		if ( !link ) {
			Log.error( 'Unable to create link' );
			return;
		}

		while ( junction.connections.has( connection.id ) ) {
			connection.id = connection.id + 1;
		}

		const mesh = this.helper.junctionDebugger.createManeuver( junction, connection, link );

		if ( !mesh ) {
			Log.error( 'Unable to create maneuver mesh' );
			return;
		}

		this.executeAddAndSelect( mesh, null );

	}

	addManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		this.helper.connectionService.addLink( junction, connection, link );

		this.helper.junctionDebugger.updateDebugState( junction, DebugState.SELECTED );

	}

	removeManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		const mesh = this.helper.junctionDebugger.findMesh( junction, connection.connectingRoad );

		if ( !mesh ) {

			Log.error( 'ManeuverMesh not found' );

		} else {

			this.helper.maneuverDebugger.onRemoved( mesh );

		}

		this.helper.maneuverDebugger.clear();

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

		} else if ( object instanceof JunctionGatePoint ) {

			if ( !this.lastGate ) {
				this.lastGate = object;
				const positions = [ object.position, object.position.addScalar( 0.1 ) ];
				this.line = DebugDrawService.instance.drawLine( positions );
				return;
			}

			if ( object.coord.road == this.lastGate.coord.road ) {
				Log.error( 'Cannot connect gates from same roads' );
				DebugDrawService.instance.removeLine( this.line );
				this.lastGate = null;
				return;
			}

			if ( !this.currentJunction ) {
				Log.error( 'No junction selected' );
				DebugDrawService.instance.removeLine( this.line );
				this.lastGate = null;
				return;
			}

			const incoming = this.lastGate.coord;
			const outgoing = object.coord;

			if ( !incoming || !outgoing ) {
				Log.error( 'Invalid lane coords' );
				return;
			}

			this.createManever( this.currentJunction, incoming, outgoing );

			DebugDrawService.instance.removeLine( this.line );

			this.lastGate = null;

			this.line = null;

		}

	}

	onObjectUnselected ( object: any ) {

		Log.debug( 'ManeuverTool.onObjectUnselected', object?.toString() );

		if ( object instanceof ManeuverMesh ) {

			this.clearInspector();

			this.helper.maneuverDebugger.updateDebugState( object, DebugState.REMOVED );

		} else if ( object instanceof SplineControlPoint ) {

			this.clearInspector();

		} else if ( object instanceof TvJunction ) {

			this.helper.junctionDebugger.updateDebugState( object, DebugState.DEFAULT );

		} else if ( object instanceof JunctionGatePoint ) {

			if ( !this.lastGate ) return;

			if ( this.lastGate != object ) return;

			// HACK: to unset the last selected gate after selecting a new one
			setTimeout( () => {

				this.lastGate = null;

			}, 100 );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectUnselected( obj ) );

		}

	}

	onObjectUpdated ( object: any ): void {

		Log.debug( 'ManeuverTool.onObjectUpdated', object?.toString() );

		if ( object instanceof SplineControlPoint ) {

			const connectingRoad = this.findConnectingRoad( object.spline );

			if ( !connectingRoad ) {
				Log.error( 'Connecting road not found' );
				return;
			}

			this.helper.splineService.update( object.spline );

			this.helper.junctionDebugger.updateDebugState( connectingRoad.junction, DebugState.SELECTED );

			this.markAsDirty( connectingRoad.junction, connectingRoad );

			const mesh = this.helper.junctionDebugger.findMesh( connectingRoad.junction, connectingRoad );

			if ( !mesh ) {
				Log.error( 'ManeuverMesh not found' );
				return;
			}

			mesh.select();

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

		if ( !road.isJunction ) return;

		return road;
	}

}
