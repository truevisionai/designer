/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Debug } from 'app/core/utils/debug';
import { IFile } from '../../../core/models/file';
import { AbstractReader } from '../../../core/services/abstract-reader';
import { FileService } from '../../../services/file.service';
import { AbstractTarget } from '../models/actions/abstract-target';
import { OscAbsoluteTarget } from '../models/actions/osc-absolute-target';
import { OscDistanceAction } from '../models/actions/osc-distance-action';
import { OscFollowTrajectoryAction } from '../models/actions/osc-follow-trajectory-action';
import { OscLaneChangeAction } from '../models/actions/osc-lane-change-action';
import { OscPositionAction } from '../models/actions/osc-position-action';
import { OscLaneChangeDynamics, OscSpeedDynamics } from '../models/actions/osc-private-action';
import { OscRelativeTarget } from '../models/actions/osc-relative-target';
import { AbstractRoutingAction, FollowRouteAction, LongitudinalPurpose, LongitudinalTiming } from '../models/actions/osc-routing-action';
import { OscSpeedAction } from '../models/actions/osc-speed-action';
import { OscAfterTerminationCondition } from '../models/conditions/osc-after-termination-condition';
import { OscAtStartCondition } from '../models/conditions/osc-at-start-condition';
import { AbstractByEntityCondition, AbstractCondition } from '../models/conditions/osc-condition';
import { OscConditionGroup } from '../models/conditions/osc-condition-group';
import { OscDistanceCondition } from '../models/conditions/osc-distance-condition';
import { OscReachPositionCondition } from '../models/conditions/osc-reach-position-condition';
import { OscRelativeSpeedCondition } from '../models/conditions/osc-relative-speed-condition';
import { OscSimulationTimeCondition } from '../models/conditions/osc-simulation-time-condition';
import { OscSpeedCondition } from '../models/conditions/osc-speed-condition';
import { OscTraveledDistanceCondition } from '../models/conditions/osc-traveled-distance-condition';
import { OscAct } from '../models/osc-act';
import { OscCatalogReference, OscCatalogs, TrajectoryCatalog } from '../models/osc-catalogs';
import { OscDirectory, OscFile } from '../models/osc-common';
import { OscEntityObject } from '../models/osc-entities';
import { OscConditionEdge, OscRule } from '../models/osc-enums';
import { OscEvent } from '../models/osc-event';
import { OscFileHeader } from '../models/osc-file-header';
import {
	AbstractAction,
	AbstractController,
	AbstractPosition,
	AbstractPrivateAction,
	CatalogReferenceController
} from '../models/osc-interfaces';
import { OscEventAction, OscManeuver } from '../models/osc-maneuver';
import { OscOrientation } from '../models/osc-orientation';
import { OscParameter, OscParameterDeclaration } from '../models/osc-parameter-declaration';
import { OscRoadNetwork } from '../models/osc-road-network';
import { OscRoute, OscWaypoint } from '../models/osc-route';
import { OpenScenario } from '../models/osc-scenario';
import { OscSequence } from '../models/osc-sequence';
import { OscStory } from '../models/osc-story';
import { OscStoryboard } from '../models/osc-storyboard';
import {
	AbstractOscShape,
	OscClothoidShape,
	OscControlPoint,
	OscPolylineShape,
	OscSplineShape,
	OscTrajectory,
	OscVertex
} from '../models/osc-trajectory';
import { OscLanePosition } from '../models/positions/osc-lane-position';
import { OscRelativeLanePosition } from '../models/positions/osc-relative-lane-position';
import { OscRelativeObjectPosition } from '../models/positions/osc-relative-object-position';
import { OscWorldPosition } from '../models/positions/osc-world-position';

@Injectable( {
	providedIn: 'root'
} )
export class OscReaderService extends AbstractReader {

	private openScenario: OpenScenario;
	private file: IFile;

	constructor ( private fileService: FileService ) {
		super();
	}

	public readFromFile ( file: IFile ): OpenScenario {

		this.file = file;

		return this.readContents( this.file.contents );

	}

	public readContents ( xmlElement: string ): OpenScenario {

		this.openScenario = new OpenScenario();

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			textNodeName: 'value',
			ignoreAttributes: false,
			supressEmptyNode: false,
			format: true,
		};

		const Parser = require( 'fast-xml-parser' );
		const data: any = Parser.parse( xmlElement, defaultOptions );

		Debug.log( data );

		this.readOpenScenario( data, this.openScenario );

		Debug.log( this.openScenario );

