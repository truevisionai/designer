/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Debug } from 'app/core/utils/debug';
import { IFile } from '../../../core/models/file';
import { AbstractReader } from '../../../core/services/abstract-reader';
import { FileService } from '../../../services/file.service';
import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { AbstractController } from '../models/abstract-controller';
import { AbstractPosition } from '../models/abstract-position';
import { Target } from '../models/actions/target';
import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { FollowTrajectoryAction } from '../models/actions/tv-follow-trajectory-action';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { PositionAction } from '../models/actions/tv-position-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { AbstractRoutingAction, FollowRouteAction, LongitudinalPurpose, LongitudinalTiming } from '../models/actions/tv-routing-action';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { EntityCondition } from '../models/conditions/entity-condition';
import { AfterTerminationCondition } from '../models/conditions/tv-after-termination-condition';
import { AtStartCondition } from '../models/conditions/tv-at-start-condition';
import { Condition } from '../models/conditions/tv-condition';
import { ConditionGroup } from '../models/conditions/tv-condition-group';
import { DistanceCondition } from '../models/conditions/tv-distance-condition';
import { ReachPositionCondition } from '../models/conditions/tv-reach-position-condition';
import { RelativeSpeedCondition } from '../models/conditions/tv-relative-speed-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { SpeedCondition } from '../models/conditions/tv-speed-condition';
import { TraveledDistanceCondition } from '../models/conditions/tv-traveled-distance-condition';
import { LanePosition } from '../models/positions/tv-lane-position';
import { RelativeLanePosition } from '../models/positions/tv-relative-lane-position';
import { RelativeObjectPosition } from '../models/positions/tv-relative-object-position';
import { WorldPosition } from '../models/positions/tv-world-position';
import { PrivateAction } from '../models/private-action';
import { Act } from '../models/tv-act';
import { TvAction } from '../models/tv-action';
import { CatalogReference, Catalogs, TrajectoryCatalog } from '../models/tv-catalogs';
import { Directory, File } from '../models/tv-common';
import { EntityObject } from '../models/tv-entities';
import { ConditionEdge, DynamicsDimension, DynamicsShape, Rule } from '../models/tv-enums';
import { TvEvent } from '../models/tv-event';
import { FileHeader } from '../models/tv-file-header';
import { CatalogReferenceController } from '../models/tv-interfaces';
import { EventAction, Maneuver } from '../models/tv-maneuver';
import { Orientation } from '../models/tv-orientation';
import { Parameter, ParameterDeclaration } from '../models/tv-parameter-declaration';
import { RoadNetwork } from '../models/tv-road-network';
import { Route, Waypoint } from '../models/tv-route';
import { OpenScenario } from '../models/tv-scenario';
import { Sequence } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { Storyboard } from '../models/tv-storyboard';
import { AbstractShape, ClothoidShape, ControlPoint, PolylineShape, SplineShape, Trajectory, Vertex } from '../models/tv-trajectory';

@Injectable( {
	providedIn: 'root'
} )
export class ReaderService extends AbstractReader {

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

	readCondition ( xml: XmlElement ) {

		let condition: Condition = null;

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
			condition.edge = edge ? edge : ConditionEdge.any;

		}

