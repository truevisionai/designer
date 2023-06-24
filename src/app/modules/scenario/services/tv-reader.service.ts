/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Debug } from 'app/core/utils/debug';

import { XMLParser } from 'fast-xml-parser';
import { IFile } from '../../../core/models/file';
import { AbstractReader } from '../../../core/services/abstract-reader';
import { readXmlArray, readXmlElement } from '../../../core/tools/xml-utils';
import { TvConsole } from '../../../core/utils/console';
import { FileService } from '../../../services/file.service';
import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { AbstractController } from '../models/abstract-controller';
import { Target } from '../models/actions/target';
import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { FollowTrajectoryAction } from '../models/actions/tv-follow-trajectory-action';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { AbstractRoutingAction, FollowRouteAction, LongitudinalPurpose, LongitudinalTiming } from '../models/actions/tv-routing-action';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { TeleportAction } from '../models/actions/tv-teleport-action';
import { EntityCondition } from '../models/conditions/entity-condition';
import { ParameterCondition, TimeOfDayCondition } from '../models/conditions/parameter-condition';
import { AccelerationCondition } from '../models/conditions/tv-acceleration-condition';
import { StoryboardElementStateCondition } from '../models/conditions/tv-after-termination-condition';
import { CollisionCondition } from '../models/conditions/tv-collision-condition';
import { Condition } from '../models/conditions/tv-condition';
import { ConditionGroup } from '../models/conditions/tv-condition-group';
import { DistanceCondition } from '../models/conditions/tv-distance-condition';
import { EndOfRoadCondition } from '../models/conditions/tv-end-of-road-condition';
import { OffRoadCondition } from '../models/conditions/tv-off-road-condition';
import { ReachPositionCondition } from '../models/conditions/tv-reach-position-condition';
import { RelativeDistanceCondition } from '../models/conditions/tv-relative-distance-condition';
import { RelativeSpeedCondition } from '../models/conditions/tv-relative-speed-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { SpeedCondition } from '../models/conditions/tv-speed-condition';
import { StandStillCondition } from '../models/conditions/tv-stand-still-condition';
import { TimeHeadwayCondition } from '../models/conditions/tv-time-headway-condition';
import { TimeToCollisionCondition } from '../models/conditions/tv-time-to-collision-condition';
import { TraveledDistanceCondition } from '../models/conditions/tv-traveled-distance-condition';
import { Position } from '../models/position';
import { LanePosition } from '../models/positions/tv-lane-position';
import { RelativeLanePosition } from '../models/positions/tv-relative-lane-position';
import { RelativeObjectPosition } from '../models/positions/tv-relative-object-position';
import { RelativeWorldPosition } from '../models/positions/tv-relative-world-position';
import { RoadPosition } from '../models/positions/tv-road-position';
import { WorldPosition } from '../models/positions/tv-world-position';
import { PrivateAction } from '../models/private-action';
import { Act } from '../models/tv-act';
import { TvAction } from '../models/tv-action';
import { CatalogReference, Catalogs, TrajectoryCatalog } from '../models/tv-catalogs';
import { Directory, File } from '../models/tv-common';
import { EntityObject } from '../models/tv-entities';
import {
	ConditionEdge,
	CoordinateSystem,
	DirectionDimension,
	DynamicsDimension,
	DynamicsShape,
	ParameterType,
	RelativeDistanceType,
	RoutingAlgorithm,
	Rule,
	ScenarioObjectType,
	StoryboardElementState,
	TriggeringRule
} from '../models/tv-enums';
import { TvEvent } from '../models/tv-event';
import { FileHeader } from '../models/tv-file-header';
import { EventAction, Maneuver } from '../models/tv-maneuver';
import { Orientation } from '../models/tv-orientation';
import { Parameter, ParameterDeclaration } from '../models/tv-parameter-declaration';
import { RoadNetwork } from '../models/tv-road-network';
import { Route, Waypoint } from '../models/tv-route';
import { TvScenario } from '../models/tv-scenario';
import { Sequence } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { Storyboard } from '../models/tv-storyboard';
import { AbstractShape, ClothoidShape, ControlPoint, PolylineShape, SplineShape, Trajectory, Vertex } from '../models/tv-trajectory';
import { RelativeRoadPosition } from './relative-road.position';
import { TrafficSignalControllerCondition } from './traffic-signal-controller.condition';
import { TrafficSignalCondition } from './traffic-signal.condition';
import { UserDefinedValueCondition } from './user-defined-value.condition';

@Injectable( {
	providedIn: 'root'
} )
export class OpenScenarioImporter extends AbstractReader {

	private openScenario: TvScenario;
	private file: IFile;

	constructor ( private fileService: FileService ) {
		super();
	}

