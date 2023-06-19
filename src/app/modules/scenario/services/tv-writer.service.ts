/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Debug } from 'app/core/utils/debug';
import { DefaultVehicleController } from '../controllers/vehicle-controller';
import { AbstractController } from '../models/abstract-controller';
import { AbstractPosition } from '../models/abstract-position';
import { PrivateAction } from '../models/private-action';
import { AbstractTarget } from '../models/actions/abstract-target';
import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { FollowTrajectoryAction } from '../models/actions/tv-follow-trajectory-action';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { PositionAction } from '../models/actions/tv-position-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { EntityCondition } from '../models/conditions/entity-condition';
import { AtStartCondition } from '../models/conditions/tv-at-start-condition';
import { Condition } from '../models/conditions/tv-condition';
import { ConditionGroup } from '../models/conditions/tv-condition-group';
import { DistanceCondition } from '../models/conditions/tv-distance-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { LanePosition } from '../models/positions/tv-lane-position';
import { RelativeLanePosition } from '../models/positions/tv-relative-lane-position';
import { RelativeObjectPosition } from '../models/positions/tv-relative-object-position';
import { WorldPosition } from '../models/positions/tv-world-position';
import { Act } from '../models/tv-act';
import { CatalogReference, Catalogs } from '../models/tv-catalogs';
import { File } from '../models/tv-common';
import { EntityObject } from '../models/tv-entities';
import { ActionCategory, ActionType, ConditionCategory, ConditionType, PositionType, TargetType } from '../models/tv-enums';
import { TvEvent } from '../models/tv-event';
import { CatalogReferenceController } from '../models/tv-interfaces';
import { Maneuver } from '../models/tv-maneuver';
import { Orientation } from '../models/tv-orientation';
import { Parameter, ParameterDeclaration } from '../models/tv-parameter-declaration';
import { RoadNetwork } from '../models/tv-road-network';
import { OpenScenario } from '../models/tv-scenario';
import { Sequence } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { Storyboard } from '../models/tv-storyboard';
import { AbstractShape, ClothoidShape, PolylineShape, SplineShape, Trajectory, Vertex } from '../models/tv-trajectory';

@Injectable( {
	providedIn: 'root'
} )

export class WriterService {

	private xmlDocument: Object;
	private openScenario: OpenScenario;

	getOutputString ( openScenario: OpenScenario ) {

		this.openScenario = openScenario;

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			ignoreAttributes: false,
			supressEmptyNode: true,
			format: true,
			trimValues: true,
		};

		const Parser = require( 'fast-xml-parser' ).j2xParser;
		const parser = new Parser( defaultOptions );

		Debug.log( this.openScenario );

		this.writeOpenScenario();