		return condition;

	}

	public readFileHeader ( xmlElement: any ) {

		return new FileHeader(
			parseFloat( xmlElement.attr_revMajor ),
			parseFloat( xmlElement.attr_revMinor ),
			xmlElement.attr_date,
			xmlElement.attr_description,
			xmlElement.attr_author,
		);

	}

	readLongitudinalPurpose ( xml: XmlElement ): LongitudinalPurpose {

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

	public readRoadNetwork ( xml: XmlElement ) {

		let logics, sceneGraph;

		if ( xml.Logics != null ) {

			logics = this.readFile( xml.Logics );

		}

		if ( xml.SceneGraph != null ) {

			sceneGraph = this.readFile( xml.SceneGraph );
		}

		// TODO: RoadSignals

		return new RoadNetwork( logics, sceneGraph );
	}

	public readEntities ( xml: XmlElement ): EntityObject[] {

		const objects: EntityObject[] = [];

		this.readAsOptionalArray( xml.Object, ( object, count ) => {

			const entityObject = this.readEntityObject( object );

			objects.push( entityObject );

		} );

		return objects;

	}

	public readEntityObject ( xml: XmlElement ): EntityObject {

		const name = xml.attr_name;

		const entityObject = new EntityObject( name );

		if ( xml.CatalogReference != null ) {

			entityObject.catalogReference = this.readCatalogReference( xml.CatalogReference );

		} else if ( xml.Vehicle != null ) {

		} else if ( xml.Pedestrian != null ) {

		} else if ( xml.MiscObject != null ) {

		}

		this.readAsOptionalElement( xml.Controller, ( xml ) => {

			entityObject.controller = this.readController( xml );

		} );

		return entityObject;

	}

	public readController ( xml: XmlElement ): AbstractController {

		let response: AbstractController = null;

		Debug.log( xml );

		if ( xml.CatalogReference != null ) {

			const catalogReference = CatalogReference.readXml( xml.CatalogReference );

			response = new CatalogReferenceController( catalogReference );

		} else if ( xml.Driver != null ) {

		} else if ( xml.PedestrianController != null ) {

		}

		Debug.log( response );

		return response;
	}

	public readFile ( xml ) {

		return new File( xml.attr_filepath );

	}

	readConditionGroup ( xml: XmlElement ): ConditionGroup {

		const conditionGroup = new ConditionGroup;

		this.readAsOptionalArray( xml.Condition, ( xml ) => {

			conditionGroup.addCondition( this.readCondition( xml ) );

		} );

		return conditionGroup;

	}

	readWorldPosition ( xml: XmlElement ) {

		const worldPosition = new WorldPosition;

		worldPosition.x = parseFloat( xml.attr_x );
		worldPosition.y = parseFloat( xml.attr_y );
		worldPosition.z = parseFloat( xml.attr_z );

		worldPosition.m_H = parseFloat( xml.attr_h );
		worldPosition.m_P = parseFloat( xml.attr_p );
		worldPosition.m_R = parseFloat( xml.attr_r );

		worldPosition.updateVector3();

		return worldPosition;
	}

	readByEntityCondition ( xml: XmlElement ): Condition {

		let condition: EntityCondition = null;

		condition = this.readConditionByEntity( xml.EntityCondition );

		this.readAsOptionalElement( xml.TriggeringEntities, ( xml ) => {

			this.readAsOptionalArray( xml.Entity, ( xml ) => {

				condition.triggeringEntities.push( xml.attr_name );

			} );

			condition.triggeringRule = xml.attr_rule;

		} );

		return condition;
	}

	readConditionByEntity ( xml: XmlElement ): EntityCondition {

		let condition: EntityCondition = null;

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

	readTraveledDistanceCondition ( xml: XmlElement ): TraveledDistanceCondition {

		const value = xml.attr_value;

		return new TraveledDistanceCondition( value );
	}

	readRelativeSpeedCondition ( xml: XmlElement ): RelativeSpeedCondition {

		const entity = xml.attr_entity;
		const value = xml.attr_value;
		const rule = this.convertStringToRule( xml.attr_rule );

		return new RelativeSpeedCondition( entity, value, rule );
	}

	readReachPositionCondition ( xml: XmlElement ): ReachPositionCondition {

		const position = this.readPosition( xml.Position );
		const tolerance = parseFloat( xml.attr_tolerance );

		return new ReachPositionCondition( position, tolerance );
	}

	readDistanceCondition ( xml: XmlElement ): DistanceCondition {

		const value = parseFloat( xml.attr_value );
		const freespace = xml.attr_freespace == 'true';
		const alongRoute = xml.attr_alongRoute == 'true';
		const rule = this.convertStringToRule( xml.attr_rule );
		const position = this.readPosition( xml.Position );

		return new DistanceCondition( position, value, freespace, alongRoute, rule );
	}

	readConditionByValue ( xml: XmlElement ): Condition {

		let condition: Condition = null;

		if ( xml.Parameter != null ) {
		} else if ( xml.TimeOfDay != null ) {
		} else if ( xml.SimulationTime != null ) {
			condition = this.readSimulationTimeCondition( xml.SimulationTime );
		} else {
			throw new Error( 'unknown condition' );
		}

		return condition;
	}

	readSimulationTimeCondition ( xml: XmlElement ): Condition {

		const value = parseFloat( xml.attr_value );
		const rule = this.convertStringToRule( xml.attr_rule );

		return new SimulationTimeCondition( value, rule );
	}

	convertStringToRule ( rule: string ): Rule {

		let res: Rule;

		switch ( rule ) {

			case 'greater_than':
				res = Rule.greater_than;
				break;

			case 'less_than':
				res = Rule.less_than;
				break;

			case 'equal_to':
				res = Rule.equal_to;
				break;

			default:
				throw new Error( 'unknown rule given' );
		}

		return res;

	}

	readConditionByState ( xml: XmlElement ): Condition {

		let condition: Condition = null;

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

	readAtStartCondition ( xml: XmlElement ): Condition {

		let type = xml.attr_type;
		let elementName = xml.attr_name;

		return new AtStartCondition( elementName, type );
	}

	readAfterTerminationCondition ( xml: XmlElement ): Condition {

		let type = xml.attr_type;
		let elementName = xml.attr_name;
		let rule = xml.attr_rule;


		return new AfterTerminationCondition( elementName, rule, type );
	}

	public readStory ( xml: XmlElement ): Story {

		let name = xml.attr_name;
		let ownerName = xml.attr_owner ? xml.attr_owner : null;

		const story = new Story( name, ownerName );

		this.readAsOptionalArray( xml.Act, ( xml ) => {

			story.addAct( this.readAct( xml ) );

		} );

		return story;
	}

	readAct ( xml: XmlElement ): Act {

		const act = new Act;

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

	readSequence ( xml: XmlElement ): Sequence {

		const sequence = new Sequence;

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

	readManeuver ( xml: XmlElement ): Maneuver {

		const maneuver = new Maneuver( xml.attr_name );

		this.readAsOptionalArray( xml.Event, ( xml ) => {

			maneuver.addEventInstance( this.readEvent( xml ) );

		} );

		return maneuver;
	}

	readEvent ( xml: XmlElement ): TvEvent {

		const event = new TvEvent;

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

	readEventAction ( xml: XmlElement ): EventAction {

		const action = new EventAction;

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

	public readInitActions ( xml: XmlElement, storyboard: Storyboard ) {

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

	readUserDefinedAction ( item: any ): TvAction {

		throw new Error( 'Method not implemented.' );

	}

	readGlobalAction ( item: any ): TvAction {

		throw new Error( 'Method not implemented.' );

	}

	readPrivateAction ( item: any ): PrivateAction {

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

	readLateralAction ( xml: XmlElement ): TvAction {

		let action: TvAction = null;

		if ( xml.LaneChange != null ) {
			action = this.readLaneChangeAction( xml.LaneChange );
		} else if ( xml.LaneOffset != null ) {
		} else if ( xml.Distance != null ) {
		} else {
			console.error( 'unknown lateral action' );
		}

		return action;

	}

	readRoutingAction ( xml: XmlElement ): AbstractRoutingAction {

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

	readFollowTrajectoryAction ( xml: XmlElement ): FollowTrajectoryAction {

		let trajectory: Trajectory = null;

		if ( xml.Trajectory != null ) {

			trajectory = this.readTrajectory( xml.Trajectory );

		} else if ( xml.CatalogReference != null ) {

			throw new Error( 'unsupported readFollowTrajectoryAction CatalogReference' );

		}

		let action = new FollowTrajectoryAction( trajectory );

		action.lateralPurpose = xml.Lateral.attr_purpose;
		action.longitudinalPurpose = this.readLongitudinalPurpose( xml.Longitudinal );

		return action;
	}

	readTrajectory ( xml: XmlElement ): Trajectory {

		let name = xml.attr_name;
		let closed = xml.attr_closed == 'true';
		let domain = xml.attr_domain;

		const trajectory = new Trajectory( name, closed, domain );

		this.readAsOptionalArray( xml.ParameterDeclaration, ( xml ) => {

			trajectory.parameterDeclaration.push( this.readParameterDeclaration( xml ) );

		} );

		this.readAsOptionalArray( xml.Vertex, ( xml ) => {

			trajectory.vertices.push( this.readVertex( xml ) );

		} );

		return trajectory;
	}

	readFollowRouteAction ( xml: XmlElement ): FollowRouteAction {

		let route: Route = null;

		if ( xml.Route != null ) {

			route = this.readRoute( xml.Route );

		} else if ( xml.CatalogReference != null ) {

			throw new Error( 'unsupported follow route action CatalogReference' );

		}

		const action = new FollowRouteAction( route );

		return action;
	}

	readRoute ( xml: XmlElement ): Route {

		let route = new Route;

		route.name = xml.attr_name;
		route.closed = xml.attr_closed == 'true';

		this.readAsOptionalArray( xml.ParameterDeclaration, ( xml ) => {

			route.parameterDeclaration.push( this.readParameterDeclaration( xml ) );

		} );

		this.readAsOptionalArray( xml.Waypoint, ( xml ) => {

			route.waypoints.push( this.readWaypoint( xml ) );

		} );

		return route;
	}

	readWaypoint ( xml: XmlElement ): Waypoint {

		let position = this.readPosition( xml.Position );
		let strategy = xml.attr_strategy;

		return new Waypoint( position, strategy );
	}

	readLaneChangeAction ( xml: XmlElement ): TvAction {

		const action = new LaneChangeAction();

		action.targetLaneOffset = parseFloat( xml.attr_targetLaneOffset );

		action.dynamics = this.readTransitionDynamics( xml.Dynamics );

		action.target = this.readTarget( xml.Target );

		return action;

	}

	readTransitionDynamics ( xml: XmlElement ): TransitionDynamics {

		return TransitionDynamics.fromXML( xml );

	}

	readSpeedDynamics ( xml: XmlElement ): TransitionDynamics {

		// TOOD: Fix parsing of enum
		const dynamicsShape: DynamicsShape = xml.attr_dynamicsShape;

		const value = xml.attr_value;

		// TOOD: Fix parsing of enum
		const dynamicsDimension: DynamicsDimension = xml.attr_dynamicsDimension;

		return new TransitionDynamics( dynamicsShape, value, dynamicsDimension );

	}

	readPositionAction ( xml: XmlElement ): PrivateAction {

		return new PositionAction( this.readPosition( xml ) );

	}

	readPosition ( xml: XmlElement ): AbstractPosition {

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

	readLanePosition ( xml: XmlElement ): AbstractPosition {

		let roadId = parseFloat( xml.attr_roadId );
		let laneId = parseFloat( xml.attr_laneId );
		let s = parseFloat( xml.attr_s );

		let laneOffset = null;

		if ( xml.attr_offset != null ) laneOffset = parseFloat( xml.attr_offset );

		return new LanePosition( roadId, laneId, laneOffset, s, null );
	}

	readRelativeLanePosition ( xml: XmlElement ): AbstractPosition {

		const position = new RelativeLanePosition();

		position.object = xml.attr_object;
		position.dLane = parseFloat( xml.attr_dLane );
		position.ds = parseFloat( xml.attr_ds );
		position.offset = parseFloat( xml.attr_offset );

		this.readAsOptionalArray( xml.Orientation, ( xml ) => {

			position.orientations.push( this.readOrientation( xml ) );

		} );

		return position;
	}

	readRelativeObjectPosition ( xml: XmlElement ): AbstractPosition {

		const position = new RelativeObjectPosition();

		position.object = xml.attr_object;
		position.dx = xml.attr_dx ? parseFloat( xml.attr_dx ) : null;
		position.dy = xml.attr_dy ? parseFloat( xml.attr_dy ) : null;
		position.dz = xml.attr_dz ? parseFloat( xml.attr_dz ) : null;

		this.readAsOptionalArray( xml.Orientation, ( xml ) => {

			position.orientations.push( this.readOrientation( xml ) );

		} );

		return position;
	}

	readOrientation ( xml: XmlElement ): Orientation {

		const orientation = new Orientation;

		orientation.h = xml.attr_h ? parseFloat( xml.attr_h ) : null;
		orientation.p = xml.attr_p ? parseFloat( xml.attr_p ) : null;
		orientation.r = xml.attr_r ? parseFloat( xml.attr_r ) : null;

		orientation.type = xml.attr_type ? xml.attr_type : null;

		return orientation;
	}

	readLongitudinalAction ( xml: XmlElement ): any {

		let action = null;

		if ( xml.Speed != null ) {

			const dynamics = this.readSpeedDynamics( xml.Speed.Dynamics );

			const target = this.readTarget( xml.Speed.Target );

			return new SpeedAction( dynamics, target );

		} else if ( xml.Distance != null ) {

			throw new Error( 'not implemented' );

		}

		return action;
	}

	readTarget ( xml: XmlElement ): Target {

		let target = null;

		if ( xml.Absolute != null ) {

			const value = xml.Absolute.attr_value;

			target = new AbsoluteTarget( value );

		} else if ( xml.Relative != null ) {

			const value = parseFloat( xml.Relative.attr_value );

			const object = xml.Relative.attr_object;

			return new RelativeTarget( object, value );

		}

		return target;
	}

	readVertex ( xml: XmlElement ): Vertex {

		const vertex = new Vertex;

		vertex.reference = parseFloat( xml.attr_reference );
		vertex.position = this.readPosition( xml.Position );
		vertex.shape = this.readVertexShape( xml.Shape );

		return vertex;
	}

	readVertexShape ( xml: XmlElement ): AbstractShape {

		if ( xml.Polyline != null ) {

			return new PolylineShape;

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
	//     // oscStoryboard.m_InitActions = InitActions.readXml( Storyboard.Init.Actions );
	//
	//     this.readPrivateElements( xmlElement.Private, this.openScenario.storyboard.initActions );
	//
	// }
	//
	// private readStory ( xml: XmlElement ) {
	//
	//     // oscStoryboard.Story = Story.readXml( Storyboard.Story );
	// }
	//
	// private readPrivateElements ( xml: XmlElement, initActions: InitActions ) {
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
	// private readPrivateElement ( xml: XmlElement ): AbstractPrivateAction {
	//
	//     const privateAction = new PrivateAction();
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
	// private readActionElement ( xml: XmlElement ) : any {
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
	// private readPositionAction ( xml: XmlElement ): any {
	//
	//     let position: PositionAction;
	//
	//     if ( xml.World != null ) {
	//
	//         position = this.readWorldPosition( xml.World );
	//
	//     }
	//
	//     new PositionAction( position );
	// }
	//
	// private readWorldPosition ( xml: XmlElement ): any {
	//
	//     return new WorldPosition(
	//         xml.attr_x,
	//         xml.attr_y,
	//         xml.attr_z,
	//
	//         xml.attr_h,
	//         xml.attr_p,
	//         xml.attr_r,
	//     );
	// }

	readClothoidShape ( xml: XmlElement ): ClothoidShape {

		const clothoid = new ClothoidShape;

		clothoid.curvature = parseFloat( xml.attr_curvature );
		clothoid.curvatureDot = parseFloat( xml.attr_curvatureDot );
		clothoid.length = parseFloat( xml.attr_length );

		return clothoid;
	}

	readSplineShape ( xml: XmlElement ): SplineShape {

		const spline = new SplineShape;

		spline.controlPoint1 = this.readSplineControlPoint( xml.ControlPoint1 );
		spline.controlPoint2 = this.readSplineControlPoint( xml.ControlPoint2 );

		return spline;
	}

	readSplineControlPoint ( xml: XmlElement ): ControlPoint {

		const controlPoint = new ControlPoint;

		controlPoint.status = xml.attr_status;

		return controlPoint;
	}

	private readStoryboard ( xml: XmlElement ): Storyboard {

		const storyboard = new Storyboard();

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

		this.readEntities( OpenSCENARIO.Entities ).forEach( ( value: EntityObject ) => {

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

	private readCatalogReference ( xml: XmlElement ) {

		const catalogReference = new CatalogReference( null, null );

		catalogReference.catalogName = xml.attr_catalogName;
		catalogReference.entryName = xml.attr_entryName;


		return catalogReference;
	}

	private readParameterDeclaration ( xml: XmlElement ): ParameterDeclaration {

		const parameterDeclaration = new ParameterDeclaration();

		this.readAsOptionalArray( xml.Parameter, ( xml ) => {

			parameterDeclaration.addParameter( this.readParameter( xml ) );

		} );

		return parameterDeclaration;

	}

	private readParameter ( xml: XmlElement ): Parameter {

		const name: string = xml.attr_name;
		const value: string = xml.attr_value;

		const type = Parameter.stringToEnum( xml.attr_type );

		return new Parameter( name, type, value );
	}

	private readSpeedCondition ( xml: XmlElement ) {

		const value = xml.attr_value;
		const rule = xml.attr_rule;


		return new SpeedCondition( value, rule );
	}

	private readCatalogs ( xml: XmlElement ) {

		const catalogs = new Catalogs();

		catalogs.trajectoryCatalog = this.readTrajectoryCatalog( xml.TrajectoryCatalog );

		return catalogs;
	}

	private readTrajectoryCatalog ( xml: XmlElement ): TrajectoryCatalog {

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

	private readDirectory ( xml: XmlElement ): Directory {

		return new Directory( xml.attr_path );

	}
}
