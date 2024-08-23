/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { ManeuverToolHelper } from 'app/tools/maneuver/maneuver-tool-helper.service';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { DebugState } from "../../services/debug/debug-state";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { ManeuverControlPointInspector, ManeuverInspector } from './maneuver.inspector';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { TvRoad } from "../../map/models/tv-road.model";
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { Log } from 'app/core/utils/log';
import { JunctionGatePoint } from "app/objects/junction-gate-point";
import { ControlPointStrategyV2 } from "../../core/strategies/select-strategies/control-point-strategy";
import { ObjectTagStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { FollowHeadingMovingStrategy } from "../../core/strategies/move-strategies/follow-heading-moving-strategy";
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { LaneUtils } from 'app/utils/lane.utils';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { JunctionOverlay } from 'app/services/junction/junction-overlay';
import { ManeuverOverlayHandler } from './maneuver-overlay-handler.service';
import { ManeuverObjectHandler } from './maneuver-object-handler.service';
import { ControlPointOverlayHandler, ManeuverControlPointHandler } from './control-point-object-handler';
import { JunctionGateHandler, JunctionGateOverlayHandler } from './junction-gate-object-handler';
import { maneuverToolHints } from './maneuver-tool.hints';

export enum ManeuverToolState {
	DEFAULT,
	ADD
}

export class ManeuverTool extends BaseTool<any> {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	debug = true;

	private toolState: ManeuverToolState = ManeuverToolState.DEFAULT;

	private lastGate: JunctionGatePoint;

	private line: Line2;

	protected get currentJunction (): TvJunction {
		return this.selectionService.getLastSelected<TvJunction>( TvJunction.name );
	}

	protected get currentGate (): JunctionGatePoint {
		return this.selectionService.getLastSelected<JunctionGatePoint>( JunctionGatePoint.name );
	}

	protected get currentSelectedPoint (): SplineControlPoint {
		return this.selectionService?.getLastSelected<SplineControlPoint>( SplineControlPoint.name );
	}

	constructor ( public helper: ManeuverToolHelper ) {

		super();

	}

	init () {

		this.selectionService = this.helper.base.selection;

		this.selectionService.registerStrategy( JunctionGatePoint.name, new ObjectTagStrategy( JunctionGatePoint.tag ) );
		this.selectionService.registerStrategy( SplineControlPoint.name, new ControlPointStrategyV2() );
		this.selectionService.registerStrategy( ManeuverMesh.name, new ObjectTagStrategy( ManeuverMesh.tag ) );
		this.selectionService.registerStrategy( TvJunction.name, new ObjectTagStrategy<JunctionOverlay>( JunctionOverlay.tag, 'junction' ) );

		this.selectionService.registerTag( SplineControlPoint.name, SplineControlPoint.name );
		this.selectionService.registerTag( ManeuverMesh.name, ManeuverMesh.name );
		this.selectionService.registerTag( TvJunction.name, TvJunction.name );

		this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

		this.setTypeName( TvJunction.name );
		this.setDebugService( this.helper.junctionDebugger );
		this.setDataService( this.helper.junctionService );

		this.objectHandlers.set( SplineControlPoint.name, this.helper.base.injector.get( ManeuverControlPointHandler ) );
		this.objectHandlers.set( JunctionGatePoint.name, this.helper.base.injector.get( JunctionGateHandler ) );
		this.objectHandlers.set( ManeuverMesh.name, this.helper.base.injector.get( ManeuverObjectHandler ) );

		this.overlayHandlers.set( SplineControlPoint.name, this.helper.base.injector.get( ControlPointOverlayHandler ) );
		this.overlayHandlers.set( JunctionGatePoint.name, this.helper.base.injector.get( JunctionGateOverlayHandler ) );
		this.overlayHandlers.set( ManeuverMesh.name, this.helper.base.injector.get( ManeuverOverlayHandler ) );

		this.setHintConfig( maneuverToolHints );

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

	getToolState (): ManeuverToolState {

		return this.toolState;

	}

	setToolState ( state: ManeuverToolState ): void {

		this.toolState = state;

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.highlightWithHandlers( e );

		this.updateDebugLine( e );

		this.updateControlPointIfSelected( e );

	}

	updateControlPointIfSelected ( e: PointerEventData ): void {

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const newPosition = this.selectionService.handleTargetMovement( e, this.currentSelectedPoint );

		this.currentSelectedPoint.copyPosition( newPosition.position );

		this.currentSelectedPointMoved = true;

	}

	updateDebugLine ( e: PointerEventData ): void {

		if ( !this.line || !this.lastGate ) return;

		if ( this.toolState != ManeuverToolState.ADD ) return;

		const positions = [ this.lastGate.position, e.point ];

		DebugDrawService.instance.updateDebugLine( this.line, positions );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onObjectAdded ( object: any ): void {

		Log.debug( 'ManeuverTool.onObjectAdded', object?.toString() );

		if ( this.objectHasHandlers( object ) ) {
			this.handleAction( object, 'onAdded' );
			return;
		}

		if ( object instanceof ManeuverMesh ) {

			this.addManeuver( object.junction, object.connection, object.link );

		} else {

			Log.error( 'Invalid object added' );
			console.error( 'Invalid object added', object );

		}

	}

	onObjectRemoved ( object: any ): void {

		Log.debug( 'ManeuverTool.onObjectRemoved', object?.toString() );

		if ( this.objectHasHandlers( object ) ) {
			this.handleAction( object, 'onRemoved' );
			return;
		}

		if ( object instanceof ManeuverMesh ) {

			this.removeManeuver( object.junction, object.connection, object.link );

		} else {

			Log.error( 'Invalid object removed' );
			console.error( 'Invalid object removed', object );
		}

	}

	addConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): void {

		const connection = this.createConnection( junction, incoming, outgoing );

		if ( !connection || connection.laneLink.length === 0 ) {
			Log.error( 'Unable to create connection or link' );
			return;
		}

		const link = connection.laneLink[ 0 ];

		while ( junction.hasConnection( connection.id ) ) {
			connection.id = connection.id + 1;
		}

		const mesh = this.helper.junctionDebugger.createManeuver( junction, connection, link );

		if ( !mesh ) {
			Log.error( 'Unable to create maneuver mesh' );
			return;
		}

		this.executeAddObject( mesh );

	}

	createConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvJunctionConnection | undefined {

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

		return connection;
	}

	addManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ): void {

		this.helper.connectionService.addLink( junction, connection, link );

		this.helper.junctionDebugger.updateDebugState( junction, DebugState.SELECTED );

	}

	removeManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ): void {

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

		if ( this.objectHasHandlers( object ) ) {
			this.handleSelectionWithHandlers( object );
			return;
		}

		if ( object instanceof JunctionGatePoint ) {

			this.onJunctionGateSelected( object );

			return;
		}

		if ( this.lastGate ) this.onJunctionGateUnselected( this.lastGate );

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

	onObjectUnselected ( object: any ): void {

		Log.debug( 'ManeuverTool.onObjectUnselected', object?.toString() );

		if ( this.objectHasHandlers( object ) ) {

			this.handleUnselectionWithHandlers( object );

			return;
		}

		if ( object instanceof JunctionGatePoint ) {

			this.onJunctionGateUnselected( object );

			return;
		}

		if ( this.lastGate ) this.onJunctionGateUnselected( this.lastGate );

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

		Log.debug( 'ManeuverTool.onObjectUpdated', object?.toString() );

		if ( this.objectHasHandlers( object ) ) {
			this.handleAction( object, 'onUpdated' );
			return;
		}

		if ( object instanceof SplineControlPoint ) {

			this.onControlPointUpdated( object );

		} else {

			super.onObjectUpdated( object );

		}

	}

	onControlPointUpdated ( object: SplineControlPoint ): void {

		const connectingRoad = this.findConnectingRoad( object.spline );

		if ( !connectingRoad ) {
			Log.error( 'Connecting road not found' );
			return;
		}

		this.helper.splineService.update( object.spline );

		// this.helper.junctionDebugger.updateDebugState( connectingRoad.junction, DebugState.SELECTED );

		this.markAsDirty( connectingRoad.junction, connectingRoad );

		const mesh = this.helper.junctionDebugger.findMesh( connectingRoad.junction, connectingRoad );


		if ( !mesh ) {
			Log.error( 'ManeuverMesh not found' );
			return;
		}

		this.onObjectUpdated( mesh );

	}

	onDeleteKeyDown (): void {

		// dont delete anything via keyboard for now

	}

	private markAsDirty ( junction: TvJunction, connectingRoad: TvRoad ): void {

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

	private onJunctionGateUnselected ( object: JunctionGatePoint ): void {

		if ( !this.lastGate ) return;

		if ( this.lastGate != object ) return;

		// HACK: to unset the last selected gate after selecting a new one
		setTimeout( () => {

			this.resetGateSelection( object );

		}, 100 );

	}

	private resetGateSelection ( second: JunctionGatePoint ): void {

		this.lastGate?.unselect();

		second?.unselect();

		DebugDrawService.instance.removeLine( this.line );

		this.lastGate = null;

		this.line = null;

		this.setToolState( ManeuverToolState.DEFAULT );

		this.selectionService.unselectObjectsOfType( JunctionGatePoint.name );

	}

	private onJunctionGateSelected ( object: JunctionGatePoint ): void {

		object.select();

		if ( this.isFirstGate() ) {

			this.handleFirstGateSelection( object );

			this.setToolState( ManeuverToolState.ADD );

		} else {

			this.handleSecondGateSelection( this.lastGate, object );

			this.resetGateSelection( object );

		}

	}

	private isFirstGate (): boolean {

		return !this.lastGate;

	}

	private handleFirstGateSelection ( object: JunctionGatePoint ): void {

		this.lastGate = object;

		const position = object.position.clone();

		this.line = DebugDrawService.instance.drawLine( [ position, position.addScalar( 0.1 ) ] );

	}

	private handleSecondGateSelection ( first: JunctionGatePoint, second: JunctionGatePoint ): void {

		if ( !this.isValidForConnection( first, second ) ) {
			return;
		}

		this.addConnection( this.currentJunction, first.coord, second.coord );

	}

	private isValidForConnection ( first: JunctionGatePoint, second: JunctionGatePoint ): boolean {

		if ( !LaneUtils.canConnect( first.coord, second.coord ) ) {

			this.setHint( 'Cannot connect gates with invalid lane directions' );

			Log.error( 'Invalid lane directions' );

			return;
		}

		if ( first.coord.road == second.coord.road ) {

			this.setHint( 'Cannot connect gates from same roads' );

			Log.error( 'Cannot connect gates from same roads' );

			return false;

		}

		if ( !this.currentJunction ) {

			this.setHint( 'No junction selected' );

			Log.error( 'No junction selected' );

			return false;

		}

		return true;

	}


}