		return this.openScenario;
	}

	readCondition ( xml: any ) {

		let condition: AbstractCondition = null;

		const name = xml.attr_name;
		const delay = xml.attr_delay ? parseFloat( xml.attr_delay ) : 0;
		const edge = xml.attr_edge;

		if ( xml.ByEntity != null ) {

			condition = this.readByEntityCondition( xml.ByEntity );

		} else if ( xml.ByValue != null ) {

			condition = this.readConditionByValue( xml.ByValue );

		} else if ( xml.ByState != null ) {

			condition = this.readConditionByState( xml.ByState );

		} else {

			throw new Error( 'Unknown condition type' );

		}

		if ( condition != null ) {

			condition.name = name ? name : '';
			condition.delay = delay ? delay : 0;
			condition.edge = edge ? edge : OscConditionEdge.any;

		}

		return condition;

	}

	public readFileHeader ( xmlElement: any ) {

		return new OscFileHeader(
			parseFloat( xmlElement.attr_revMajor ),
			parseFloat( xmlElement.attr_revMinor ),
			xmlElement.attr_date,
			xmlElement.attr_description,
			xmlElement.attr_author,
		);

	}

	readLongitudinalPurpose ( xml: any ): LongitudinalPurpose {

		let longitudinalPurpose = new LongitudinalPurpose;

		if ( xml.Timing != null ) {

			let domain = xml.Timing.attr_domain;
			let scale = parseFloat( xml.Timing.attr_scale );
			let offset = parseFloat( xml.Timing.attr_offset );

			longitudinalPurpose.timing = new LongitudinalTiming( domain, scale, offset );

		} else if ( xml.None != null ) {

			// do nothing

		}

		return longitudinalPurpose;
	}

	public readRoadNetwork ( xml: any ) {

		let logics, sceneGraph;

		if ( xml.Logics != null ) {

			logics = this.readOscFile( xml.Logics );

		}

		if ( xml.SceneGraph != null ) {

			sceneGraph = this.readOscFile( xml.SceneGraph );
		}

		// TODO: RoadSignals

		return new OscRoadNetwork( logics, sceneGraph );
	}

	public readEntities ( xml: any ): OscEntityObject[] {

		const objects: OscEntityObject[] = [];

		this.readAsOptionalArray( xml.Object, ( object, count ) => {

			const oscObject = this.readEntityObject( object );

			objects.push( oscObject );

		} );

		return objects;

	}

	public readEntityObject ( xml: any ): OscEntityObject {

		const name = xml.attr_name;

		const oscEntityObject = new OscEntityObject( name );

		if ( xml.CatalogReference != null ) {

			oscEntityObject.catalogReference = this.readCatalogReference( xml.CatalogReference );

		} else if ( xml.Vehicle != null ) {

		} else if ( xml.Pedestrian != null ) {

		} else if ( xml.MiscObject != null ) {

		}

		this.readAsOptionalElement( xml.Controller, ( xml ) => {

			oscEntityObject.controller = this.readController( xml );

		} );

		return oscEntityObject;

	}

	public readController ( xml: any ): AbstractController {

		let response: AbstractController = null;

		Debug.log( xml );

		if ( xml.CatalogReference != null ) {

			const catalogReference = OscCatalogReference.readXml( xml.CatalogReference );

			response = new CatalogReferenceController( catalogReference );

		} else if ( xml.Driver != null ) {

		} else if ( xml.PedestrianController != null ) {

		}

		Debug.log( response );

		return response;
	}

	public readOscFile ( xml ) {

		return new OscFile( xml.attr_filepath );

	}

	readConditionGroup ( xml: any ): OscConditionGroup {

		const conditionGroup = new OscConditionGroup;

		this.readAsOptionalArray( xml.Condition, ( xml ) => {

			conditionGroup.addCondition( this.readCondition( xml ) );

		} );

		return conditionGroup;

	}

	readWorldPosition ( xml: any ) {

		const worldPosition = new OscWorldPosition;

		worldPosition.x = parseFloat( xml.attr_x );
		worldPosition.y = parseFloat( xml.attr_y );
		worldPosition.z = parseFloat( xml.attr_z );

		worldPosition.m_H = parseFloat( xml.attr_h );
		worldPosition.m_P = parseFloat( xml.attr_p );
		worldPosition.m_R = parseFloat( xml.attr_r );

		worldPosition.updateVector3();

		return worldPosition;
	}

	readByEntityCondition ( xml: any ): AbstractCondition {

		let condition: AbstractByEntityCondition = null;

		condition = this.readConditionByEntity( xml.EntityCondition );

		this.readAsOptionalElement( xml.TriggeringEntities, ( xml ) => {

			this.readAsOptionalArray( xml.Entity, ( xml ) => {

				condition.entities.push( xml.attr_name );

			} );

			condition.triggeringRule = xml.attr_rule;

		} );

		return condition;
	}

	readConditionByEntity ( xml: any ): AbstractByEntityCondition {

		let condition: AbstractByEntityCondition = null;

		if ( xml.EndOfRoad != null ) {

			throw new Error( 'EndOfRoad condition not supported' );

		} else if ( xml.Collision != null ) {

			throw new Error( 'Collision condition not supported' );

		} else if ( xml.Offroad != null ) {

			throw new Error( 'Offroad condition not supported' );

		} else if ( xml.TimeHeadway != null ) {

			throw new Error( 'TimeHeadway condition not supported' );

		} else if ( xml.TimeToCollision != null ) {

			throw new Error( 'TimeToCollision condition not supported' );

		} else if ( xml.Acceleration != null ) {

			throw new Error( 'Acceleration condition not supported' );

		} else if ( xml.StandStill != null ) {

			throw new Error( 'StandStill condition not supported' );

		} else if ( xml.Speed != null ) {

			condition = this.readSpeedCondition( xml.Speed );

		} else if ( xml.RelativeSpeed != null ) {

			condition = this.readRelativeSpeedCondition( xml.RelativeSpeed );

		} else if ( xml.TraveledDistance != null ) {

			condition = this.readTraveledDistanceCondition( xml.TraveledDistance );

		} else if ( xml.ReachPosition != null ) {

			condition = this.readReachPositionCondition( xml.ReachPosition );

		} else if ( xml.Distance != null ) {

			condition = this.readDistanceCondition( xml.Distance );

		} else if ( xml.RelativeDistance != null ) {

			throw new Error( 'RelativeDistance condition not supported' );

		} else {

			throw new Error( 'Unknown ByEntity condition' );

		}

		return condition;

	}

	readTraveledDistanceCondition ( xml: any ): OscTraveledDistanceCondition {

		const value = xml.attr_value;

		return new OscTraveledDistanceCondition( value );
	}

	readRelativeSpeedCondition ( xml: any ): OscRelativeSpeedCondition {

		const entity = xml.attr_entity;
		const value = xml.attr_value;
		const rule = this.convertStringToRule( xml.attr_rule );

		return new OscRelativeSpeedCondition( entity, value, rule );
	}

	readReachPositionCondition ( xml: any ): OscReachPositionCondition {

		const position = this.readPosition( xml.Position );
		const tolerance = parseFloat( xml.attr_tolerance );

		return new OscReachPositionCondition( position, tolerance );
	}

	readDistanceCondition ( xml: any ): OscDistanceCondition {

		const value = parseFloat( xml.attr_value );
		const freespace = xml.attr_freespace;
		const alongRoute = xml.attr_alongRoute;
		const rule = this.convertStringToRule( xml.attr_rule );
		const position = this.readPosition( xml.Position );

		return new OscDistanceCondition( position, value, freespace, alongRoute, rule );
	}

	readConditionByValue ( xml: any ): AbstractCondition {

		let condition: AbstractCondition = null;

		if ( xml.Parameter != null ) {
		} else if ( xml.TimeOfDay != null ) {
		} else if ( xml.SimulationTime != null ) {
			condition = this.readSimulationTimeCondition( xml.SimulationTime );
		} else {
			throw new Error( 'unknown condition '.concat( xml ) );
		}

		return condition;
	}

	readSimulationTimeCondition ( xml: any ): AbstractCondition {

		const value = parseFloat( xml.attr_value );
		const rule = this.convertStringToRule( xml.attr_rule );

		return new OscSimulationTimeCondition( value, rule );
	}

	convertStringToRule ( rule: string ): OscRule {

		let res: OscRule;

		switch ( rule ) {

			case 'greater_than':
				res = OscRule.greater_than;
				break;

			case 'less_than':
				res = OscRule.less_than;
				break;

			case 'equal_to':
				res = OscRule.equal_to;
				break;

			default:
				throw new Error( 'unknown rule given' );
		}

		return res;

	}

	readConditionByState ( xml: any ): AbstractCondition {

		let condition: AbstractCondition = null;

		if ( xml.AtStart != null ) {
			condition = this.readAtStartCondition( xml.AtStart );
		} else if ( xml.AfterTermination != null ) {
		} else if ( xml.Command != null ) {
		} else if ( xml.Signal != null ) {
		} else if ( xml.Controller != null ) {
		} else {
			console.error( 'unknown condition', xml );
		}

		return condition;
	}

	readAtStartCondition ( xml: any ): AbstractCondition {

		let type = xml.attr_type;
		let elementName = xml.attr_name;

		return new OscAtStartCondition( elementName, type );
	}

	readAfterTerminationCondition ( xml: any ): AbstractCondition {

		let type = xml.attr_type;
		let elementName = xml.attr_name;
		let rule = xml.attr_rule;


		return new OscAfterTerminationCondition( elementName, rule, type );
	}

	public readStory ( xml: any ): OscStory {

		let name = xml.attr_name;
		let ownerName = xml.attr_owner ? xml.attr_owner : null;

		const story = new OscStory( name, ownerName );

		this.readAsOptionalArray( xml.Act, ( xml ) => {

			story.addAct( this.readAct( xml ) );

		} );

		return story;
	}

	readAct ( xml: any ): OscAct {

		const act = new OscAct;

		act.name = xml.attr_name;

		this.readAsOptionalArray( xml.Sequence, ( xml ) => {

			act.addSequence( this.readSequence( xml ) );

		} );

		if ( xml.Conditions != null ) {

			// Start is a single element
			this.readAsOptionalElement( xml.Conditions.Start, ( xml ) => {
				this.readAsOptionalArray( xml.ConditionGroup, ( xml ) => {
					act.startConditionGroups.push( this.readConditionGroup( xml ) );
				} );
			} );

			// TODO: Fix End could also be an array
			this.readAsOptionalElement( xml.Conditions.End, ( xml ) => {
				this.readAsOptionalArray( xml.ConditionGroup, ( xml ) => {
					act.endConditionGroups.push( this.readConditionGroup( xml ) );
				} );
			} );

			// TODO: Fix Cancel could also be an array
			this.readAsOptionalElement( xml.Conditions.Cancel, ( xml ) => {
				this.readAsOptionalArray( xml.ConditionGroup, ( xml ) => {
					act.cancelConditionGroups.push( this.readConditionGroup( xml ) );
				} );
			} );

		}

		return act;

	}

	readSequence ( xml: any ): OscSequence {

		const sequence = new OscSequence;

		sequence.name = xml.attr_name;
		sequence.numberOfExecutions = parseFloat( xml.attr_numberOfExecutions );

		// read actors
		this.readAsOptionalElement( xml.Actors, ( xml ) => {

			this.readAsOptionalArray( xml.Entity, ( xml ) => {

				sequence.actors.push( xml.attr_name );

			} );

		} );

		// read catalogReference
		// read maneuvers

		this.readAsOptionalArray( xml.Maneuver, ( xml ) => {

			sequence.addManeuver( this.readManeuver( xml ) );

		} );

		return sequence;
	}

	readManeuver ( xml: any ): OscManeuver {

		const maneuver = new OscManeuver( xml.attr_name );

		this.readAsOptionalArray( xml.Event, ( xml ) => {

			maneuver.addEventInstance( this.readEvent( xml ) );

		} );

		return maneuver;
	}

	readEvent ( xml: any ): OscEvent {

		const event = new OscEvent;

		event.name = xml.attr_name;
		event.priority = xml.attr_priority;

		this.readAsOptionalArray( xml.Action, ( xml ) => {

			const action = this.readEventAction( xml );

			event.addNewAction( action.name, action.action );

		} );

		if ( xml.StartConditions != null ) {

			this.readAsOptionalArray( xml.StartConditions.ConditionGroup, ( xml ) => {

				event.startConditionGroups.push( this.readConditionGroup( xml ) );

			} );

		}

		return event;
	}

	readEventAction ( xml: any ): OscEventAction {

		const action = new OscEventAction;

		action.name = xml.attr_name;

		if ( xml.Private != null ) {

			action.action = this.readPrivateAction( xml.Private );

		} else if ( xml.UserDefined != null ) {

			action.action = this.readUserDefinedAction( xml.UserDefined );

		} else if ( xml.Global != null ) {

			action.action = this.readGlobalAction( xml.Global );

		}

		return action;
	}

	public readInitActions ( xml: any, storyboard: OscStoryboard ) {

		this.readAsOptionalArray( xml.Global, ( item ) => {

			const globalAction = this.readGlobalAction( item );

		} );

		this.readAsOptionalArray( xml.UserDefined, ( item ) => {

			const userDefinedAction = this.readUserDefinedAction( item );

		} );

		// Read the Private tag
		if ( xml.Private != null ) {

			this.readAsOptionalArray( xml.Private, ( xml ) => {

				const object = xml.attr_object;

				const entity = this.openScenario.objects.get( object );

				if ( !entity ) console.error( 'entity not found', xml );
				if ( !entity ) return;

				// Read the Action tag inside Private
				this.readAsOptionalArray( xml.Action, ( xml ) => {

					const action = this.readPrivateAction( xml );

					// storyboard.addPrivateInitAction( object, action );

					entity.initActions.push( action );

				} );

			} );
		}

	}

	readUserDefinedAction ( item: any ): AbstractAction {

		throw new Error( 'Method not implemented.' );

	}

	readGlobalAction ( item: any ): AbstractAction {

		throw new Error( 'Method not implemented.' );

	}

	readPrivateAction ( item: any ): AbstractPrivateAction {

		let action = null;

		if ( item.Longitudinal != null ) {

			action = this.readLongitudinalAction( item.Longitudinal );

		} else if ( item.Lateral != null ) {

			action = this.readLateralAction( item.Lateral );

		} else if ( item.Visibility != null ) {

			throw new Error( 'action not implemented' );

		} else if ( item.Meeting != null ) {

			throw new Error( 'action not implemented' );

		} else if ( item.Autonomous != null ) {

			throw new Error( 'action not implemented' );

		} else if ( item.Controller != null ) {

			throw new Error( 'action not implemented' );

		} else if ( item.Position != null ) {

			action = this.readPositionAction( item.Position );

		} else if ( item.Routing != null ) {

			action = this.readRoutingAction( item.Routing );

		} else {

			throw new Error( 'Unknown private action' );

		}

		return action;

	}

	readLateralAction ( xml: any ): AbstractAction {

		let action: AbstractAction = null;

		if ( xml.LaneChange != null ) {
			action = this.readLaneChangeAction( xml.LaneChange );
		} else if ( xml.LaneOffset != null ) {
		} else if ( xml.Distance != null ) {
		} else {
			console.error( 'unknown lateral action' );
		}

		return action;

	}

	readRoutingAction ( xml: any ): AbstractRoutingAction {

		let action: AbstractRoutingAction = null;

		if ( xml.FollowRoute != null ) {

			action = this.readFollowRouteAction( xml.FollowRoute );

		} else if ( xml.FollowTrajectory != null ) {

			action = this.readFollowTrajectoryAction( xml.FollowTrajectory );

		} else if ( xml.AcquirePosition != null ) {

		} else {

			throw new Error( 'unknown routing action' );

		}

		return action;
	}

	readFollowTrajectoryAction ( xml: any ): OscFollowTrajectoryAction {

		let trajectory: OscTrajectory = null;

		if ( xml.Trajectory != null ) {

			trajectory = this.readTrajectory( xml.Trajectory );

		} else if ( xml.CatalogReference != null ) {

			throw new Error( 'unsupported readFollowTrajectoryAction CatalogReference' );

		}

		let action = new OscFollowTrajectoryAction( trajectory );

		action.lateralPurpose = xml.Lateral.attr_purpose;
		action.longitudinalPurpose = this.readLongitudinalPurpose( xml.Longitudinal );

		return action;
	}

	readTrajectory ( xml: any ): OscTrajectory {

		let name = xml.attr_name;
		let closed = xml.attr_closed == 'true';
		let domain = xml.attr_domain;

		const trajectory = new OscTrajectory( name, closed, domain );

		this.readAsOptionalArray( xml.ParameterDeclaration, ( xml ) => {

			trajectory.parameterDeclaration.push( this.readParameterDeclaration( xml ) );

		} );

		this.readAsOptionalArray( xml.Vertex, ( xml ) => {

			trajectory.vertices.push( this.readVertex( xml ) );

		} );

		return trajectory;
	}

	readFollowRouteAction ( xml: any ): FollowRouteAction {

		let route: OscRoute = null;

		if ( xml.Route != null ) {

			route = this.readRoute( xml.Route );

		} else if ( xml.CatalogReference != null ) {

			throw new Error( 'unsupported follow route action CatalogReference' );

		}

		const action = new FollowRouteAction( route );

		return action;
	}

	readRoute ( xml: any ): OscRoute {

		let route = new OscRoute;

		route.name = xml.attr_name;
		route.closed = xml.attr_closed == 'true' ? true : false;

		this.readAsOptionalArray( xml.ParameterDeclaration, ( xml ) => {

			route.parameterDeclaration.push( this.readParameterDeclaration( xml ) );

		} );

		this.readAsOptionalArray( xml.Waypoint, ( xml ) => {

			route.waypoints.push( this.readWaypoint( xml ) );

		} );

		return route;
	}

	readWaypoint ( xml: any ): OscWaypoint {

		let position = this.readPosition( xml.Position );
		let strategy = xml.attr_strategy;

		return new OscWaypoint( position, strategy );
	}

	readLaneChangeAction ( xml: any ): AbstractAction {

		const action = new OscLaneChangeAction();

		action.targetLaneOffset = parseFloat( xml.attr_targetLaneOffset );

		action.dynamics = this.readLaneChangeDynamics( xml.Dynamics );

		action.target = this.readTarget( xml.Target );

		return action;

	}

	readLaneChangeDynamics ( xml: any ): OscLaneChangeDynamics {

		const dynamics = new OscLaneChangeDynamics;

		dynamics.shape = xml.attr_shape;

		dynamics.rate = xml.attr_rate ? parseFloat( xml.attr_rate ) : null;

		dynamics.time = xml.attr_time ? parseFloat( xml.attr_time ) : null;

		dynamics.distance = xml.attr_distance ? parseFloat( xml.attr_distance ) : null;

		return dynamics;

	}

	readSpeedDynamics ( xml: any ): OscSpeedDynamics {

		let dynamics = new OscSpeedDynamics;

		dynamics.shape = xml.attr_shape;

		dynamics.rate = xml.attr_rate ? parseFloat( xml.attr_rate ) : null;

		dynamics.time = xml.attr_time ? parseFloat( xml.attr_time ) : null;

		dynamics.distance = xml.attr_distance ? parseFloat( xml.attr_distance ) : null;

		return dynamics;

	}

	readPositionAction ( xml: any ): AbstractPrivateAction {

		let position = this.readPosition( xml );

		return new OscPositionAction( position );

	}

	readPosition ( xml: any ): AbstractPosition {

		let position: AbstractPosition = null;

		if ( xml.World != null ) {

			position = this.readWorldPosition( xml.World );

		} else if ( xml.RelativeObject != null ) {

			position = this.readRelativeObjectPosition( xml.RelativeObject );

		} else if ( xml.RelativeLane != null ) {

			position = this.readRelativeLanePosition( xml.RelativeLane );

		} else if ( xml.Lane != null ) {

			position = this.readLanePosition( xml.Lane );

		} else {

			throw new Error( 'unknown position' );

		}

		return position;
	}

	readLanePosition ( xml: any ): AbstractPosition {

		let roadId = parseFloat( xml.attr_roadId );
		let laneId = parseFloat( xml.attr_laneId );
		let s = parseFloat( xml.attr_s );

		let laneOffset = null;

		if ( xml.attr_offset != null ) laneOffset = parseFloat( xml.attr_offset );

		return new OscLanePosition( roadId, laneId, laneOffset, s, null );
	}

	readRelativeLanePosition ( xml: any ): AbstractPosition {

		const position = new OscRelativeLanePosition();

		position.object = xml.attr_object;
		position.dLane = parseFloat( xml.attr_dLane );
		position.ds = parseFloat( xml.attr_ds );
		position.offset = parseFloat( xml.attr_offset );

		this.readAsOptionalArray( xml.Orientation, ( xml ) => {

			position.orientations.push( this.readOrientation( xml ) );

		} );

		return position;
	}

	readRelativeObjectPosition ( xml: any ): AbstractPosition {

		const position = new OscRelativeObjectPosition();

		position.object = xml.attr_object;
		position.dx = xml.attr_dx ? parseFloat( xml.attr_dx ) : null;
		position.dy = xml.attr_dy ? parseFloat( xml.attr_dy ) : null;
		position.dz = xml.attr_dz ? parseFloat( xml.attr_dz ) : null;

		this.readAsOptionalArray( xml.Orientation, ( xml ) => {

			position.orientations.push( this.readOrientation( xml ) );

		} );

		return position;
	}

	readOrientation ( xml: any ): OscOrientation {

		const orientation = new OscOrientation;

		orientation.h = xml.attr_h ? parseFloat( xml.attr_h ) : null;
		orientation.p = xml.attr_p ? parseFloat( xml.attr_p ) : null;
		orientation.r = xml.attr_r ? parseFloat( xml.attr_r ) : null;

		orientation.type = xml.attr_type ? xml.attr_type : null;

		return orientation;
	}

	readLongitudinalAction ( xml: any ): any {

		let action = null;

		if ( xml.Speed != null ) {

			let action = new OscSpeedAction();

			action.dynamics = this.readSpeedDynamics( xml.Speed.Dynamics );

			action.setTarget( this.readTarget( xml.Speed.Target ) );

			return action;

		} else if ( xml.Distance != null ) {

			action = new OscDistanceAction();

		}

		return action;
	}

	readTarget ( xml: any ): AbstractTarget {

		let target = null;

		if ( xml.Absolute != null ) {

			const value = xml.Absolute.attr_value;

			target = new OscAbsoluteTarget( value );

		} else if ( xml.Relative != null ) {

			const value = parseFloat( xml.Relative.attr_value );

			const object = xml.Relative.attr_object;

			return new OscRelativeTarget( object, value );

		}

		return target;
	}

	readVertex ( xml: any ): OscVertex {

		const vertex = new OscVertex;

		vertex.reference = parseFloat( xml.attr_reference );
		vertex.position = this.readPosition( xml.Position );
		vertex.shape = this.readVertexShape( xml.Shape );

		return vertex;
	}

	readVertexShape ( xml: any ): AbstractOscShape {

		if ( xml.Polyline != null ) {

			return new OscPolylineShape;

		} else if ( xml.Clothoid != null ) {

			return this.readClothoidShape( xml.Clothoid );

		} else if ( xml.Spline != null ) {

			return this.readSplineShape( xml.Spline );

		} else {

			throw new Error( 'Unsupported or unknown vertex shape' );

		}
	}

	// private readInitActions ( xmlElement: any ) {
	//
	//     // oscStoryboard.m_InitActions = OscInitActions.readXml( Storyboard.Init.Actions );
	//
	//     this.readPrivateElements( xmlElement.Private, this.openScenario.storyboard.initActions );
	//
	// }
	//
	// private readStory ( xml: any ) {
	//
	//     // oscStoryboard.Story = OscStory.readXml( Storyboard.Story );
	// }
	//
	// private readPrivateElements ( xml: any, initActions: OscInitActions ) {
	//
	//     let owner = xml.attr_object;
	//
	//     if ( Array.isArray( xml ) ) {
	//
	//         for ( let i = 0; i < xml.length; i++ ) {
	//
	//             initActions.addPrivateAction( owner, this.readPrivateElement( xml[i] ) );
	//
	//         }
	//
	//     } else {
	//
	//         initActions.addPrivateAction( owner, this.readPrivateElement( xml ) );
	//
	//     }
	//
	// }
	//
	// private readPrivateElement ( xml: any ): AbstractPrivateAction {
	//
	//     const privateAction = new OscPrivateAction();
	//
	//     if ( Array.isArray( xml.Action ) ) {
	//
	//         for ( let i = 0; i < xml.Action.length; i++ ) {
	//
	//             const action = this.readActionElement( xml.Action[i] );
	//
	//             privateAction.actions.push( action );
	//
	//         }
	//
	//     } else {
	//
	//         const action = this.readActionElement( xml.Action );
	//
	//         privateAction.actions.push( action );
	//     }
	//
	//     return privateAction;
	// }
	//
	// private readActionElement ( xml: any ) : any {
	//
	//     let action: any = null;
	//
	//     if ( xml.Position != null ) {
	//
	//         action = this.readPositionAction( xml.Position );
	//
	//     }
	//
	//     return action;
	//
	// }
	//
	// private readPositionAction ( xml: any ): any {
	//
	//     let position: OscPositionAction;
	//
	//     if ( xml.World != null ) {
	//
	//         position = this.readWorldPosition( xml.World );
	//
	//     }
	//
	//     new OscPositionAction( position );
	// }
	//
	// private readWorldPosition ( xml: any ): any {
	//
	//     return new OscWorldPosition(
	//         xml.attr_x,
	//         xml.attr_y,
	//         xml.attr_z,
	//
	//         xml.attr_h,
	//         xml.attr_p,
	//         xml.attr_r,
	//     );
	// }

	readClothoidShape ( xml: any ): OscClothoidShape {

		const clothoid = new OscClothoidShape;

		clothoid.curvature = parseFloat( xml.attr_curvature );
		clothoid.curvatureDot = parseFloat( xml.attr_curvatureDot );
		clothoid.length = parseFloat( xml.attr_length );

		return clothoid;
	}

	readSplineShape ( xml: any ): OscSplineShape {

		const spline = new OscSplineShape;

		spline.controlPoint1 = this.readSplineControlPoint( xml.ControlPoint1 );
		spline.controlPoint2 = this.readSplineControlPoint( xml.ControlPoint2 );

		return spline;
	}

	readSplineControlPoint ( xml: any ): OscControlPoint {

		const controlPoint = new OscControlPoint;

		controlPoint.status = xml.attr_status;

		return controlPoint;
	}

	private readStoryboard ( xml: any ): OscStoryboard {

		const storyboard = new OscStoryboard();

		this.readAsOptionalElement( xml.Init.Actions, ( xml ) => {

			this.readInitActions( xml, storyboard );

		} );

		this.readAsOptionalArray( xml.Story, ( xml ) => {

			storyboard.addStory( this.readStory( xml ) );

		} );

		if ( xml.EndConditions != null ) {

			this.readAsOptionalArray( xml.EndConditions.ConditionGroup, ( xml ) => {

				storyboard.addEndConditionGroup( this.readConditionGroup( xml ) );

			} );

		}

		return storyboard;
	}

	private readOpenScenario ( xmlElement: any, openScenario: OpenScenario ): any {

		const OpenSCENARIO = xmlElement.OpenSCENARIO;

		openScenario.fileHeader = this.readFileHeader( OpenSCENARIO.FileHeader );

		openScenario.parameterDeclaration = this.readParameterDeclaration( OpenSCENARIO.ParameterDeclaration );

		// NOTE: Before reading the xml document further
		// we need to replace all paramater variables in the xml
		// this.replaceParamaterValues( OpenSCENARIO );

		// TODO: Read Catalogs
		// openScenario.catalogs = this.readCatalogs(OpenSCENARIO.Catalogs);

		openScenario.roadNetwork = this.readRoadNetwork( OpenSCENARIO.RoadNetwork );

		this.readEntities( OpenSCENARIO.Entities ).forEach( ( value: OscEntityObject ) => {

			openScenario.addObject( value );

		} );

		openScenario.storyboard = this.readStoryboard( OpenSCENARIO.Storyboard );
	}

	private replaceParamaterValues ( object: any, callback?: ( object, property ) => void ) {

		// const properties = Object.getOwnPropertyNames( object );

		// for ( let i = 0; i < properties.length; i++ ) {

		//     const property = object[ properties[ i ] ];

		//     if ( typeof property === 'object' ) {

		//         const children = Object.getOwnPropertyNames( property );

		//         if ( children.length > 0 ) this.replaceParamaterValues( property, callback );

		//     } else if ( typeof property === 'string' ) {

		//         const isVariable = property.indexOf( '$' ) !== -1;

		//         if ( isVariable ) {

		//             const parameter = this.openScenario.findParameter( property );

		//             object[ properties[ i ] ] = parameter.value;

		//             if ( callback ) callback( object, property );

		//             // console.log( 'replaced', property, parameter.value );

		//         }
		//     }
		// }
	}

	private readCatalogReference ( xml: any ) {

		const catalogReference = new OscCatalogReference( null, null );

		catalogReference.catalogName = xml.attr_catalogName;
		catalogReference.entryName = xml.attr_entryName;


		return catalogReference;
	}

	private readParameterDeclaration ( xml: any ): OscParameterDeclaration {

		const parameterDeclaration = new OscParameterDeclaration();

		this.readAsOptionalArray( xml.Parameter, ( xml ) => {

			parameterDeclaration.addParameter( this.readParameter( xml ) );

		} );

		return parameterDeclaration;

	}

	private readParameter ( xml: any ): OscParameter {

		const name: string = xml.attr_name;
		const value: string = xml.attr_value;

		const type = OscParameter.stringToEnum( xml.attr_type );

		return new OscParameter( name, type, value );
	}

	private readSpeedCondition ( xml: any ) {

		const value = xml.attr_value;
		const rule = xml.attr_rule;


		return new OscSpeedCondition( value, rule );
	}

	private readCatalogs ( xml: any ) {

		const catalogs = new OscCatalogs();

		catalogs.trajectoryCatalog = this.readTrajectoryCatalog( xml.TrajectoryCatalog );

		return catalogs;
	}

	private readTrajectoryCatalog ( xml: any ): TrajectoryCatalog {

		const directory = this.readDirectory( xml.Directory );

		const catalog = new TrajectoryCatalog( directory );

		if ( !this.file.online ) {

			// let finalPath = this.fileService.resolve( this.file.path, directory.path );

			let finalPath = this.fileService.resolve( this.file.path, 'Catalogs/TrajectoryCatalog.xosc' );

			this.fileService.readFile( finalPath, 'default', ( file: IFile ) => {

				Debug.log( file );

			} );

		}

		return catalog;
	}

	private readDirectory ( xml: any ): OscDirectory {

		return new OscDirectory( xml.attr_path );

	}
}