	static readRule ( rule: string ): Rule {

		if ( rule === 'greater_than' || 'greaterThan' ) {

			return Rule.greater_than;

		} else if ( rule === 'less_than' || 'lessThan' ) {

			return Rule.less_than;

		} else if ( rule === 'equal_to' || 'equalTo' ) {

			return Rule.equal_to;

		} else if ( rule === 'greater_or_equal' || 'greaterOrEqual' ) {

			return Rule.greater_or_equal;

		} else if ( rule === 'less_or_equal' || 'lessOrEqual' ) {

			return Rule.less_or_equal;

		} else if ( rule === 'not_equal_to' || 'notEqualTo' ) {

			return Rule.not_equal_to;

		} else {

			TvConsole.warn( 'unknown rule ' + rule );

			return Rule.greater_or_equal;

		}
	}

	private static readWorldPosition ( xml: XmlElement ): WorldPosition {

		return new WorldPosition(
			parseFloat( xml.attr_x || 0 ),
			parseFloat( xml.attr_y || 0 ),
			parseFloat( xml.attr_z || 0 ),
			parseFloat( xml.attr_h || 0 ),
			parseFloat( xml.attr_p || 0 ),
			parseFloat( xml.attr_r || 0 ),
		);

	}

	private static readRelativeSpeedCondition ( xml: XmlElement ): RelativeSpeedCondition {

		const entity: string = xml.attr_entity || xml.attr_entityRef;
		const value = parseFloat( xml.attr_value || 0 );
		const rule = OpenScenarioImporter.readRule( xml.attr_rule );

		const direction = this.readDirectionDimension( xml?.attr_direction );

		return new RelativeSpeedCondition( entity, value, rule, direction );
	}

	private static readRelativeLanePosition ( xml: XmlElement ): RelativeLanePosition {

		const entityRef: string = xml.attr_object || xml.attr_entity || xml.attr_entityRef;
		const dLane = parseInt( xml.attr_dLane );
		const ds = parseFloat( xml.attr_ds || 0 );
		const offset = parseFloat( xml.attr_offset || 0 );
		const dsLane = parseFloat( xml.attr_offset || 0 );

		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );

