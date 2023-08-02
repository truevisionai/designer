/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Debug } from 'app/core/utils/debug';

import { XMLParser } from 'fast-xml-parser';
import { Vector3 } from 'three';
import { IFile } from '../../../core/models/file';
import { AbstractReader } from '../../../core/services/abstract-reader';
import { readXmlArray, readXmlElement } from '../../../core/tools/xml-utils';
import { TvConsole } from '../../../core/utils/console';
import { FileService } from '../../../services/file.service';
import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { DefaultVehicleController } from '../controllers/default-vehicle-controller';
import { AbstractController } from '../models/abstract-controller';
import { Target } from '../models/actions/target';
import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { FollowTrajectoryAction } from '../models/actions/tv-follow-trajectory-action';
import {
	AddEntityAction,
	DeleteEntityAction,
	EnvironmentAction,
	GlobalAction,
	ParameterModifyAction,
	ParameterSetAction
} from '../models/actions/tv-global-action';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { AbstractRoutingAction, FollowRouteAction, TimeReference, Timing } from '../models/actions/tv-routing-action';
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
import { TvAxle, TvAxles, TvBoundingBox, TvDimension, TvPerformance } from '../models/tv-bounding-box';

import { CatalogReference, Catalogs, TrajectoryCatalog } from '../models/tv-catalogs';
import { Directory, File } from '../models/tv-common';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import {
	ConditionEdge,
	CoordinateSystem,
	DirectionDimension,
	DynamicsDimension,
	DynamicsShape,
	TrajectoryFollowingMode,
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
import { TvProperty } from '../models/tv-properties';
import { RoadNetwork } from '../models/tv-road-network';
import { Route, Waypoint } from '../models/tv-route';
import { TvScenario } from '../models/tv-scenario';
import { ManeuverGroup } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { Storyboard } from '../models/tv-storyboard';
import { AbstractShape, ClothoidShape, ControlPoint, PolylineShape, SplineShape, Trajectory, Vertex } from '../models/tv-trajectory';
import { VehicleEntity } from '../models/entities/vehicle-entity';
import { RelativeRoadPosition } from './relative-road.position';
import {
	TrafficSignalController,
	TrafficSignalControllerCondition,
	TrafficSignalPhase,
	TrafficSignalState
} from './traffic-signal-controller.condition';
import { TrafficSignalCondition } from './traffic-signal.condition';
import { UserDefinedValueCondition } from './user-defined-value.condition';
import { VehicleFactory } from 'app/core/factories/vehicle.factory';

@Injectable( {
	providedIn: 'root'
} )
export class OpenScenarioImporter extends AbstractReader {

	public static openScenario: TvScenario;
	private file: IFile;

	constructor ( private fileService: FileService ) {
		super();
	}

	public readContents ( contents: string ): TvScenario {

		const xml = this.getXMLElement( contents );

		return this.parseXML( xml );
	}

	public getXMLElement ( contents: string ): XmlElement {

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			textNodeName: 'value',
			ignoreAttributes: false,
			supressEmptyNode: false,
			format: true,
		};

		const xmlParser = new XMLParser( defaultOptions );

		const xml: XmlElement = xmlParser.parse( contents );

		return xml;
	}

	public parseXML ( xml: XmlElement ): TvScenario {

		OpenScenarioImporter.openScenario = new TvScenario();

		OpenScenarioImporter.readRootElement( xml, OpenScenarioImporter.openScenario );

		return OpenScenarioImporter.openScenario;
	}

	public static readRootElement ( xml: XmlElement, scenario: TvScenario ): any {

		const root: XmlElement = xml.OpenSCENARIO;

		scenario.fileHeader = this.readFileHeader( root.FileHeader );

		if ( root?.Storyboard ) {

			this.readScenario( root, scenario );

		} else if ( root?.CatalogDefinition ) {

			throw new Error( 'CatalogDefinition not implemented yet' );

		} else if ( root?.ParameterValueDistribution ) {

			throw new Error( 'ParameterValueDistribution not implemented yet' );

		}

	}

	public static readScenario ( xml: XmlElement, scenario: TvScenario ) {

		readXmlArray( xml.ParameterDeclarations?.ParameterDeclaration, ( xml: XmlElement ) => {
			scenario.addParameterDeclaration( this.readParameterDeclaration( xml ) );
		} );

		// to support 0.9. for example check Stauende.xosc
		readXmlArray( xml.ParameterDeclaration?.Parameter, ( xml: XmlElement ) => {
			scenario.addParameterDeclaration( this.readParameterDeclaration( xml ) );
		} );

		// this.readCatalog( xml.CatalogLocations?.VehicleCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.ControllerCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.PedestrianCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.MiscObjectCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.EnvironmentCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.ManeuverCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.TrajectoryCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.RouteCatalog?.Directory?.attr_path );
		//
		// // support for 0.9
		// // both moved into ControllerCatalogLocation in 1.0
		// this.readCatalog( xml.CatalogLocations?.PedestrianControllerCatalog?.Directory?.attr_path );
		// this.readCatalog( xml.CatalogLocations?.DriverCatalog?.Directory?.attr_path );

		scenario.roadNetwork = this.readRoadNetwork( xml.RoadNetwork );

		this.readEntities( xml.Entities, scenario );

		// EntitySelections
		// TODO: implement

		scenario.storyboard = this.readStoryboard( xml.Storyboard );

	}

	static readRule ( rule: string ): Rule {

		if ( rule === 'greater_than' || rule === 'greaterThan' ) {

			return Rule.GreaterThan;

		} else if ( rule === 'less_than' || rule === 'lessThan' ) {

			return Rule.LessThan;

		} else if ( rule === 'equal_to' || rule === 'equalTo' ) {

			return Rule.EqualTo;

		} else if ( rule === 'greater_or_equal' || rule === 'greaterOrEqual' ) {

			return Rule.GreaterOrEqual;

		} else if ( rule === 'less_or_equal' || rule === 'lessOrEqual' ) {

			return Rule.LessOrEqual;

		} else if ( rule === 'not_equal_to' || rule === 'notEqualTo' ) {

			return Rule.NotEqualTo;

		} else {

			TvConsole.warn( 'unknown rule ' + rule );

			return Rule.GreaterOrEqual;

		}
	}

	public static readWorldPosition ( xml: XmlElement ): WorldPosition {

		return new WorldPosition(
			parseFloat( xml.attr_x || 0 ),
			parseFloat( xml.attr_y || 0 ),
			parseFloat( xml.attr_z || 0 ),
			parseFloat( xml.attr_h || 0 ),
			parseFloat( xml.attr_p || 0 ),
			parseFloat( xml.attr_r || 0 ),
		);

	}

	public static readRelativeSpeedCondition ( xml: XmlElement ): RelativeSpeedCondition {

		const entity: string = xml.attr_entity || xml.attr_entityRef;
		const value = parseFloat( xml.attr_value || 0 );
		const rule = OpenScenarioImporter.readRule( xml.attr_rule );

		const direction = this.readDirectionDimension( xml?.attr_direction );

		return new RelativeSpeedCondition( entity, value, rule, direction );
	}

	public static readRelativeLanePosition ( xml: XmlElement ): RelativeLanePosition {

		const entityRef: string = xml.attr_object || xml.attr_entity || xml.attr_entityRef;
		const dLane = parseInt( xml.attr_dLane );
		const ds = parseFloat( xml.attr_ds || 0 );
		const offset = parseFloat( xml.attr_offset || 0 );
		const dsLane = parseFloat( xml.attr_offset || 0 );

		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );

		return new RelativeLanePosition( entityRef, dLane, ds, offset, dsLane, orientation );
	}

	public static readRelativeObjectPosition ( xml: XmlElement ): RelativeObjectPosition {

		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );
		const entity: string = xml.attr_object || xml.attr_entity || xml.attr_entityRef;
		const dx = parseFloat( xml.attr_dx || 0 );
		const dy = parseFloat( xml.attr_dy || 0 );
		const dz = parseFloat( xml.attr_dz || 0 );

		return new RelativeObjectPosition( entity, dx, dy, dz, orientation );
	}

	public static readOrientation ( xml: XmlElement ): Orientation {

		return Orientation.fromXML( xml );

	}

	public static readParameterDeclaration ( xml: XmlElement ): ParameterDeclaration {

		const name: string = xml.attr_name;

		const value: string = xml.attr_value;

		const type: ParameterType = Parameter.stringToEnum( xml.attr_type || xml.attr_parameterType );

		return new ParameterDeclaration( new Parameter( name, type, value ) );

	}

	public static readParameter ( xml: XmlElement ): Parameter {

		const name: string = xml.attr_name;
		const value: string = xml.attr_value;

		const type = Parameter.stringToEnum( xml.attr_type || xml.attr_parameterType );

		return new Parameter( name, type, value );
	}

	public static readSpeedCondition ( xml: XmlElement ): SpeedCondition {

		const value = parseFloat( xml?.attr_value || 0 );
		const rule = this.readRule( xml?.attr_rule );

		// added in 1.2
		const direction: DirectionDimension = this.readDirectionDimension( xml?.attr_direction );

		return new SpeedCondition( value, rule, direction );
	}

	public static readDirectory ( xml: XmlElement ): Directory {

		return new Directory( xml.attr_path );

	}

	public static readParameterCondition ( xml: XmlElement ): ParameterCondition {

		const rule: Rule = this.readRule( xml.attr_rule );

		const name: string = xml.attr_name || xml.attr_parameterRef;

		const value: string = xml.attr_value;

		return new ParameterCondition( name, value, rule );
	}

	public static readTimeOfDayCondition ( xml: XmlElement ): TimeOfDayCondition {

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

	public static readUserDefinedValueCondition ( xml: XmlElement ): UserDefinedValueCondition {

		return new UserDefinedValueCondition( xml.attr_name, xml.attr_value, xml.attr_rule );

	}

	public static readTrafficSignalCondition ( xml: XmlElement ): TrafficSignalCondition {

		return new TrafficSignalCondition( xml.attr_name, xml.attr_state );

	}

	public static readTrafficSignalControllerCondition ( xml: XmlElement ): TrafficSignalControllerCondition {

		return new TrafficSignalControllerCondition( xml.attr_phase, xml.attr_trafficSignalControllerRef, );

	}

	public static readRelativeWorldPosition ( xml: XmlElement ): RelativeWorldPosition {

		return RelativeWorldPosition.fromXML( xml );

	}

	public static readRoadPosition ( xml: XmlElement ): RoadPosition {

		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );
		const roadId = parseInt( xml.attr_roadId );
		const s = parseFloat( xml.attr_s || 0 );
		const t = parseFloat( xml.attr_t || 0 );

		return new RoadPosition( roadId, s, t, orientation );

	}

	public static readRelativeRoadPosition ( xml: XmlElement ): RelativeRoadPosition {

		const entity: string = xml.attr_object || xml.attr_entity || xml.attr_entityRef;
		const orientation = OpenScenarioImporter.readOrientation( xml.Orientation );
		const roadId = parseInt( xml.attr_roadId );
		const ds = parseFloat( xml.attr_ds || 0 );
		const dt = parseFloat( xml.attr_dt || 0 );

		return new RelativeRoadPosition( entity, roadId, ds, dt, orientation );
	}

	public async readFromPath ( path: string ): Promise<TvScenario> {

		const contents = await this.fileService.readAsync( path );

		return this.readContents( contents );

	}

	public static readCondition ( xml: XmlElement ) {

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
			condition.edge = edge ? edge : ConditionEdge.rising;

		}

		return condition;

	}

	public static readFileHeader ( xmlElement: any ) {

		return new FileHeader(
			parseFloat( xmlElement.attr_revMajor ),
			parseFloat( xmlElement.attr_revMinor ),
			xmlElement.attr_date,
			xmlElement.attr_description,
			xmlElement.attr_author,
		);

	}

	public static readTimeReference ( xml: XmlElement ): TimeReference {

		let timeReference = new TimeReference;

		if ( xml.Timing != null ) {

			let domainAbsoluteRelative = xml.Timing?.attr_domain || xml.Timing?.attr_domainAbsoluteRelative || 'absolute';
			let scale = parseFloat( xml.Timing.attr_scale );
			let offset = parseFloat( xml.Timing.attr_offset );

			timeReference.timing = new Timing( domainAbsoluteRelative, scale, offset );

		} else if ( xml.None != null ) {

			// do nothing

		}

		return timeReference;
	}

	public static readRoadNetwork ( xml: XmlElement ) {

		let logics: File, sceneGraph: File;
		let controllers: TrafficSignalController[] = [];

		if ( xml.Logics || xml.LogicFile ) {
			logics = this.readFile( xml.Logics || xml.LogicFile );
		}

		if ( xml.SceneGraph || xml.SceneGraphFile ) {
			sceneGraph = this.readFile( xml.SceneGraph || xml.SceneGraphFile );
		}

		if ( xml.Signals || xml.TrafficSignals ) {

			const items: XmlElement[] = xml.Signals?.Controller || xml.TrafficSignals?.TrafficSignalController;

			readXmlArray( items, ( xml ) => {
				controllers.push( this.readTrafficSignalController( xml ) );
			} );

		}

		return new RoadNetwork( logics, sceneGraph, controllers );
	}

	public static readEntities ( xml: XmlElement, scenario: TvScenario ): void {

		// Object is for 0.9 and ScenarioObject is for 1.0 and above
		readXmlArray( xml?.Object || xml?.ScenarioObject, ( xml: XmlElement ) => {

			scenario.addObject( this.readScenarioObject( xml ) );

		} );

	}

	public static readScenarioObject ( xml: XmlElement ): ScenarioEntity {

		const name: string = xml.attr_name;

		// const entityObject = new EntityObject( name );
		let entityObject: ScenarioEntity;

		if ( xml.Vehicle ) {

			entityObject = this.readVehicle( xml.Vehicle );

		} else if ( xml.Pedestrian ) {

		} else if ( xml.MiscObject ) {

		} else if ( xml.CatalogReference ) {

		}

		entityObject = entityObject || VehicleFactory.createDefaultCar( name );

		entityObject.name = name;

		readXmlElement( xml.Controller || xml.ObjectController, ( xml ) => {

			this.readController( xml, entityObject );

		} );

		return entityObject;

	}

	static readVehicle ( xml: XmlElement ): ScenarioEntity {

		// <xsd:complexType name="Vehicle">
		// <xsd:all>
		// <xsd:element name="ParameterDeclarations" type="ParameterDeclarations" minOccurs="0"/>
		// <xsd:element name="BoundingBox" type="BoundingBox"/>
		// <xsd:element name="Performance" type="Performance"/>
		// <xsd:element name="Axles" type="Axles"/>
		// <xsd:element name="Properties" type="Properties"/>
		// </xsd:all>
		// <xsd:attribute name="name" type="String" use="required"/>
		// <xsd:attribute name="vehicleCategory" type="VehicleCategory" use="required"/>
		// </xsd:complexType>

		const name: string = xml.attr_name;

		const category = xml.attr_category || xml.attr_vehicleCategory;

		const boundingBox = this.readBoundingBox( xml.BoundingBox );

		const performance = this.readPerformance( xml.Performance );

		const axles: TvAxles = this.readAxles( xml.Axles );

		const properties: TvProperty[] = this.readProperties( xml.Properties );

		return new VehicleEntity( name, category, boundingBox, performance, axles, properties );
	}

	static readProperties ( xml: XmlElement ): TvProperty[] {

		const properties: TvProperty[] = [];

		readXmlArray( xml.Property, ( xml ) => TvProperty.fromXML( xml ) );

		return properties;

	}

	static readAxles ( xml: XmlElement ): TvAxles {

		// <xsd:element name="Front" type="OSCAxle"/>
		// <xsd:element name="Rear" type="OSCAxle"/>
		// <xsd:element name="Additional" type="OSCAxle" minOccurs="0" maxOccurs="unbounded"/>

		const frontAxle = this.readAxle( xml.FrontAxle ) || new TvAxle( 0.5, 0.8, 1.68, 2.98, 0.4 );

		const rearAxle = this.readAxle( xml.RearAxle ) || new TvAxle( 0.5, 0.8, 1.68, 0, 0.4 );

		const additionalAxles = [];

		readXmlArray( xml.AdditionalAxle, ( xml ) => additionalAxles.push( this.readAxle( xml ) ) );

		return new TvAxles( frontAxle, rearAxle, additionalAxles );

	}

	static readAxle ( xml: XmlElement ): TvAxle {

		// <xsd:attribute name="maxSteering"   type="xsd:double" use="required"/>
		// <xsd:attribute name="wheelDiameter" type="xsd:double" use="required"/>
		// <xsd:attribute name="trackWidth"    type="xsd:double" use="required"/>
		// <xsd:attribute name="positionX"     type="xsd:double" use="required"/>
		// <xsd:attribute name="positionZ"     type="xsd:double" use="required"/>

		return new TvAxle(
			parseFloat( xml.attr_maxSteering ),
			parseFloat( xml.attr_wheelDiameter ),
			parseFloat( xml.attr_trackWidth ),
			parseFloat( xml.attr_positionX ),
			parseFloat( xml.attr_positionZ ),
		);

	}

	static readPerformance ( xml: XmlElement ): TvPerformance {

		return new TvPerformance(
			parseFloat( xml.attr_maxSpeed ),
			parseFloat( xml.attr_maxAcceleration ),
			parseFloat( xml.attr_maxDeceleration ),
			parseFloat( xml.attr_mass || 0 ),
		);

	}

	static readBoundingBox ( xml: XmlElement ): TvBoundingBox {

		return new TvBoundingBox(
			this.readVector3( xml.Center ),
			this.readDimension( xml.Dimension || xml.Dimensions ),
		);
	}

	static readDimension ( xml: XmlElement ): TvDimension {

		return new TvDimension(
			parseFloat( xml.attr_width ),
			parseFloat( xml.attr_length ),
			parseFloat( xml.attr_height ),
		);

	}

	static readVector3 ( xml: XmlElement ): Vector3 {

		return new Vector3(
			parseFloat( xml.attr_x ),
			parseFloat( xml.attr_y ),
			parseFloat( xml.attr_z ),
		);

	}

	public static readController ( xml: XmlElement, entity: ScenarioEntity ): AbstractController {

		let controller: AbstractController;

		const name = xml.attr_name;

		if ( xml.CatalogReference != null ) {

			// const catalogReference = CatalogReference.readXml( xml.CatalogReference );
			// response = new CatalogReferenceController( catalogReference );
			controller = null;

		} else if ( xml.Driver != null ) {

			controller = null;

		} else if ( xml.PedestrianController != null ) {

			controller = null;

		}

		controller = controller || new DefaultVehicleController( name, entity );

		entity.setController( controller );

		readXmlArray( xml.ParameterDeclarations?.ParameterDeclaration, ( xml ) => {
			controller.addParameterDeclaration( this.readParameterDeclaration( xml ) );
		} );

		readXmlArray( xml.Properties?.Property, ( xml ) => {
			controller.addProptery( TvProperty.fromXML( xml ) );
		} );

		return controller;

	}

	public static readFile ( xml ) {

		return new File( xml.attr_filepath );

	}

	public static readConditionGroup ( xml: XmlElement ): ConditionGroup {

		const conditionGroup = new ConditionGroup;

		this.readAsOptionalArray( xml.Condition, ( xml ) => {

			conditionGroup.addCondition( this.readCondition( xml ) );

		} );

		return conditionGroup;

	}

	public static readByEntityCondition ( xml: XmlElement ): Condition {

		const condition = OpenScenarioImporter.readConditionByEntity( xml.EntityCondition );

		if ( !condition ) return null;

		this.readAsOptionalElement( xml.TriggeringEntities, ( xml ) => {

			// 0.9
			this.readAsOptionalArray( xml.Entity, ( xml ) => {
				condition.addTriggeringEntity( xml.attr_name );
			} );

			// 1.0 or above
			this.readAsOptionalArray( xml.EntityRef, ( xml ) => {
				condition.addTriggeringEntity( xml.attr_entityRef );
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

	public static readConditionByEntity ( xml: XmlElement ): EntityCondition {

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

	public static readReachPositionCondition ( xml: XmlElement ): ReachPositionCondition {

		const position = OpenScenarioImporter.readPosition( xml.Position );
		const tolerance = parseFloat( xml.attr_tolerance || 0 );

		return new ReachPositionCondition( position, tolerance );
	}

	public static readDistanceCondition ( xml: XmlElement ): DistanceCondition {

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

	public static readConditionByValue ( xml: XmlElement ): Condition {

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

	public static readSimulationTimeCondition ( xml: XmlElement ): SimulationTimeCondition {

		const value = parseFloat( xml.attr_value || 0 );
		const rule = this.readRule( xml.attr_rule );

		return new SimulationTimeCondition( value, rule );
	}

	public static readAtStartCondition ( xml: XmlElement ): Condition {

		let type = StoryboardElementStateCondition.stringToStoryboardType( xml.attr_type || xml.attr_storyboardElementType );

		let elementName: string = xml.attr_name || xml.attr_storyboardElementRef;

		return new StoryboardElementStateCondition( type, elementName, StoryboardElementState.startTransition );
	}

	public static readAfterTerminationCondition ( xml: XmlElement ): Condition {

		let type = StoryboardElementStateCondition.stringToStoryboardType( xml.attr_type || xml.attr_storyboardElementType );

		let elementName: string = xml.attr_name || xml.attr_storyboardElementRef;

		return new StoryboardElementStateCondition( type, elementName, StoryboardElementState.endTransition );
	}

	public static readStoryboardElementStateCondition ( xml: XmlElement ): Condition {

		let type = StoryboardElementStateCondition.stringToStoryboardType( xml.attr_type || xml.attr_storyboardElementType );

		let state = StoryboardElementStateCondition.stringToState( xml.attr_state );

		let elementName: string = xml.attr_name || xml.attr_storyboardElementRef;

		return new StoryboardElementStateCondition( type, elementName, state );

	}

	public static readStory ( xml: XmlElement ): Story {

		let name = xml.attr_name;
		let ownerName = xml.attr_owner ? xml.attr_owner : null;

		const story = new Story( name, ownerName );

		readXmlArray( xml.Act, xml => story.addAct( this.readAct( xml ) ) );

		readXmlArray( xml.ParameterDeclarations?.ParameterDeclaration,
			xml => story.addParameterDeclaration( this.readParameterDeclaration( xml ) )
		);

		return story;
	}

	public static readAct ( xml: XmlElement ): Act {

		const act = new Act;

		act.name = xml.attr_name;

		// Sequence is for 0.9
		// ManeuverGroup is for 1.0 and above
		this.readAsOptionalArray( xml.Sequence || xml.ManeuverGroup, ( xml ) => {
			act.addSequence( this.readSequence( xml ) );
		} );

		// Start is a single element
		this.readAsOptionalElement( xml.Conditions?.Start || xml.StartTrigger, ( xml ) => {
			this.readAsOptionalArray( xml.ConditionGroup, ( xml ) => {
				act.startConditionGroups.push( this.readConditionGroup( xml ) );
			} );
		} );

		// TODO: Fix End could also be an array
		this.readAsOptionalElement( xml.Conditions?.End || xml.StopTrigger, ( xml ) => {
			this.readAsOptionalArray( xml.ConditionGroup, ( xml ) => {
				act.endConditionGroups.push( this.readConditionGroup( xml ) );
			} );
		} );

		// TODO: Fix Cancel could also be an array
		this.readAsOptionalElement( xml.Conditions?.Cancel, ( xml ) => {
			this.readAsOptionalArray( xml.ConditionGroup, ( xml ) => {
				act.cancelConditionGroups.push( this.readConditionGroup( xml ) );
			} );
		} );


		return act;

	}

	public static readSequence ( xml: XmlElement ): ManeuverGroup {

		const name = xml.attr_name;
		const numberOfExecutions = parseFloat( xml.attr_numberOfExecutions || xml.attr_maximumExecutionCount );

		const maneuverGroup = new ManeuverGroup( name, numberOfExecutions );

		// for 1.0 and above
		if ( xml.Actors?.attr_selectTriggeringEntities == 'true' ) {
			maneuverGroup.selectTriggeringEntities = true;
		}

		// support for 0.9
		readXmlArray( xml.Actors?.Entity, ( xml ) => {
			maneuverGroup.actors.push( xml.attr_name );
		} );
		// 1.0 and above
		readXmlArray( xml.Actors?.EntityRef, ( xml ) => {
			maneuverGroup.actors.push( xml.attr_entityRef );
		} );

		// read catalogReference
		// read maneuvers

		this.readAsOptionalArray( xml.Maneuver, ( xml ) => {
			maneuverGroup.addManeuver( this.readManeuver( xml ) );
		} );

		return maneuverGroup;
	}

	public static readManeuver ( xml: XmlElement ): Maneuver {

		const maneuver = new Maneuver( xml.attr_name );

		readXmlArray( xml.ParameterDeclarations?.ParameterDeclaration, ( xml: XmlElement ) => {
			maneuver.addParameterDeclaration( this.readParameterDeclaration( xml ) );
		} );

		// to support 0.9. for example check Stauende.xosc
		readXmlArray( xml.ParameterDeclaration?.Parameter, ( xml: XmlElement ) => {
			maneuver.addParameterDeclaration( this.readParameterDeclaration( xml ) );
		} );

		this.readAsOptionalArray( xml.Event, ( xml ) => {
			maneuver.addEventInstance( this.readEvent( xml ) );
		} );

		return maneuver;
	}

	public static readEvent ( xml: XmlElement ): TvEvent {

		const name = xml.attr_name;
		const priority = xml.attr_priority;

		const event = new TvEvent( name, priority );

		readXmlArray( xml.Action, ( xml ) => {

			const eventAction = this.readEventAction( xml );

			if ( eventAction?.action ) {

				event.addNewAction( eventAction.name, eventAction.action );

			} else {

				TvConsole.warn( `Event ${ event.name } has an invalid action ${ eventAction.name }` );

				console.error( xml );

			}

		} );

		readXmlArray( xml.StartConditions?.ConditionGroup, ( xml ) => {
			event.startConditionGroups.push( this.readConditionGroup( xml ) );
		} );
		readXmlArray( xml.StartTrigger?.ConditionGroup, ( xml ) => {
			event.startConditionGroups.push( this.readConditionGroup( xml ) );
		} );


		return event;
	}

	public static readEventAction ( xml: XmlElement ): EventAction {

		const action = new EventAction;

		action.name = xml.attr_name;

		if ( xml.Private || xml.PrivateAction ) {

			action.action = this.readPrivateAction( xml.Private || xml.PrivateAction );

		} else if ( xml.UserDefined || xml.UserDefinedAction ) {

			action.action = this.readUserDefinedAction( xml.UserDefined || xml.UserDefinedAction );

		} else if ( xml.Global || xml.GlobalAction ) {

			action.action = this.readGlobalAction( xml.Global || xml.GlobalAction );

		}

		return action;
	}

	public static readInitActions ( xml: XmlElement, storyboard: Storyboard ) {

		this.readAsOptionalArray( xml.Global, ( item ) => {

			const globalAction = this.readGlobalAction( item );

		} );

		this.readAsOptionalArray( xml.UserDefined, ( item ) => {

			const userDefinedAction = this.readUserDefinedAction( item );

		} );

		this.readAsOptionalArray( xml.Private || xml.PrivateAction, ( xml ) => {

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

	public static readUserDefinedAction ( item: any ): TvAction {

		throw new Error( 'Method not implemented.' );

	}

	public static readGlobalAction ( xml: XmlElement ): GlobalAction {

		if ( xml.SetEnvironment || xml.EnvironmentAction ) {

			// <xsd:element name="Environment"         type="OSCEnvironment"/>
			// 	<xsd:element name="CatalogReference"    type="OSCCatalogReference"/>
			// <xsd:element name="Environment" type="Environment"/>
			// 	<xsd:element name="CatalogReference" type="CatalogReference"/>
			return EnvironmentAction.fromXML( xml.Environment || xml.EnvironmentAction );
		}

		if ( xml.Entity?.Add || xml.EntityAction?.AddEntityAction ) {

			return AddEntityAction.fromXML( xml.Entity || xml.EntityAction );

		}

		if ( xml.Entity?.Delete || xml.EntityAction?.DeleteEntityAction ) {

			return DeleteEntityAction.fromXML( xml.Entity || xml.EntityAction );

		}

		if ( xml.Parameter || xml.ParameterAction ) {

			return this.readParameterAction( xml.Parameter || xml.ParameterAction );

		}

		if ( xml.Infrastructure || xml.InfrastructureAction ) {

			TvConsole.warn( 'InfrastructureAction not supported yet' );

		}

	}

	public static readPrivateAction ( xml: XmlElement ): PrivateAction {

		let action = null;

		if ( xml.Longitudinal || xml.LongitudinalAction ) {

			action = this.readLongitudinalAction( xml.Longitudinal || xml.LongitudinalAction );

		} else if ( xml.Lateral || xml.LateralAction ) {

			action = this.readLateralAction( xml.Lateral || xml.LateralAction );

		} else if ( xml.Visibility != null ) {

			TvConsole.warn( 'VisibilityAction not supported yet' );

		} else if ( xml.Meeting != null ) {

			TvConsole.warn( 'MeetingAction not supported yet' );

		} else if ( xml.Autonomous != null ) {

			TvConsole.warn( 'AutonomousAction not supported yet' );

		} else if ( xml.Controller != null ) {

			TvConsole.warn( 'ControllerAction not supported yet' );

		} else if ( xml.Position || xml.PositionAction || xml.TeleportAction ) {

			return this.readPositionAction( xml.Position || xml.PositionAction || xml.TeleportAction?.Position );

		} else if ( xml.Routing || xml.RoutingAction ) {

			return this.readRoutingAction( xml.Routing || xml.RoutingAction );

		} else {

			TvConsole.warn( `Unknown private action ` + xml );

		}

		return action;

	}

	public static readLateralAction ( xml: XmlElement ): TvAction {

		let action: TvAction = null;

		if ( xml.LaneChange || xml.LaneChangeAction ) {

			action = this.readLaneChangeAction( xml.LaneChange || xml.LaneChangeAction );

		} else if ( xml.LaneOffset || xml.LaneOffsetAction ) {

			TvConsole.warn( 'LaneOffsetAction not supported yet' );

		} else if ( xml.Distance || xml.DistanceAction ) {

			TvConsole.warn( 'DistanceAction not supported yet' );

		} else {

			TvConsole.warn( 'Action not supported yet ' + xml );

		}

		return action;

	}

	public static readRoutingAction ( xml: XmlElement ): AbstractRoutingAction {

		let action: AbstractRoutingAction = null;

		if ( xml.FollowRoute || xml.FollowRouteAction ) {

			action = this.readFollowRouteAction( xml.FollowRoute || xml.FollowRouteAction );

		} else if ( xml.FollowTrajectory || xml.FollowTrajectoryAction ) {

			action = this.readFollowTrajectoryAction( xml.FollowTrajectory || xml.FollowTrajectoryAction );

		} else if ( xml.AcquirePosition != null ) {

			TvConsole.warn( 'AcquirePosition not supported yet' );

		} else if ( xml.AssignRouteAction ) {

			TvConsole.warn( 'AssignRouteAction not supported yet' );

		}

		return action;
	}

	public static readFollowTrajectoryAction ( xml: XmlElement ): FollowTrajectoryAction {

		let trajectory: Trajectory = null;

		if ( xml.Trajectory ) {

			trajectory = this.readTrajectory( xml.Trajectory );

		} else if ( xml.CatalogReference != null ) {

			TvConsole.warn( 'CatalogReference not supported yet for FollowTrajectoryAction' );

		}

		let action = new FollowTrajectoryAction( trajectory );

		action.trajectoryFollowingMode = this.readTrajectoryFollowingMode(
			xml.Lateral?.attr_purpose || xml.TrajectoryFollowingMode?.followingMode
		);

		action.timeReference = this.readTimeReference( xml.Longitudinal || xml.TimeReference );

		return action;
	}

	static readTrajectoryFollowingMode ( value: string ): TrajectoryFollowingMode {

		if ( value == 'position' ) return TrajectoryFollowingMode.position;

		if ( value == 'steering' ) return TrajectoryFollowingMode.steering;

		if ( value == 'follow' ) return TrajectoryFollowingMode.follow;

		TvConsole.warn( 'unknown TrajectoryFollowingMode ' + value );

		return TrajectoryFollowingMode.position;
	}


	public static readTrajectory ( xml: XmlElement ): Trajectory {

		let name: string = xml.attr_name;
		let closed: boolean = xml.attr_closed == 'true';

		// deprecated
		let domain = xml.attr_domain;

		const shape = this.readTrajectoryShape( xml.Shape );

		const trajectory = new Trajectory( name, closed, domain, shape );

		readXmlArray( xml.ParameterDeclarations?.ParameterDeclaration, ( xml ) => {
			trajectory.addParameter( this.readParameterDeclaration( xml ) );
		} );

		return trajectory;
	}

	static readTrajectoryShape ( xml: XmlElement ): AbstractShape {

		if ( xml.Polyline ) {

			return this.readPolyline( xml.Polyline );

		}

		if ( xml.Clothoid ) {

			return ClothoidShape.fromXML( xml.Clothoid );

		}

		TvConsole.warn( 'Shape not supported yet' + xml );

	}

	static readPolyline ( xml: XmlElement ): PolylineShape {

		const shape = new PolylineShape();

		readXmlArray( xml.Vertex, ( xml ) => {

			shape.addVertex( this.readVertex( xml ) );

		} );

		return shape;


	}

	public static readFollowRouteAction ( xml: XmlElement ): FollowRouteAction {

		let route: Route = null;

		if ( xml.Route != null ) {

			route = this.readRoute( xml.Route );

		} else if ( xml.CatalogReference != null ) {

			TvConsole.warn( 'unsupported follow route action CatalogReference' );

		}

		return new FollowRouteAction( route );
	}

	public static readRoute ( xml: XmlElement ): Route {

		const name = xml.attr_name;

		const closed = xml.attr_closed == 'true';

		const parameters = [];

		const waypoints = [];

		readXmlArray( xml.ParameterDeclarations?.ParameterDeclaration, ( xml ) => {
			parameters.push( this.readParameterDeclaration( xml ) );
		} );

		readXmlArray( xml.Waypoint, ( xml ) => {
			waypoints.push( this.readWaypoint( xml ) );
		} );

		return new Route( name, closed, parameters, waypoints );
	}

	public static readWaypoint ( xml: XmlElement ): Waypoint {

		let position = OpenScenarioImporter.readPosition( xml.Position );
		let strategy = xml.attr_strategy;

		return new Waypoint( position, strategy );
	}

	public static readLaneChangeAction ( xml: XmlElement ): TvAction {

		const targetLaneOffset = parseFloat( xml.attr_targetLaneOffset || 0 );

		const dynamics = this.readTransitionDynamics( xml.Dynamics || xml.TransitionDynamics || xml.LaneChangeActionDynamics );

		const target = this.readTarget( xml.Target || xml.LaneChangeTarget );

		return new LaneChangeAction( dynamics, target, targetLaneOffset );

	}

	public static readTransitionDynamics ( xml: XmlElement ): TransitionDynamics {

		return TransitionDynamics.fromXML( xml );

	}

	public static readSpeedDynamics ( xml: XmlElement ): TransitionDynamics {

		// TOOD: Fix parsing of enum
		const dynamicsShape: DynamicsShape = xml.attr_dynamicsShape || xml.attr_shape;

		const value = parseFloat( xml.attr_value ?? 0 );

		// TOOD: Fix parsing of enum
		const dynamicsDimension: DynamicsDimension = xml.attr_dynamicsDimension;

		return new TransitionDynamics( dynamicsShape, value, dynamicsDimension );

	}

	public static readPositionAction ( xml: XmlElement ): PrivateAction {

		return new TeleportAction( OpenScenarioImporter.readPosition( xml ) );

	}

	public static readPosition ( xml: XmlElement ): Position {

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

	public static readLanePosition ( xml: XmlElement ): LanePosition {

		let roadId = parseInt( xml.attr_roadId );
		let laneId = parseInt( xml.attr_laneId );
		let s = parseFloat( xml.attr_s || 0 );
		let offset = parseFloat( xml.attr_offset || 0 );
		let orientation = Orientation.fromXML( xml.Orientation );

		return new LanePosition( roadId, laneId, offset, s, orientation );
	}

	public static readLongitudinalAction ( xml: XmlElement ): any {

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

	public static readTarget ( xml: XmlElement ): Target {

		if ( xml.Absolute ) {

			return new AbsoluteTarget( parseFloat( xml.Absolute.attr_value ) );

		} else if ( xml.Relative ) {

			const value = parseFloat( xml.Relative.attr_value || 0 );
			const object: string = xml.Relative.attr_object;

			return new RelativeTarget( object, value );

		}

		// new in OpenSCENARIO 1.0 and above

		if ( xml.AbsoluteTargetSpeed ) {

			const value = parseFloat( xml.AbsoluteTargetSpeed.attr_value || 0 );

			return new AbsoluteTarget( value );

		} else if ( xml.RelativeTargetSpeed ) {

			const value = parseFloat( xml.RelativeTargetSpeed.attr_value || 0 );
			const entityRef: string = xml.RelativeTargetSpeed.attr_entityRef;

			return new RelativeTarget( entityRef, value );

		} else if ( xml.RelativeTargetLane ) {

			const value: number = parseInt( xml.RelativeTargetLane.attr_value || 0 );
			const entityRef: string = xml.RelativeTargetLane.attr_entityRef;

			return new RelativeTarget( entityRef, value );

		} else if ( xml.AbsoluteTargetLane ) {

			return new AbsoluteTarget( parseInt( xml.AbsoluteTargetLane.attr_value || 0 ) );

		} else if ( xml.RelativeTargetLaneOffset ) {

			const value: number = parseFloat( xml.RelativeTargetLaneOffset.attr_value || 0 );
			const entityRef: string = xml.RelativeTargetLaneOffset.attr_entityRef;

			return new RelativeTarget( entityRef, value );

		} else if ( xml.AbosoluteTargetLaneOffset ) {

			return new AbsoluteTarget( parseFloat( xml.AbosoluteTargetLaneOffset.attr_value || 0 ) );

		} else {

			throw new Error( 'unknown target' );

		}
	}

	public static readVertex ( xml: XmlElement ): Vertex {

		const time = parseFloat( xml.attr_time || xml.attr_reference || 0 );

		const position = this.readPosition( xml.Position );

		return new Vertex( time, position );
	}

	public static readVertexShape ( xml: XmlElement ): AbstractShape {

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

	public static readClothoidShape ( xml: XmlElement ): ClothoidShape {

		const clothoid = new ClothoidShape;

		clothoid.curvature = parseFloat( xml.attr_curvature );
		clothoid.curvatureDot = parseFloat( xml.attr_curvatureDot );
		clothoid.length = parseFloat( xml.attr_length );

		return clothoid;
	}

	public static readSplineShape ( xml: XmlElement ): SplineShape {

		const spline = new SplineShape;

		spline.controlPoint1 = this.readSplineControlPoint( xml.ControlPoint1 );
		spline.controlPoint2 = this.readSplineControlPoint( xml.ControlPoint2 );

		return spline;
	}

	public static readSplineControlPoint ( xml: XmlElement ): ControlPoint {

		const controlPoint = new ControlPoint;

		controlPoint.status = xml.attr_status;

		return controlPoint;
	}

	public static readStoryboard ( xml: XmlElement ): Storyboard {

		const storyboard = new Storyboard();

		readXmlElement( xml.Init?.Actions, ( xml: XmlElement ) => {
			this.readInitActions( xml, storyboard );
		} );

		readXmlArray( xml.Story, ( xml: XmlElement ) => {
			storyboard.addStory( this.readStory( xml ) );
		} );

		// to suppoer 0.9 and to support 1.0 and above
		readXmlArray( xml?.EndConditions?.ConditionGroup || xml?.StopTrigger?.ConditionGroup, ( xml: XmlElement ) => {
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

	public static readScenarioObjectType ( value: string ) {

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

	public static readCoordinateSystem ( value: string ): CoordinateSystem {

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

	public static readRelativeDistanceType ( value: string ): RelativeDistanceType {

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

	public static readRoutingAlgorithm ( value: string ): RoutingAlgorithm {

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

	public static readTimeToCollisionCondition ( xml: XmlElement ) {

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

	public static readDirectionDimension ( value: string ): DirectionDimension {

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

	public static readRelativeDistanceCondition ( xml: XmlElement ): RelativeDistanceCondition {

		const entityRef: string = xml?.attr_entity || xml?.attr_entityRef;
		const relativeDistanceType = this.readRelativeDistanceType( xml?.attr_type || xml?.attr_relativeDistanceType );
		const value = parseFloat( xml?.attr_value || 0 );
		const freespace = xml?.attr_freespace == 'true';
		const rule = this.readRule( xml.attr_rule );
		const coordinateSystem = this.readCoordinateSystem( xml?.attr_coordinateSystem );
		const routingAlgorithm = this.readRoutingAlgorithm( xml?.attr_routingAlgorithm );

		return new RelativeDistanceCondition( entityRef, value, relativeDistanceType, freespace, rule, coordinateSystem, routingAlgorithm );
	}

	public static readTimeHeadwayCondition ( xml: XmlElement ): TimeHeadwayCondition {

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

	public static readConditionEdge ( edge: string ): ConditionEdge {

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

	public static readTrafficSignalController ( xml: XmlElement ): TrafficSignalController {

		const name = xml?.attr_name;
		const delay = parseFloat( xml?.attr_delay );
		const reference = xml?.attr_reference;

		const phases: TrafficSignalPhase[] = [];

		readXmlArray( xml?.Phase, ( xml: XmlElement ) => {
			phases.push( this.readTrafficSignalPhase( xml ) );
		} );

		return new TrafficSignalController( name, delay, reference, phases );
	}

	public static readTrafficSignalPhase ( xml: XmlElement ): TrafficSignalPhase {

		// 0.9 support
		const name = xml?.attr_type || xml?.attr_name;
		const duration = parseFloat( xml?.attr_duration || 0 );

		const states: TrafficSignalState[] = [];

		// in 0.9 it is Signal, in 1.0 and above it is State
		readXmlArray( xml?.Signal || xml?.State, ( xml: XmlElement ) => {
			states.push( new TrafficSignalState( xml?.attr_state, xml?.attr_name || xml?.attr_trafficSignalId ) );
		} );

		return new TrafficSignalPhase( name, duration, states );
	}

	public static readLaneChangeTarget ( xml: XmlElement ) {

	}

	private static readParameterAction ( xml: XmlElement ): ParameterModifyAction | ParameterSetAction {

		const paramterRef: string = xml?.attr_parameterRef || xml?.attr_parameterRef;

		if ( xml?.Set || xml?.SetAction ) {

			const value = xml?.Set?.attr_value || xml?.SetAction?.attr_value;

			return new ParameterSetAction( paramterRef, value );

		} else if ( xml?.Modify || xml?.ModifyAction ) {

			// const add = xml?.Modify?.Rule?.Add || xml?.ModifyAction?.Rule?.AddValue;
			// const multiply = xml?.Modify?.Rule?.Multiply || xml?.ModifyAction?.Rule?.MultiplyByValue;

			const add_value: number =
				xml?.Modify?.Rule?.Add?.attr_value ||
				xml?.ModifyAction?.Rule?.AddValue?.attr_value;

			const multiply_value: number =
				xml?.Modify?.Rule?.Multiply?.attr_value ||
				xml?.ModifyAction?.Rule?.MultiplyByValue?.attr_value;

			const action = add_value ? 'add' : 'multiply';

			return new ParameterModifyAction( paramterRef, add_value || multiply_value, action );
		}

	}
}