		return parser.parse( this.xmlDocument );
	}

	writeOpenScenario (): any {

		const rootNode = {
			FileHeader: this.openScenario.fileHeader.exportXml(),
			ParameterDeclaration: null,
			Catalogs: null,
			RoadNetwork: null,
			Entities: null,
			Storyboard: null
		};

		rootNode.ParameterDeclaration = this.writeParameterDeclaration( this.openScenario.parameterDeclaration );

		if ( this.openScenario.catalogs != null ) {

			rootNode.Catalogs = this.writeCatalogs( rootNode, this.openScenario.catalogs );

		}

		if ( this.openScenario.objects != null ) {

			this.writeEntities( rootNode, this.openScenario.objects );

		}

		if ( this.openScenario.roadNetwork != null ) {

			this.writeRoadNetwork( rootNode, this.openScenario.roadNetwork );

		}

		if ( this.openScenario.storyboard != null ) {

			this.writeStoryboard( rootNode, this.openScenario.storyboard );

		}

		this.xmlDocument = {
			'OpenSCENARIO': rootNode
		};

	}

	writeEntities ( rootNode: any, objects: Map<string, EntityObject> ) {

		var entities = {
			Object: []
		};

		objects.forEach( ( item, key ) => {

			entities.Object.push( this.writeEntityObject( key, item ) );

		} );

		rootNode.Entities = entities;
	}

	writeEntityObject ( key: string, object: EntityObject ): any {

		var xml = {
			attr_name: object.name,
		};

		if ( object.catalogReference != null ) {

			xml[ 'CatalogReference' ] = this.writeCatalogReference( object.catalogReference );

		}

		if ( object.controller != null ) {

			xml[ 'Controller' ] = this.writeController( object.controller );

		}

		return xml;
	}

	writeController ( controller: AbstractController ): any {

		let xml = {};

		// TODO : Write test for this in production
		if ( controller instanceof CatalogReferenceController ) {

			const ctrl = controller as CatalogReferenceController;

			xml[ 'CatalogReference' ] = this.writeCatalogReference( ctrl.catalogReference );

		} else if ( controller instanceof DefaultVehicleController ) {

			xml = {
				CatalogReference: {
					attr_catalogName: 'TruevisionCatalog',
					attr_entryName: 'DefaultController',
				}
			};

		} else {

			throw new Error( 'Unsupported controller entry' );

		}

		return xml;

	}

	writeCatalogReference ( catalogReference: CatalogReference ): any {

		return {
			attr_catalogName: catalogReference.catalogName,
			attr_entryName: catalogReference.entryName,
		};

	}

	writeRoadNetwork ( xml: any, roadNetwork: RoadNetwork ) {

		xml.RoadNetwork = {
			Logics: null,
			SceneGraph: null,
		};

		if ( roadNetwork.logics != null ) {
			xml.RoadNetwork.Logics = this.writeFile( roadNetwork.logics );
		}

		if ( roadNetwork.sceneGraph != null ) {
			xml.RoadNetwork.SceneGraph = this.writeFile( roadNetwork.sceneGraph );
		}

	}

	writeFile ( file: File ) {

		return {
			attr_filepath: file.filepath
		};

	}

	writeStoryboard ( xml: any, storyboard: Storyboard ) {

		const storyXml = {

			Init: {
				Actions: {
					Private: []
				},
			},

			Story: [],

			EndConditions: {}
		};


		xml.Storyboard = storyXml;

		this.writeInitActions( storyXml.Init.Actions );

		storyboard.stories.forEach( story => {

			storyXml.Story.push( this.writeStory( story ) );

		} );

		storyboard.endConditionGroups.forEach( conditionGroup => {

			Debug.log( this.writeConditionGroup( conditionGroup ) );

		} );

	}

	writeConditionGroup ( conditionGroup: ConditionGroup ): any {

		let xml = {
			Condition: []
		};

		conditionGroup.conditions.forEach( condition => {

			xml.Condition.push( this.writeCondition( condition ) );

		} );

		return xml;
	}

	writeCondition ( condition: Condition ): any {

		let xml = {

			attr_name: condition.name,
			attr_delay: condition.delay,
			attr_edge: condition.edge,

		};

		if ( condition.category == ConditionCategory.ByEntity ) {

			xml[ 'ByEntity' ] = this.writeByEntityCondition( condition as EntityCondition );

		} else if ( condition.category == ConditionCategory.ByValue ) {

			xml[ 'ByValue' ] = this.writeByValueCondition( condition );

		} else if ( condition.category == ConditionCategory.ByState ) {

			xml[ 'ByState' ] = this.writeByStateCondition( condition );

		}

		return xml;
	}

	writeByStateCondition ( abstractCondition: Condition ): any {

		let xml = {};

		// TODO : Write test for this in production for constructor error
		if ( abstractCondition.conditionType === ConditionType.ByState_AtStart ) {

			xml[ 'AtStart' ] = {};

			let condition = abstractCondition as AtStartCondition;

			xml[ 'AtStart' ][ 'attr_type' ] = condition.type;
			xml[ 'AtStart' ][ 'attr_name' ] = condition.elementName;

		}

		return xml;
	}

	writeByValueCondition ( abstractCondition: Condition ): any {

		let xml = {};

		// TODO : Write test for this in production for construtor error
		if ( abstractCondition.conditionType === ConditionType.ByValue_SimulationTime ) {

			xml[ 'SimulationTime' ] = {};

			let condition = abstractCondition as SimulationTimeCondition;

			xml[ 'SimulationTime' ][ 'attr_value' ] = condition.value;
			xml[ 'SimulationTime' ][ 'attr_rule' ] = condition.rule;

		}

		return xml;
	}

	writeByEntityCondition ( abstractCondition: EntityCondition ): any {

		let xml = {

			TriggeringEntities: {
				attr_rule: abstractCondition.triggeringRule,
				Entity: []
			},

			EntityCondition: {}

		};

		abstractCondition.triggeringEntities.forEach( entityName => {

			xml.TriggeringEntities.Entity.push( {
				attr_name: entityName
			} );

		} );

		// TODO : Write test for this in production for constructor
		if ( abstractCondition.conditionType === ConditionType.ByEntity_Distance ) {

			xml.EntityCondition[ 'Distance' ] = this.writeDistanceCondition( abstractCondition as DistanceCondition );

		}

		return xml;
	}

	writeDistanceCondition ( condition: DistanceCondition ): any {

		return {

			attr_value: condition.value,
			attr_freespace: condition.freespace,
			attr_alongRoute: condition.alongRoute,
			attr_rule: condition.rule,

			Position: this.writePosition( condition.position )

		};

	}

	writeStory ( story: Story ): any {

		let xml = {

			attr_name: story.name,
			attr_owner: story.ownerName,

			Act: [],

		};

		story.acts.forEach( act => {

			xml.Act.push( this.writeAct( act ) );

		} );

		return xml;
	}

	writeAct ( act: Act ): any {

		let xml = {

			attr_name: act.name,

			Sequence: [],

			Conditions: {
				Start: {
					ConditionGroup: []
				}
			}
		};

		act.sequences.forEach( sequence => {

			xml.Sequence.push( this.writeSequence( sequence ) );

		} );

		act.startConditionGroups.forEach( conditionGroup => {

			xml.Conditions.Start.ConditionGroup.push( this.writeConditionGroup( conditionGroup ) );

		} );

		// TODO: Cancel & End Conditions

		return xml;
	}

	writeSequence ( sequence: Sequence ): any {

		let xml = {

			attr_name: sequence.name,
			attr_numberOfExecutions: sequence.numberOfExecutions,

			Actors: {
				Entity: []
			},
			Maneuver: []

		};

		sequence.actors.forEach( name => {

			xml.Actors.Entity.push( {
				attr_name: name
			} );

		} );

		sequence.maneuvers.forEach( maneuver => {

			xml.Maneuver.push( this.writeManeuver( maneuver ) );

		} );

		return xml;
	}

	writeManeuver ( maneuver: Maneuver ): any {

		let xml = {

			attr_name: maneuver.name,

			Event: []

		};

		maneuver.events.forEach( event => {

			xml.Event.push( this.writeEvent( event ) );

		} );

		return xml;
	}

	writeEvent ( event: TvEvent ): any {

		let xml = {

			attr_name: event.name,
			attr_priority: event.priority,

			Action: [],

			StartConditions: {
				ConditionGroup: []
			},
		};

		event.getActionMap().forEach( ( action, name ) => {

			let actionXml =
				{
					attr_name: name
				};

			if ( action.category == ActionCategory.private ) {

				actionXml[ 'Private' ] = this.writePrivateAction( action as PrivateAction );

			}

			xml.Action.push( actionXml );

		} );

		event.startConditionGroups.forEach( conditionGroup => {

			xml.StartConditions.ConditionGroup.push( this.writeConditionGroup( conditionGroup ) );

		} );

		return xml;
	}

	writeInitActions ( xml: any ) {

		this.openScenario.objects.forEach( object => {

			const privateXml = {

				attr_object: object.name,

				Action: []

			};

			xml.Private.push( privateXml );

			object.initActions.forEach( initAction => {

				privateXml.Action.push( this.writePrivateAction( initAction ) );

			} );

		} );

	}

	writePrivateAction ( abstractAction: PrivateAction ) {

		let xml = null;

		switch ( abstractAction.actionType ) {

			case ActionType.Private_Position:
				xml = this.writePositionAction( abstractAction as PositionAction );
				break;

			case ActionType.Private_Longitudinal_Speed:
				xml = this.writeLongitudinalSpeedAction( abstractAction as SpeedAction );
				break;

			case ActionType.Private_LaneChange:
				xml = this.writeLaneChangeAction( abstractAction as LaneChangeAction );
				break;

			case ActionType.Private_Routing:
				xml = this.writeFollowTrajectoryAction( abstractAction as FollowTrajectoryAction );
				break;

			default:
				throw new Error( 'Unsupported private action' );
				break;
		}

		return xml;

	}

	writeFollowTrajectoryAction ( action: FollowTrajectoryAction ): any {

		let xml = {
			Routing: {
				FollowTrajectory: {
					Lateral: {
						attr_purpose: action.lateralPurpose
					},
					Longitudinal: {},
					Trajectory: {}
				}
			}
		};

		if ( action.longitudinalPurpose && action.longitudinalPurpose.timing != null ) {

			const timing = action.longitudinalPurpose.timing;

			xml.Routing.FollowTrajectory.Longitudinal = {
				Timing: {
					attr_domain: timing.domain,
					attr_scale: timing.scale,
					attr_offset: timing.offset
				}
			};

		} else {

			xml.Routing.FollowTrajectory.Longitudinal = {
				None: {}
			};

		}

		if ( action.catalogReference != null ) {

			throw new Error( 'Unsupported action' );

		} else {

			const trajectory = this.writeTrajectory( action.trajectory );

			xml.Routing.FollowTrajectory.Trajectory = trajectory.Trajectory;

		}

		return xml;
	}

	writeLongitudinalSpeedAction ( action: SpeedAction ): any {

		return {
			Longitudinal: {
				Speed: {
					Dynamics: this.writeTransitionDynamics( action.dynamics ),
					Target: this.writeTarget( action.target )
				}
			}
		};

	}

	writeLaneChangeAction ( action: LaneChangeAction ): any {

		return {

			Lateral: {

				LaneChange: {

					// TODO: dont add this when value is null
					attr_targetLaneOffset: action.targetLaneOffset ? action.targetLaneOffset : 0,

					Dynamics: this.writeTransitionDynamics( action.dynamics ),

					Target: this.writeTarget( action.target )
				}
			}

		};

	}

	writeTarget ( abstractTarget: AbstractTarget ) {

		if ( abstractTarget.targetType == TargetType.absolute ) {

			let target = abstractTarget as AbsoluteTarget;

			return {
				Absolute: {
					attr_value: target.value
				}
			};

		} else if ( abstractTarget.targetType == TargetType.relative ) {

			let target = abstractTarget as RelativeTarget;

			return {
				Relative: {
					attr_object: target.entityName,
					attr_value: target.value
				}
			};

		}

	}

	writeTransitionDynamics ( dynamics: TransitionDynamics ) {

		return {
			Dynamics: {
				attr_dynamicsShape: dynamics.dynamicsShape,
				attr_value: dynamics.value,
				attr_dynamicsDimension: dynamics.dynamicsDimension
			}
		};


	}

	writePositionAction ( action: PositionAction ) {

		return {
			Position: this.writePosition( action.position )
		};

	}

	writePosition ( position: AbstractPosition ): any {

		let xml = null;

		switch ( position.type ) {

			case PositionType.World:
				xml = this.writeWorldPosition( position as WorldPosition );
				break;

			case PositionType.RelativeObject:
				xml = this.writeRelativeObjectPosition( position as RelativeObjectPosition );
				break;

			case PositionType.RelativeLane:
				xml = this.writeRelativeLanePosition( position as RelativeLanePosition );
				break;

			case PositionType.Lane:
				xml = this.writeLanePosition( position as LanePosition );
				break;

			default:
				throw new Error( 'Unsupported position action' );
				break;
		}

		return xml;
	}

	writeRelativeLanePosition ( position: RelativeLanePosition ): any {

		let xml = {
			RelativeLane: {
				attr_object: position.object,
				attr_dLane: position.dLane,
				attr_ds: position.ds,
				attr_offset: position.offset ? position.offset : 0,
			}
		};

		position.orientations.forEach( orientation => {

			xml.RelativeLane[ 'Orientation' ] = this.writeOrientation( orientation );

		} );

		return xml;
	}

	writeOrientation ( orientation: Orientation ) {

		return {

			attr_h: orientation.h,
			attr_p: orientation.p ? orientation.p : 0,
			attr_r: orientation.r ? orientation.r : 0,

			attr_type: orientation.type
		};

	}

	writeWorldPosition ( position: WorldPosition ) {

		const x = position.vector3 ? position.vector3.x : position.x;
		const y = position.vector3 ? position.vector3.y : position.y;
		const z = position.vector3 ? position.vector3.z : position.y;

		return {

			World: {

				attr_x: x,
				attr_y: y,
				attr_z: z,

				attr_h: position.m_H ? position.m_H : 0,
				attr_p: position.m_P ? position.m_P : 0,
				attr_r: position.m_R ? position.m_R : 0,

			}
		};

	}

	writeRelativeObjectPosition ( position: RelativeObjectPosition ) {

		let xml = {
			RelativeObject: {
				attr_object: position.object,
				attr_dx: position.dx,
				attr_dy: position.dy,
				attr_dz: position.dz ? position.dz : 0,
			}
		};

		position.orientations.forEach( orientation => {
			xml.RelativeObject[ 'Orientation' ] = this.writeOrientation( orientation );
		} );

		return xml;
	}

	writeCatalogs ( rootNode: any, catalogs: Catalogs ) {

		return undefined;

	}

	writeParameterDeclaration ( parameterDeclaration: ParameterDeclaration ) {

		let xml = {
			Parameter: []
		};

		parameterDeclaration.parameters.forEach( ( parameter: Parameter ) => {

			xml.Parameter.push( {
				attr_name: parameter.name,
				attr_value: parameter.value,
				attr_type: parameter.type,
			} );

		} );

		return xml;

	}

	writeLanePosition ( position: LanePosition ) {


		let xml = {
			Lane: {
				attr_roadId: position.roadId,
				attr_laneId: position.laneId,
				attr_s: position.sCoordinate,
				attr_offset: position.offset ? position.offset : 0,
			}
		};


		return xml;
	}

	writeTrajectory ( trajectory: Trajectory ) {

		const xml = {
			Trajectory: {
				attr_name: trajectory.name,
				attr_domain: trajectory.domain,
				attr_closed: trajectory.closed,
				ParameterDeclaration: [],
				Vertex: []
			}
		};

		trajectory.parameterDeclaration.forEach( item => {

			xml.Trajectory.ParameterDeclaration.push( item );

		} );

		trajectory.vertices.forEach( item => {

			xml.Trajectory.Vertex.push( this.writeVertex( item ) );

		} );

		return xml;
	}

	writeVertex ( vertex: Vertex ) {

		const xml = {
			attr_reference: vertex.reference,
			Position: this.writePosition( vertex.position ),
			Shape: this.writeShape( vertex.shape )
		};

		return xml;
	}

	writeShape ( shape: AbstractShape ) {


		// TODO : Test this against production
		if ( shape instanceof PolylineShape ) {

			return this.writePolyline( shape );

		} else if ( shape instanceof ClothoidShape ) {

			return this.writeClothoid( shape as ClothoidShape );

		} else if ( shape instanceof SplineShape ) {

			return this.writeSpline( shape as SplineShape );

		} else {

			throw new Error( 'Unknown shape' );

		}
	}

	writePolyline ( shape: PolylineShape ) {
		return {
			Polyline: {}
		};
	}

	writeClothoid ( shape: ClothoidShape ) {
		return {
			Clothoid: {
				attr_curvature: shape.curvature,
				attr_curvatureDot: shape.curvatureDot,
				attr_length: shape.length
			}
		};
	}

	writeSpline ( shape: SplineShape ) {
		return {
			Spline: {
				ControlPoint1: {
					attr_status: shape.controlPoint1.status
				},
				ControlPoint2: {
					attr_status: shape.controlPoint2.status
				}
			}
		};
	}

}