		return new RelativeLanePosition( entityRef, dLane, ds, offset, dsLane, orientation );
	}

	private static readRelativeObjectPosition ( xml: XmlElement ): RelativeObjectPosition {

		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );
		const entity: string = xml.attr_object || xml.attr_entity || xml.attr_entityRef;
		const dx = parseFloat( xml.attr_dx || 0 );
		const dy = parseFloat( xml.attr_dy || 0 );
		const dz = parseFloat( xml.attr_dz || 0 );

		return new RelativeObjectPosition( entity, dx, dy, dz, orientation );
	}

	private static readOrientation ( xml: XmlElement ): Orientation {

		return Orientation.fromXML( xml );

	}

	private static readParameterDeclaration ( xml: XmlElement ): ParameterDeclaration {

		const name: string = xml.attr_name;

		const value: string = xml.attr_value;

		const type: ParameterType = Parameter.stringToEnum( xml.attr_type || xml.attr_parameterType );

		return new ParameterDeclaration( new Parameter( name, type, value ) );

	}

	private static readParameter ( xml: XmlElement ): Parameter {

		const name: string = xml.attr_name;
		const value: string = xml.attr_value;

		const type = Parameter.stringToEnum( xml.attr_type || xml.attr_parameterType );

		return new Parameter( name, type, value );
	}

	private static readSpeedCondition ( xml: XmlElement ): SpeedCondition {

		const value = parseFloat( xml?.attr_value || 0 );
		const rule = this.readRule( xml?.attr_rule );

		// added in 1.2
		const direction: DirectionDimension = this.readDirectionDimension( xml?.attr_direction );

		return new SpeedCondition( value, rule, direction );
	}

	private static readDirectory ( xml: XmlElement ): Directory {

		return new Directory( xml.attr_path );

	}

	private static readParameterCondition ( xml: XmlElement ): ParameterCondition {

		const rule: Rule = this.readRule( xml.attr_rule );

		const name: string = xml.attr_name || xml.attr_parameterRef;

		const value: string = xml.attr_value;

		return new ParameterCondition( name, value, rule );
	}

	private static readTimeOfDayCondition ( xml: XmlElement ): TimeOfDayCondition {

		const rule: Rule = this.readRule( xml.attr_rule );

		let date = new Date();

		// version 1.0 and above
		if ( xml.attr_dateTime ) {

			date = new Date( xml.attr_dateTime );

		} else if ( xml?.Time ) {

			// version 0.9 and below
			date.setHours(
				parseInt( xml?.Time?.attr_hour || 0 ),
				parseInt( xml?.Time?.attr_minute || 0 ),
				parseInt( xml?.Time?.attr_second || 0 )
			);
			date.setFullYear(
				parseInt( xml?.Date?.attr_year || 2000 ),
				parseInt( xml?.Date?.attr_month || 1 ),
				parseInt( xml?.Date?.attr_day || 1 )
			);

		}

		return new TimeOfDayCondition( date, rule );
	}

	private static readUserDefinedValueCondition ( xml: XmlElement ): UserDefinedValueCondition {

		return new UserDefinedValueCondition( xml.attr_name, xml.attr_value, xml.attr_rule );

	}

	private static readTrafficSignalCondition ( xml: XmlElement ): TrafficSignalCondition {

		return new TrafficSignalCondition( xml.attr_name, xml.attr_state );

	}

	private static readTrafficSignalControllerCondition ( xml: XmlElement ): TrafficSignalControllerCondition {

		return new TrafficSignalControllerCondition( xml.attr_phase, xml.attr_trafficSignalControllerRef, );

	}

	private static readRelativeWorldPosition ( xml: XmlElement ): RelativeWorldPosition {

		const entity: string = xml.attr_object || xml.attr_entity || xml.attr_entityRef;
		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );
		const dx = parseFloat( xml.attr_dx || 0 );
		const dy = parseFloat( xml.attr_dy || 0 );
		const dz = parseFloat( xml.attr_dz || 0 );

		return new RelativeWorldPosition( entity, dx, dy, dz, orientation );

	}

	private static readRoadPosition ( xml: XmlElement ): RoadPosition {

		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );
		const roadId = parseInt( xml.attr_roadId );
		const s = parseFloat( xml.attr_s || 0 );
		const t = parseFloat( xml.attr_t || 0 );

		return new RoadPosition( roadId, s, t, orientation );

	}

	private static readRelativeRoadPosition ( xml: XmlElement ): RelativeRoadPosition {

		const entity: string = xml.attr_object || xml.attr_entity || xml.attr_entityRef;
		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );
		const roadId = parseInt( xml.attr_roadId );
		const ds = parseFloat( xml.attr_ds || 0 );
		const dt = parseFloat( xml.attr_dt || 0 );

		return new RelativeRoadPosition( entity, roadId, ds, dt, orientation );
	}

	public readFromFile ( file: IFile ): TvScenario {

		this.file = file;

		return this.readContents( this.file.contents );

	}

	public async readFromPath ( path: string ): Promise<TvScenario> {

		const contents = await this.fileService.readAsync( path );

		return this.readContents( contents );

	}

	public readContents ( contents: string ): TvScenario {

		this.openScenario = new TvScenario();

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			textNodeName: 'value',
			ignoreAttributes: false,
			supressEmptyNode: false,
			format: true,
		};

		const parser = new XMLParser( defaultOptions );

		const xml: XmlElement = parser.parse( contents );

		console.log( xml );

		this.readFile( xml );

		this.readOpenScenario( xml, this.openScenario );

		return this.openScenario;
	}

	readCondition ( xml: XmlElement ) {

		let condition: Condition = null;

		const name: string = xml.attr_name;
		const delay = xml.attr_delay ? parseFloat( xml.attr_delay ) : 0;
		const edge: ConditionEdge = OpenScenarioImporter.readConditionEdge( xml.attr_edge || xml.attr_conditionEdge );

		if ( xml.ByEntity || xml.ByEntityCondition ) {

			condition = this.readByEntityCondition( xml.ByEntity || xml.ByEntityCondition );

		} else if ( xml.ByValue || xml.ByValueCondition ) {

			condition = this.readConditionByValue( xml.ByValue || xml.ByValueCondition );

		} else if ( xml.ByState || xml.ByStateCondition ) {

			// not suported after 1.0
			// all contions moved into ByValueCondition
			// keeping this to support old
			condition = this.readConditionByValue( xml.ByState || xml.ByStateCondition );

		} else {

			TvConsole.error( 'Unknown condition type ' + xml );

		}

		if ( condition != null ) {

			condition.label = name ? name : '';
			condition.delay = delay ? delay : 0;
			condition.edge = edge ? edge : ConditionEdge.risingOrFalling;

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

		if ( xml.Logics || xml.LogicFile ) {

			logics = this.readFile( xml.Logics || xml.LogicFile );

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

		this.readAsOptionalArray( xml.ScenarioObject, ( object, count ) => {

			const entityObject = this.readEntityObject( object );

			objects.push( entityObject );

		} );

		return objects;

	}

	public readEntityObject ( xml: XmlElement ): EntityObject {

		const name = xml.attr_name;

		const entityObject = new EntityObject( name );

		if ( xml.CatalogReference != null ) {

			// entityObject.catalogReference = this.readCatalogReference( xml.CatalogReference );

		} else if ( xml.Vehicle != null ) {

		} else if ( xml.Pedestrian != null ) {

		} else if ( xml.MiscObject != null ) {

		}

		this.readAsOptionalElement( xml.Controller, ( xml ) => {

			const controller = this.readController( xml );

			if ( controller ) entityObject.controller = controller;

		} );

		return entityObject;

	}

	public readController ( xml: XmlElement ): AbstractController {

		let response: AbstractController = null;

		if ( xml.CatalogReference != null ) {

			// const catalogReference = CatalogReference.readXml( xml.CatalogReference );

			// response = new CatalogReferenceController( catalogReference );

		} else if ( xml.Driver != null ) {

		} else if ( xml.PedestrianController != null ) {

		}

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

	readByEntityCondition ( xml: XmlElement ): Condition {

		const condition = OpenScenarioImporter.readConditionByEntity( xml.EntityCondition );

		if ( !condition ) return null;

		this.readAsOptionalElement( xml.TriggeringEntities, ( xml ) => {

			// 0.9
			this.readAsOptionalArray( xml.Entity, ( xml ) => {
				condition.triggeringEntities.push( xml.attr_name );
			} );

			// 1.0 or above
			this.readAsOptionalArray( xml.EntityRef, ( xml ) => {
				condition.triggeringEntities.push( xml.attr_entityRef );
			} );

			// 0.9 and 1.0
			if ( ( xml.attr_rule || xml.attr_triggeringEntitiesRule ) == 'all' ) {
				condition.setTriggeringRule( TriggeringRule.All );
			} else {
				condition.setTriggeringRule( TriggeringRule.Any );
			}

		} );

		return condition;
	}

	private static readConditionByEntity ( xml: XmlElement ): EntityCondition {

		if ( xml.EndOfRoad || xml.EndOfRoadCondition ) {

			const child = xml?.EndOfRoad || xml?.EndOfRoadCondition;
			const duration = parseFloat( child?.attr_duration || 0 );

			return new EndOfRoadCondition( duration );

		} else if ( xml?.Collision || xml?.CollisionCondition ) {

			const child = xml?.Collision || xml?.CollisionCondition;

			const entityRef = child?.ByEntity?.attr_name ||	// 0.9
				child?.EntityRef?.attr_entityRef; // 1.0 or above

			// TODO: test
			const object = child?.ByType?.attr_type || child?.ByType?.ByObjectType?.attr_type;
			const objectType = OpenScenarioImporter.readScenarioObjectType( object );

			new CollisionCondition( entityRef, objectType );

		} else if ( xml?.Offroad || xml?.Offroad ) {

			const child = xml?.Offroad || xml?.OffroadCondition;
			const duration = parseFloat( child?.attr_duration || 0 );

			return new OffRoadCondition( duration );

		} else if ( xml.TimeHeadway || xml.TimeHeadwayCondition ) {

			return OpenScenarioImporter.readTimeHeadwayCondition( xml.TimeHeadway || xml.TimeHeadwayCondition );

		} else if ( xml.TimeToCollision || xml.TimeToCollisionCondition ) {

			return OpenScenarioImporter.readTimeToCollisionCondition( xml.TimeToCollision || xml.TimeToCollisionCondition );

		} else if ( xml.Acceleration || xml.AccelerationCondition ) {

			const child = xml.Acceleration || xml.AccelerationCondition;

			const value = parseFloat( child?.attr_value || 0 );
			const rule = OpenScenarioImporter.readRule( child?.attr_rule );

			// added in 1.2
			const direction: DirectionDimension = OpenScenarioImporter.readDirectionDimension( child?.attr_direction );

			return new AccelerationCondition( value, rule, direction );

		} else if ( xml.StandStill || xml.StandStillCondition ) {

			const duration = parseFloat( xml.StandStill?.attr_duration || xml.StandStillCondition?.attr_duration || 0 );

			return new StandStillCondition( duration );

		} else if ( xml.Speed || xml.SpeedCondition ) {

			return OpenScenarioImporter.readSpeedCondition( xml.Speed || xml.SpeedCondition );

		} else if ( xml.RelativeSpeed || xml.RelativeSpeedCondition ) {

			return OpenScenarioImporter.readRelativeSpeedCondition( xml.RelativeSpeed || xml.RelativeSpeedCondition );

		} else if ( xml.TraveledDistance || xml.TraveledDistanceCondition ) {

			const distance = parseFloat( xml.TraveledDistance?.attr_value || xml.TraveledDistanceCondition?.attr_value || 0 );

			return new TraveledDistanceCondition( distance );

		} else if ( xml.ReachPosition || xml.ReachPositionCondition ) {

			return OpenScenarioImporter.readReachPositionCondition( xml.ReachPosition || xml.ReachPositionCondition );

		} else if ( xml.Distance || xml.DistanceCondition ) {

			return OpenScenarioImporter.readDistanceCondition( xml.Distance || xml.DistanceCondition );

		} else if ( xml.RelativeDistance || xml.RelativeDistanceCondition ) {

			return OpenScenarioImporter.readRelativeDistanceCondition( xml.RelativeDistance || xml.RelativeDistanceCondition );

		} else {

			TvConsole.warn( 'unknown condition' );

		}

	}

	private static readReachPositionCondition ( xml: XmlElement ): ReachPositionCondition {

		const position = OpenScenarioImporter.readPosition( xml.Position );
		const tolerance = parseFloat( xml.attr_tolerance || 0 );

		return new ReachPositionCondition( position, tolerance );
	}

	private static readDistanceCondition ( xml: XmlElement ): DistanceCondition {

		const value: number = parseFloat( xml.attr_value || 0 );
		const freespace: boolean = xml.attr_freespace == 'true';
		const rule: Rule = OpenScenarioImporter.readRule( xml.attr_rule );
		const position: Position = OpenScenarioImporter.readPosition( xml.Position );
		const alongRoute: boolean = xml?.attr_alongRoute == 'true';
		const coordinateSystem = OpenScenarioImporter.readCoordinateSystem( xml?.attr_coordinateSystem );
		const relativeDistanceType = OpenScenarioImporter.readRelativeDistanceType( xml?.attr_relativeDistanceType );
		const routingAlgorithm = OpenScenarioImporter.readRoutingAlgorithm( xml?.attr_routingAlgorithm );

		return new DistanceCondition( position, value, freespace, alongRoute, rule, coordinateSystem, relativeDistanceType, routingAlgorithm );
	}

	readConditionByValue ( xml: XmlElement ): Condition {

		if ( xml.Parameter || xml.ParameterCondition ) {

			return OpenScenarioImporter.readParameterCondition( xml.Parameter || xml.ParameterCondition );

		} else if ( xml.TimeOfDay || xml.TimeOfDayCondition ) {

			return OpenScenarioImporter.readTimeOfDayCondition( xml.TimeOfDay || xml.TimeOfDayCondition );

		} else if ( xml.SimulationTime || xml.SimulationTimeCondition ) {

			return OpenScenarioImporter.readSimulationTimeCondition( xml.SimulationTime || xml.SimulationTimeCondition );

		} else if ( xml.Command || xml.UserDefinedValueCondition ) {

			// 0.9 and 1.0 above
			return OpenScenarioImporter.readUserDefinedValueCondition( xml.Command || xml.UserDefinedValueCondition );

		} else if ( xml.Signal || xml.TrafficSignalCondition ) {

			// 0.9 and 1.0 above
			return OpenScenarioImporter.readTrafficSignalCondition( xml.Signal || xml.TrafficSignalCondition );

		} else if ( xml.Controller || xml.TrafficSignalControllerCondition ) {

			// 0.9 and 1.0 above
			return OpenScenarioImporter.readTrafficSignalControllerCondition( xml.Controller || xml.TrafficSignalControllerCondition );

		} else if ( xml.StoryboardElementStateCondition ) {

			return this.readStoryboardElementStateCondition( xml.StoryboardElementStateCondition );

		} else if ( xml.AtStart || xml.AtStartCondition ) {

			// 0.9 only
			return this.readAtStartCondition( xml.AtStart || xml.AtStartCondition );

		} else if ( xml.AfterTermination ) {

			// 0.9 only
			return this.readAfterTerminationCondition( xml.AfterTermination || xml.AfterTerminationCondition );

		} else {

			TvConsole.error( 'unknown condition  ' + xml );

		}
	}

	private static readSimulationTimeCondition ( xml: XmlElement ): SimulationTimeCondition {

		const value = parseFloat( xml.attr_value || 0 );
		const rule = this.readRule( xml.attr_rule );

		return new SimulationTimeCondition( value, rule );
	}

	readAtStartCondition ( xml: XmlElement ): Condition {

		let type = StoryboardElementStateCondition.stringToStoryboardType( xml.attr_type || xml.attr_storyboardElementType );

		let elementName: string = xml.attr_name || xml.attr_storyboardElementRef;

		return new StoryboardElementStateCondition( type, elementName, StoryboardElementState.startTransition );
	}

	readAfterTerminationCondition ( xml: XmlElement ): Condition {

		let type = StoryboardElementStateCondition.stringToStoryboardType( xml.attr_type || xml.attr_storyboardElementType );

		let elementName: string = xml.attr_name || xml.attr_storyboardElementRef;

		return new StoryboardElementStateCondition( type, elementName, StoryboardElementState.endTransition );
	}

	readStoryboardElementStateCondition ( xml: XmlElement ): Condition {

		let type = StoryboardElementStateCondition.stringToStoryboardType( xml.attr_type || xml.attr_storyboardElementType );

		let state = StoryboardElementStateCondition.stringToState( xml.attr_state );

		let elementName: string = xml.attr_name || xml.attr_storyboardElementRef;

		return new StoryboardElementStateCondition( type, elementName, state );

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

				const object = xml.attr_object || xml.attr_entity || xml.attr_entityRef;

				const entity = this.openScenario.objects.get( object );

				if ( !entity ) console.error( 'entity not found', xml );
				if ( !entity ) return;

				// Read the Action tag inside Private
				// 0.9
				this.readAsOptionalArray( xml.Action, ( xml ) => {

					entity.initActions.push( this.readPrivateAction( xml ) );

				} );

				// 1.0
				this.readAsOptionalArray( xml.PrivateAction, ( xml ) => {

					entity.initActions.push( this.readPrivateAction( xml ) );

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

	readPrivateAction ( xml: XmlElement ): PrivateAction {

		let action = null;

		if ( xml.Longitudinal != null || xml.LongitudinalAction != null ) {

			action = this.readLongitudinalAction( xml.Longitudinal || xml.LongitudinalAction );

		} else if ( xml.Lateral != null ) {

			action = this.readLateralAction( xml.Lateral );

		} else if ( xml.Visibility != null ) {

			throw new Error( 'action not implemented' );

		} else if ( xml.Meeting != null ) {

			throw new Error( 'action not implemented' );

		} else if ( xml.Autonomous != null ) {

			throw new Error( 'action not implemented' );

		} else if ( xml.Controller != null ) {

			throw new Error( 'action not implemented' );

		} else if ( xml.Position || xml.PositionAction ) {

			action = this.readPositionAction( xml.Position || xml.PositionAction );

		} else if ( xml.TeleportAction ) {

			action = this.readPositionAction( xml.TeleportAction.Position );

		} else if ( xml.Routing != null ) {

			action = this.readRoutingAction( xml.Routing );

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

			trajectory.parameterDeclaration.push( OpenScenarioImporter.readParameterDeclaration( xml ) );

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

		// this.readAsOptionalArray( xml.ParameterDeclaration, ( xml ) => {
		//
		// 	route.parameterDeclaration.push( this.readParameterDeclaration( xml ) );
		//
		// } );

		this.readAsOptionalArray( xml.Waypoint, ( xml ) => {

			route.waypoints.push( this.readWaypoint( xml ) );

		} );

		return route;
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

	readWaypoint ( xml: XmlElement ): Waypoint {

		let position = OpenScenarioImporter.readPosition( xml.Position );
		let strategy = xml.attr_strategy;

		return new Waypoint( position, strategy );
	}

	readLaneChangeAction ( xml: XmlElement ): TvAction {

		const targetLaneOffset = parseFloat( xml.attr_targetLaneOffset || 0 );

		const dynamics = this.readTransitionDynamics( xml.Dynamics );

		const target = this.readTarget( xml.Target );

		return new LaneChangeAction( dynamics, target, targetLaneOffset );

	}

	readTransitionDynamics ( xml: XmlElement ): TransitionDynamics {

		return TransitionDynamics.fromXML( xml );

	}

	readSpeedDynamics ( xml: XmlElement ): TransitionDynamics {

		// TOOD: Fix parsing of enum
		const dynamicsShape: DynamicsShape = xml.attr_dynamicsShape || xml.attr_shape;

		const value = parseFloat( xml.attr_value ?? 0 );

		// TOOD: Fix parsing of enum
		const dynamicsDimension: DynamicsDimension = xml.attr_dynamicsDimension;

		return new TransitionDynamics( dynamicsShape, value, dynamicsDimension );

	}

	readPositionAction ( xml: XmlElement ): PrivateAction {

		return new TeleportAction( OpenScenarioImporter.readPosition( xml ) );

	}

	private static readPosition ( xml: XmlElement ): Position {

		let position: Position = null;

		if ( xml.World || xml.WorldPosition ) {

			position = OpenScenarioImporter.readWorldPosition( xml.World || xml.WorldPosition );

		} else if ( xml.RelativeWorld || xml.RelativeWorldPosition ) {

			position = OpenScenarioImporter.readRelativeWorldPosition( xml.RelativeWorld || xml.RelativeWorldPosition );

		} else if ( xml.RelativeObject || xml.RelativeObjectPosition ) {

			position = OpenScenarioImporter.readRelativeObjectPosition( xml.RelativeObject || xml.RelativeObjectPosition );

		} else if ( xml.Road || xml.RoadPosition ) {

			position = OpenScenarioImporter.readRoadPosition( xml.Road || xml.RoadPosition );

		} else if ( xml.RelativeRoad || xml.RelativeRoadPosition ) {

			position = OpenScenarioImporter.readRelativeRoadPosition( xml.RelativeRoad || xml.RelativeRoadPosition );

		} else if ( xml.Lane || xml.LanePosition ) {

			position = OpenScenarioImporter.readLanePosition( xml.Lane || xml.LanePosition );

		} else if ( xml.RelativeLane || xml.RelativeLanePosition ) {

			position = OpenScenarioImporter.readRelativeLanePosition( xml.RelativeLane || xml.RelativeLanePosition );

		} else if ( xml.RoutePosition || xml.RoutePositionPosition ) {

			throw new Error( 'RoutePosition not implemented yet' );

		} else {

			throw new Error( 'unknown position' );

		}

		return position;
	}

	private static readLanePosition ( xml: XmlElement ): LanePosition {

		let roadId = parseInt( xml.attr_roadId );
		let laneId = parseInt( xml.attr_laneId );
		let s = parseFloat( xml.attr_s || 0 );
		let offset = parseFloat( xml.attr_offset || 0 );
		let orientation = Orientation.fromXML( xml.Orientation );

		return new LanePosition( roadId, laneId, offset, s, orientation );
	}

	readLongitudinalAction ( xml: XmlElement ): any {

		let action = null;

		if ( xml.Speed || xml.SpeedAction ) {

			const speed = xml.Speed || xml.SpeedAction;

			const dynamics = this.readSpeedDynamics( speed.Dynamics || speed.SpeedActionDynamics );

			const target = this.readTarget( speed.Target || speed.SpeedActionTarget );

			return new SpeedAction( dynamics, target );

		} else if ( xml.Distance != null ) {

			throw new Error( 'not implemented' );

		}

		return action;
	}

	readTarget ( xml: XmlElement ): Target {

		if ( xml.Absolute || xml.AbsoluteTargetSpeed ) {

			const absXml = xml.Absolute || xml.AbsoluteTargetSpeed;

			const value = parseFloat( absXml.attr_value );

			return new AbsoluteTarget( value );

		}

		if ( xml.Relative != null ) {

			const value = parseFloat( xml.Relative.attr_value );

			const object = xml.Relative.attr_object;

			return new RelativeTarget( object, value );

		}
	}

	readVertex ( xml: XmlElement ): Vertex {

		const vertex = new Vertex;

		vertex.reference = parseFloat( xml.attr_reference );
		vertex.position = OpenScenarioImporter.readPosition( xml.Position );
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

	private readOpenScenario ( xml: XmlElement, openScenario: TvScenario ): any {

		const root = xml.OpenSCENARIO;

		openScenario.fileHeader = this.readFileHeader( root.FileHeader );

		// if ( openScenario.fileHeader.version != OpenScenarioVersion.v1_0 )

		// Parsing version 0.9

		readXmlElement( root.ParameterDeclarations, ( xml: XmlElement ) => {
			readXmlArray( xml.ParameterDeclaration, ( xml: XmlElement ) => {
				openScenario.addParameterDeclaration( OpenScenarioImporter.readParameterDeclaration( xml ) );
			} );
		} );

		// NOTE: Before reading the xml document further
		// we need to replace all paramater variables in the xml
		// this.replaceParamaterValues( OpenSCENARIO );

		// TODO: Read Catalogs
		// openScenario.catalogs = this.readCatalogs(OpenSCENARIO.Catalogs);

		openScenario.roadNetwork = this.readRoadNetwork( root.RoadNetwork );

		this.readEntities( root.Entities ).forEach( ( value: EntityObject ) => {

			openScenario.addObject( value );

		} );

		openScenario.storyboard = this.readStoryboard( root.Storyboard );
	}

	private readStoryboard ( xml: XmlElement ): Storyboard {

		const storyboard = new Storyboard();

		readXmlElement( xml.Init?.Actions, ( xml: XmlElement ) => {
			this.readInitActions( xml, storyboard );
		} );

		readXmlArray( xml.Story, ( xml: XmlElement ) => {
			storyboard.addStory( this.readStory( xml ) );
		} );

		readXmlArray( xml?.EndConditions?.ConditionGroup, ( xml: XmlElement ) => {
			storyboard.addEndConditionGroup( this.readConditionGroup( xml ) );
		} );

		readXmlArray( xml?.StopTrigger?.ConditionGroup, ( xml: XmlElement ) => {
			storyboard.addEndConditionGroup( this.readConditionGroup( xml ) );
		} );

		return storyboard;
	}

	private readCatalogReference ( xml: XmlElement ) {

		const catalogReference = new CatalogReference( null, null );

		catalogReference.catalogName = xml.attr_catalogName;
		catalogReference.entryName = xml.attr_entryName;


		return catalogReference;
	}

	private readCatalogs ( xml: XmlElement ) {

		const catalogs = new Catalogs();

		catalogs.trajectoryCatalog = this.readTrajectoryCatalog( xml.TrajectoryCatalog );

		return catalogs;
	}

	private readTrajectoryCatalog ( xml: XmlElement ): TrajectoryCatalog {

		const directory = OpenScenarioImporter.readDirectory( xml.Directory );

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

	private static readRoutePositionPosition ( param: any ): Position {

		throw new Error( 'Method not implemented.' );

	}

	private static readScenarioObjectType ( value: string ) {

		switch ( value ) {

			case 'vehicle':
				return ScenarioObjectType.vehicle;

			case 'pedestrian':
				return ScenarioObjectType.pedestrian;

			case 'miscellaneous':
				return ScenarioObjectType.miscellaneous;

			default:
				TvConsole.warn( 'Unknown object type: ' + value );
				return ScenarioObjectType.miscellaneous;

		}

	}

	private static readCoordinateSystem ( value: string ): CoordinateSystem {

		switch ( value ) {

			case 'entity':
				return CoordinateSystem.entity;

			case 'lane':
				return CoordinateSystem.lane;

			case 'road':
				return CoordinateSystem.road;

			case 'trajectory':
				return CoordinateSystem.trajectory;

			default:
				TvConsole.warn( 'Unknown coordinate system: ' + value );
				return CoordinateSystem.entity;

		}

	}

	private static readRelativeDistanceType ( value: string ): RelativeDistanceType {

		switch ( value ) {

			case 'cartesianDistance':
				return RelativeDistanceType.cartesianDistance;

			case 'lateral':
				return RelativeDistanceType.lateral;

			case 'longitudinal':
				return RelativeDistanceType.longitudinal;

			case 'euclidianDistance':
				return RelativeDistanceType.euclidianDistance;

			default:
				TvConsole.warn( 'Unknown relative distance type: ' + value );
				return RelativeDistanceType.cartesianDistance;

		}

	}

	private static readRoutingAlgorithm ( value: string ): RoutingAlgorithm {

		switch ( value ) {

			case 'assignedRoute':
				return RoutingAlgorithm.assignedRoute;

			case 'fastest':
				return RoutingAlgorithm.fastest;

			case 'shortest':
				return RoutingAlgorithm.shortest;

			case 'leastIntersections':
				return RoutingAlgorithm.leastIntersections;

			case 'undefined':
				return RoutingAlgorithm.undefined;

			case 'random':
				return RoutingAlgorithm.random;

			default:
				TvConsole.warn( 'Unknown routing algorithm: ' + value );
				return RoutingAlgorithm.undefined;

		}

	}

	private static readTimeToCollisionCondition ( xml: XmlElement ) {

		const entityRef =
			xml?.Target?.Entity?.attr_name ||	// 0.9
			xml?.TimeToCollisionConditionTarget?.EntityRef?.attr_entityRef; // 1.0 or above

		const position = OpenScenarioImporter.readPosition(
			xml?.Target.Position ||									// 0.9
			xml?.TimeToCollisionConditionTarget?.Position					// 1.0 or above
		);

		const value = parseFloat( xml?.attr_value || 0 );
		const freespace = xml?.attr_freespace == 'true';
		const rule = OpenScenarioImporter.readRule( xml.attr_rule );

		// deprecated from 1,1
		const alongRoute = xml?.attr_alongRoute == 'true';

		// added in 1.1
		const coordinateSystem = OpenScenarioImporter.readCoordinateSystem( xml?.attr_coordinateSystem );
		const relativeDistanceType = OpenScenarioImporter.readRelativeDistanceType( xml?.attr_relativeDistanceType );

		// added in 1.2
		const routingAlgorithm = OpenScenarioImporter.readRoutingAlgorithm( xml?.attr_routingAlgorithm );

		return new TimeToCollisionCondition( entityRef ?? position, value, freespace, alongRoute, rule, coordinateSystem, relativeDistanceType, routingAlgorithm );

	}

	private static readDirectionDimension ( value: string ): DirectionDimension {

		switch ( value ) {

			case 'lateral':
				return DirectionDimension.lateral;

			case 'longitudinal':
				return DirectionDimension.longitudinal;

			case 'vertical':
				return DirectionDimension.vertical;

			default:
				return DirectionDimension.all;

		}


	}

	private static readRelativeDistanceCondition ( xml: XmlElement ): RelativeDistanceCondition {

		const entityRef: string = xml?.attr_entity || xml?.attr_entityRef;
		const relativeDistanceType = this.readRelativeDistanceType( xml?.attr_type || xml?.relativeDistanceType );
		const value = parseFloat( xml?.attr_value || 0 );
		const freespace = xml?.attr_freespace == 'true';
		const rule = this.readRule( xml.attr_rule );
		const coordinateSystem = this.readCoordinateSystem( xml?.attr_coordinateSystem );
		const routingAlgorithm = this.readRoutingAlgorithm( xml?.attr_routingAlgorithm );

		return new RelativeDistanceCondition( entityRef, relativeDistanceType, value, freespace, rule, coordinateSystem, routingAlgorithm );
	}

	private static readTimeHeadwayCondition ( xml: XmlElement ): TimeHeadwayCondition {

		const entity: string = xml?.attr_entity || xml?.attr_entityRef;
		const value = parseFloat( xml?.attr_value || 0 );
		const freespace = xml?.attr_freespace == 'true';
		const rule = OpenScenarioImporter.readRule( xml.attr_rule );

		// deprecated from 1,1
		const alongRoute = xml?.attr_alongRoute == 'true';

		// added in 1.1
		const coordinateSystem = OpenScenarioImporter.readCoordinateSystem( xml?.attr_coordinateSystem );
		const relativeDistanceType = OpenScenarioImporter.readRelativeDistanceType( xml?.attr_relativeDistanceType );

		// added in 1.2
		const routingAlgorithm = OpenScenarioImporter.readRoutingAlgorithm( xml?.attr_routingAlgorithm );

		return new TimeHeadwayCondition( entity, value, freespace, alongRoute, rule, coordinateSystem, relativeDistanceType, routingAlgorithm );
	}

	private static readConditionEdge ( edge: string ): ConditionEdge {

		if ( edge === 'rising' ) {

			return ConditionEdge.rising;

		} else if ( edge === 'falling' ) {

			return ConditionEdge.falling;

		} else if ( edge === 'risingOrFalling' ) {

			return ConditionEdge.risingOrFalling;

		} else {

			return ConditionEdge.none;

		}
	}
}
