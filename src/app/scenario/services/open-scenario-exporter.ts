/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { Log } from 'app/core/utils/log';
import { XMLBuilder } from 'fast-xml-parser';
import { DefaultVehicleController } from '../controllers/default-vehicle-controller';
import { AbstractController } from '../models/abstract-controller';
import { Target } from '../models/actions/target';
import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { FollowTrajectoryAction } from '../models/actions/tv-follow-trajectory-action';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { LaneOffsetAction } from '../models/actions/tv-lane-offset-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { AcquirePositionAction, FollowRouteAction } from '../models/actions/tv-routing-action';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { TeleportAction } from '../models/actions/tv-teleport-action';
import { EntityCondition } from '../models/conditions/entity-condition';
import { AccelerationCondition } from '../models/conditions/tv-acceleration-condition';
import { StoryboardElementStateCondition } from '../models/conditions/tv-after-termination-condition';
import { AtStartCondition } from '../models/conditions/tv-at-start-condition';
import { CollisionCondition } from '../models/conditions/tv-collision-condition';
import { Condition } from '../models/conditions/tv-condition';
import { ConditionGroup } from '../models/conditions/tv-condition-group';
import { DistanceCondition } from '../models/conditions/tv-distance-condition';
import { EndOfRoadCondition } from '../models/conditions/tv-end-of-road-condition';
import { OffRoadCondition } from '../models/conditions/tv-off-road-condition';
import { RelativeDistanceCondition } from '../models/conditions/tv-relative-distance-condition';
import { RelativeSpeedCondition } from '../models/conditions/tv-relative-speed-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { SpeedCondition } from '../models/conditions/tv-speed-condition';
import { StandStillCondition } from '../models/conditions/tv-stand-still-condition';
import { TimeHeadwayCondition } from '../models/conditions/tv-time-headway-condition';
import { TimeToCollisionCondition } from '../models/conditions/tv-time-to-collision-condition';
import { TraveledDistanceCondition } from '../models/conditions/tv-traveled-distance-condition';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { VehicleEntity } from '../models/entities/vehicle-entity';
import { Position } from '../models/position';
import { RelativeRoadPosition } from '../models/positions/relative-road.position';
import { LanePosition } from '../models/positions/tv-lane-position';
import { RelativeLanePosition } from '../models/positions/tv-relative-lane-position';
import { RelativeObjectPosition } from '../models/positions/tv-relative-object-position';
import { RelativeWorldPosition } from '../models/positions/tv-relative-world-position';
import { RoadPosition } from '../models/positions/tv-road-position';
import { WorldPosition } from '../models/positions/tv-world-position';
import { PrivateAction } from '../models/private-action';
import { Act } from '../models/tv-act';
import { TvAxle } from '../models/tv-bounding-box';
import { CatalogReference, Catalogs } from '../models/tv-catalogs';
import { File } from '../models/tv-common';
import {
	ActionCategory,
	ActionType,
	ConditionCategory,
	ConditionType,
	OpenScenarioVersion,
	PositionType,
	TargetType
} from '../models/tv-enums';
import { TvEvent } from '../models/tv-event';
import { CatalogReferenceController } from '../models/tv-interfaces';
import { Maneuver } from '../models/tv-maneuver';
import { Orientation } from '../models/tv-orientation';
import { ParameterDeclaration } from '../models/tv-parameter-declaration';
import { TvProperty } from '../models/tv-properties';
import { RoadNetwork } from '../models/tv-road-network';
import { TvScenario } from '../models/tv-scenario';
import { ManeuverGroup } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { Storyboard } from '../models/tv-storyboard';
import { AbstractShape, ClothoidShape, PolylineShape, SplineShape, Trajectory, Vertex } from '../models/tv-trajectory';
import { XmlElement } from "../../importers/xml.element";

@Injectable( {
	providedIn: 'root'
} )

export class OpenScenarioExporter {

	private xmlDocument: Object;
	private openScenario: TvScenario;

	get version (): OpenScenarioVersion {
		return this.openScenario.fileHeader.version;
	}

	get entityKey (): string {
		return this.version == OpenScenarioVersion.v0_9 ? 'attr_object' : 'attr_entityRef';
	}

	getOutputString ( openScenario: TvScenario ): any {

		this.openScenario = openScenario;

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			ignoreAttributes: false,
			suppressBooleanAttributes: false,
			suppressEmptyNode: true,
			suppressUnpairedNode: true,
			format: true,
			trimValues: true,
		};

		const builder = new XMLBuilder( defaultOptions );

		Log.info( this.openScenario );

		// this makes the osc object
		this.writeOpenScenario();

		// this makes the osc xml file
		return builder.build( this.xmlDocument );
	}

	writeOpenScenario (): any {

		const rootNode = {
			FileHeader: this.openScenario.fileHeader.exportXml(),
			ParameterDeclarations: {
				ParameterDeclaration: this.writeParameterDeclarations( this.openScenario.parameterDeclarations )
			},
			RoadNetwork: null,
			Entities: null,
			Storyboard: null
		};

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			rootNode[ 'Catalogs' ] = this.writeCatalogs( rootNode, this.openScenario.catalogs );
		} else {
			rootNode[ 'CatalogLocations' ] = this.writeCatalogs( rootNode, this.openScenario.catalogs );
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

	writeEntities ( rootNode: any, objects: Map<string, ScenarioEntity> ): XmlElement {

		const scenarioObjects = [];

		objects.forEach( ( item, key ) => {
			scenarioObjects.push( this.writeScenarioObject( key, item ) );
		} );

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return rootNode.Entities = {
				Object: scenarioObjects
			};

		} else {

			return rootNode.Entities = {
				ScenarioObject: scenarioObjects
			};
		}
	}

	writeScenarioObject ( key: string, object: ScenarioEntity ): XmlElement {

		const scenarioObject: XmlElement = {
			attr_name: object.name,
			Vehicle: this.writeVehicle( object as VehicleEntity ),
			ObjectController: {
				Controller: {
					attr_name: 'DefaultController',
				},
			},
		};

		if ( this.version == OpenScenarioVersion.v0_9 && object.model3d != null && object.model3d != 'default' ) {

			scenarioObject.attr_model = object.model3d;

		} else if ( object.model3d != null && object.model3d != 'default' ) {

			scenarioObject.attr_model3d = object.model3d;

		}

		return scenarioObject;
	}

	writeVehicle ( vehicle: VehicleEntity ): any {

		function writeAxle ( axle: TvAxle ): any {
			return {
				attr_maxSteering: axle.maxSteering,
				attr_wheelDiameter: axle.wheelDiameter,
				attr_trackWidth: axle.trackWidth,
				attr_positionX: axle.positionX,
				attr_positionZ: axle.positionZ,
			};
		}

		return {
			attr_name: vehicle.name,
			attr_vehicleCategory: vehicle.vehicleCategory,
			ParameterDeclarations: {
				ParameterDeclaration: this.writeParameterDeclarations( vehicle.parameterDeclarations )
			},
			Performance: {
				attr_maxSpeed: vehicle.performance.maxSpeed,
				attr_maxAcceleration: vehicle.performance.maxAcceleration,
				attr_maxDeceleration: vehicle.performance.maxDeceleration,
				attr_mass: vehicle.performance.mass ?? null,
			},
			BoundingBox: {
				Center: {
					attr_x: vehicle.boundingBox.center.x,
					attr_y: vehicle.boundingBox.center.y,
					attr_z: vehicle.boundingBox.center.z
				},
				Dimensions: {
					attr_width: vehicle.boundingBox.dimension.width,
					attr_length: vehicle.boundingBox.dimension.length,
					attr_height: vehicle.boundingBox.dimension.height,
				},
			},
			Axles: {
				FrontAxle: vehicle.axles ? writeAxle( vehicle.axles.front ) : null,
				RearAxle: vehicle.axles ? writeAxle( vehicle.axles.rear ) : null,
				Additional: vehicle.axles?.additional?.map( axle => writeAxle( axle ) )
			},
			Properties: {
				Property: vehicle.properties.map( property => this.writeProperty( property ) )
			},
		};
	}

	writeProperty ( property: TvProperty ): XmlElement {
		return {
			attr_name: property.name,
			attr_value: property.value,
		};
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

			TvConsole.warn( 'Unsupported controller entry' );

		}

		return xml;

	}

	writeCatalogReference ( catalogReference: CatalogReference ): any {

		return {
			attr_catalogName: catalogReference.catalogName,
			attr_entryName: catalogReference.entryName,
		};

	}

	writeRoadNetwork ( xml: XmlElement, roadNetwork: RoadNetwork ): void {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			xml.RoadNetwork = {
				Logics: null
			};

			if ( roadNetwork.logics != null ) {
				xml.RoadNetwork.Logics = this.writeFile( roadNetwork.logics );
			}

			if ( roadNetwork.sceneGraph != null ) {
				xml.RoadNetwork[ 'SceneGraph' ] = this.writeFile( roadNetwork.sceneGraph );
			}

		} else {

			xml.RoadNetwork = {
				LogicFile: null
			};

			if ( roadNetwork.logics != null ) {
				xml.RoadNetwork.LogicFile = this.writeFile( roadNetwork.logics );
			}

			if ( roadNetwork.sceneGraph != null ) {
				xml.RoadNetwork[ 'SceneGraphFile' ] = this.writeFile( roadNetwork.sceneGraph );
			}

			// TODO: export traffic signals

		}

	}

	writeFile ( file: File ): any {

		return {
			attr_filepath: file.filepath
		};

	}

	writeStoryboard ( xml: any, storyboard: Storyboard ): void {

		const key = this.version == OpenScenarioVersion.v0_9 ? 'EndConditions' : 'StopTrigger';

		const storyXml = {

			Init: {
				Actions: {
					Private: [],
					GlobalAction: [], // TODO
					UserDefinedAction: [], //
				},
			},

			Story: Array.from( storyboard.stories.values() ).map( story => this.writeStory( story ) ),

			[ key ]: storyboard.endConditionGroups.map( conditionGroup => this.writeConditionGroup( conditionGroup ) )
		};


		xml.Storyboard = storyXml;

		this.writeInitActions( storyXml.Init.Actions );

	}

	writeConditionGroup ( conditionGroup: ConditionGroup ): XmlElement {
		return {
			ConditionGroup: {
				Condition: conditionGroup.conditions.map( condition => this.writeCondition( condition ) )
			}
		};
	}

	writeCondition ( condition: Condition ): XmlElement {

		let xml = {

			attr_name: condition.label,
			attr_delay: condition.delay,

		};

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			xml[ 'attr_edge' ] = condition.edge;
		} else {
			xml[ 'attr_conditionEdge' ] = condition.edge;
		}

		if ( condition.category == ConditionCategory.ByEntity ) {

			if ( this.version == OpenScenarioVersion.v0_9 ) {

				xml[ 'ByEntity' ] = this.writeByEntityCondition( condition as EntityCondition );

			} else {

				xml[ 'ByEntityCondition' ] = this.writeByEntityCondition( condition as EntityCondition );

			}

		} else if ( condition.category == ConditionCategory.ByValue ) {

			if ( this.version == OpenScenarioVersion.v0_9 ) {

				xml[ 'ByValue' ] = this.writeByValueCondition( condition );

			} else {

				xml[ 'ByValueCondition' ] = this.writeByValueCondition( condition );

			}

		} else if ( condition.category == ConditionCategory.ByState ) {

			if ( this.version == OpenScenarioVersion.v0_9 ) {

				xml[ 'ByState' ] = this.writeByStateCondition( condition );

			} else {

				xml[ 'ByStateCondition' ] = this.writeByStateCondition( condition );
			}

		}

		return xml;
	}

	writeByStateCondition ( abstractCondition: Condition ): XmlElement {

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

	writeByValueCondition ( abstractCondition: Condition ): XmlElement {

		if ( abstractCondition.conditionType === ConditionType.ByValue_SimulationTime ) {

			return this.writeSimulationTimeCondition( abstractCondition as SimulationTimeCondition );

		} else if ( abstractCondition.conditionType === ConditionType.StoryboardElementState ) {

			return this.writeStoryboardElementStateCondition( abstractCondition as StoryboardElementStateCondition );

		} else {

			TvConsole.error( 'Unsupported ByValueCondition' + abstractCondition.label );

		}

	}

	writeStoryboardElementStateCondition ( condition: StoryboardElementStateCondition ): XmlElement {

		const key = this.version == OpenScenarioVersion.v0_9 ?
			'StoryboardElementState' :
			'StoryboardElementStateCondition';

		return {
			[ key ]: {
				attr_storyboardElementType: condition.storyboardElementType,
				attr_storyboardElementRef: condition.storyboardElementRef,
				attr_state: condition.stateAsString,
			}
		};
	}

	writeSimulationTimeCondition ( condition: SimulationTimeCondition ): XmlElement {

		const key = this.version == OpenScenarioVersion.v0_9 ?
			'SimulationTime' :
			'SimulationTimeCondition';

		return {
			[ key ]: {
				attr_value: condition.value,
				attr_rule: condition.rule
			}
		};
	}

	writeByEntityCondition ( condition: EntityCondition ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			return {
				TriggeringEntities: {
					attr_rule: condition.triggeringRule,
					Entity: condition.triggeringEntities.map( entityName => ( {
						attr_name: entityName
					} ) )
				},
				EntityCondition: this.writeEntityCondition( condition )
			};
		}

		return {
			TriggeringEntities: {
				attr_triggeringEntitiesRule: condition.triggeringRule,
				EntityRef: condition.triggeringEntities.map( entityName => ( {
					attr_entityRef: entityName
				} ) )
			},
			EntityCondition: this.writeEntityCondition( condition )
		};
	}

	writeEntityCondition ( condition: EntityCondition ): any {

		let conditionXml = {};

		if ( condition.conditionType === ConditionType.ByEntity_EndOfRoad ) {

			conditionXml = {
				EndOfRoadCondition: this.writeEndOfRoadCondition( condition as EndOfRoadCondition )
			};

		} else if ( condition.conditionType === ConditionType.ByEntity_Collision ) {

			conditionXml = {
				CollisionCondition: this.writeCollisionCondition( condition as CollisionCondition )
			};

		} else if ( condition.conditionType === ConditionType.ByEntity_Distance ) {

			conditionXml = {
				DistanceCondition: this.writeDistanceCondition( condition as DistanceCondition )
			};

		} else if ( condition.conditionType === ConditionType.ByEntity_ReachPosition ) {

			conditionXml = {
				ReachPositionCondition: this.writeDistanceCondition( condition as DistanceCondition )
			};

		} else if ( condition.conditionType === ConditionType.ByEntity_TraveledDistance ) {

			conditionXml = {
				TraveledDistanceCondition: this.writeTraveledDistanceCondition( condition as TraveledDistanceCondition )
			};

		} else if ( condition.conditionType === ConditionType.ByEntity_RelativeDistance ) {

			conditionXml = {
				RelativeDistanceCondition: this.writeRelativeDistanceCondition( condition as RelativeDistanceCondition )
			};

		} else if ( condition.conditionType == ConditionType.ByEntity_Offroad ) {

			conditionXml = {
				OffRoadCondition: this.writeOffRoadCondition( condition as OffRoadCondition )
			};

		} else if ( condition.conditionType == ConditionType.ByEntity_RelativeSpeed ) {

			conditionXml = {
				RelativeSpeedCondition: this.writeRelativeSpeedCondition( condition as RelativeSpeedCondition )
			};

		} else if ( condition.conditionType == ConditionType.ByEntity_Speed ) {

			conditionXml = {
				SpeedCondition: this.writeSpeedCondition( condition as SpeedCondition )
			};

		} else if ( condition.conditionType == ConditionType.ByEntity_StandStill ) {

			conditionXml = {
				StandStillCondition: this.writeStandStillCondition( condition as StandStillCondition )
			};

		} else if ( condition.conditionType == ConditionType.ByEntity_Acceleration ) {

			conditionXml = {
				AccelerationCondition: this.writeAccelerationCondition( condition as AccelerationCondition )
			};

		} else if ( condition.conditionType == ConditionType.ByEntity_TimeHeadway ) {

			conditionXml = {
				TimeHeadwayCondition: this.writeTimeHeadwayCondition( condition as TimeHeadwayCondition )
			};

		} else if ( condition.conditionType == ConditionType.ByEntity_TimeToCollision ) {

			conditionXml = {
				TimeToCollisionCondition: this.writeTimeToCollisionCondition( condition as TimeToCollisionCondition )
			};

		} else {

			TvConsole.error( 'Unsupported condition type' );

		}

		return conditionXml;

	}

	writeTimeToCollisionCondition ( condition: TimeToCollisionCondition ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			return {
				attr_value: condition.value,
				attr_freespace: condition.freespace,
				attr_alongRoute: condition.alongRoute,
				attr_rule: condition.rule,
				Target: this.writeTimeToCollisionTarget( condition.target )
			};
		}

		if ( this.version == OpenScenarioVersion.v1_0 || this.version == OpenScenarioVersion.v1_1 ) {
			return {
				attr_value: condition.value,
				attr_freespace: condition.freespace,
				attr_alongRoute: condition.alongRoute,
				attr_rule: condition.rule,
				TimeToCollisionConditionTarget: this.writeTimeToCollisionTarget( condition.target )
			};
		}

		if ( this.version == OpenScenarioVersion.v1_2 ) {
			return {
				attr_value: condition.value,
				attr_freespace: condition.freespace,
				attr_alongRoute: condition.alongRoute,		// @deprecated
				attr_rule: condition.rule,
				attr_relativeDistanceType: condition.relativeDistanceType,
				attr_coordinateSystem: condition.coordinateSystem,
				attr_routingAlgorithm: condition.routingAlgorithm,
				TimeToCollisionConditionTarget: this.writeTimeToCollisionTarget( condition.target ),
			};
		}

	}

	writeTimeToCollisionTarget ( target: string | Position ): XmlElement {

		if ( typeof target == 'string' && this.version == OpenScenarioVersion.v0_9 ) {

			return {
				Entity: {
					attr_name: target
				}
			};

		} else if ( typeof target == 'string' && this.version != OpenScenarioVersion.v0_9 ) {

			return {
				EntityRef: {
					attr_entityRef: target
				}
			};

		} else if ( target instanceof Position ) {

			return {
				Position: this.writePosition( target )
			};

		}
	}

	writeTimeHeadwayCondition ( condition: TimeHeadwayCondition ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			return {
				attr_entity: condition.entityRef,
				attr_value: condition.value,
				attr_freespace: condition.freespace,
				attr_alongRoute: condition.alongRoute,
				attr_rule: condition.rule,
			};
		}

		if ( this.version == OpenScenarioVersion.v1_0 || this.version == OpenScenarioVersion.v1_1 ) {
			return {
				attr_entityRef: condition.entityRef,
				attr_value: condition.value,
				attr_freespace: condition.freespace,
				attr_alongRoute: condition.alongRoute,
				attr_rule: condition.rule,
			};
		}

		if ( this.version == OpenScenarioVersion.v1_2 ) {
			return {
				attr_entityRef: condition.entityRef,
				attr_value: condition.value,
				attr_freespace: condition.freespace,
				attr_alongRoute: condition.alongRoute,		// @deprecated
				attr_rule: condition.rule,
				attr_coordinateSystem: condition.coordinateSystem,
				attr_relativeDistanceType: condition.relativeDistanceType,
				attr_routingAlgorithm: condition.routingAlgorithm,
			};
		}
	}

	writeAccelerationCondition ( condition: AccelerationCondition ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			return {
				attr_value: condition.value,
				attr_rule: condition.rule,
			};
		}

		return {
			attr_value: condition.value,
			attr_rule: condition.rule,
			attr_direction: condition.direction,
		};

	}

	writeStandStillCondition ( condition: StandStillCondition ): any {

		return {
			attr_duration: condition.duration,
		};

	}

	writeSpeedCondition ( condition: SpeedCondition ): any {

		return {
			attr_value: condition.value,
			attr_rule: condition.rule,
		};

	}

	writeRelativeSpeedCondition ( condition: RelativeSpeedCondition ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				attr_entity: condition.entity,
				attr_value: condition.speed,
				attr_rule: condition.rule,
			};

		}

		if ( this.version == OpenScenarioVersion.v1_0 || this.version == OpenScenarioVersion.v1_1 ) {

			return {
				attr_entityRef: condition.entity,
				attr_value: condition.speed,
				attr_rule: condition.rule,
			};

		}

		if ( this.version == OpenScenarioVersion.v1_2 ) {

			return {
				attr_entityRef: condition.entity,
				attr_value: condition.speed,
				attr_rule: condition.rule,
				attr_direction: condition.direction
			};

		}

		TvConsole.error( 'Unsupported relative speed condition' );
	}

	writeOffRoadCondition ( condition: OffRoadCondition ): XmlElement {

		return {
			attr_duration: condition.duration,
		};

	}

	writeCollisionCondition ( condition: CollisionCondition ): XmlElement {

		if ( condition.entityRef && this.version == OpenScenarioVersion.v0_9 ) {
			return {
				ByEntity: {
					attr_name: condition.entityRef,
				}
			};
		}

		if ( condition.entityRef && this.version != OpenScenarioVersion.v0_9 ) {
			return {
				EntityRef: {
					attr_entityRef: condition.entityRef,
				}
			};
		}

		if ( condition.entityType ) {
			return {
				ByType: {
					attr_type: condition.entityType,
				}
			};
		}

		TvConsole.error( 'Unsupported collision condition' );
	}

	writeTraveledDistanceCondition ( condition: TraveledDistanceCondition ): XmlElement {

		return {
			attr_value: condition.value,
		};

	}

	writeEndOfRoadCondition ( condition: EndOfRoadCondition ): XmlElement {

		return {
			attr_duration: condition.duration,
		};

	}

	writeRelativeDistanceCondition ( condition: RelativeDistanceCondition ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				attr_entity: condition.entityRef,
				attr_freespace: condition.freespace,
				attr_rule: condition.rule,
				attr_value: condition.distance,
				attr_relativeDistanceType: condition.distanceType,
			};

		}

		return {
			attr_entityRef: condition.entityRef,
			attr_freespace: condition.freespace,
			attr_relativeDistanceType: condition.distanceType,
			attr_rule: condition.rule,
			attr_value: condition.distance,
			attr_coordinateSystem: condition.coordinateSystem,
			attr_routingAlgorithm: condition.routingAlgorithm,
		};

	}

	writeDistanceCondition ( condition: DistanceCondition ): XmlElement {

		return {
			attr_value: condition.value,
			attr_freespace: condition.freespace,
			attr_alongRoute: condition.alongRoute,
			attr_rule: condition.rule,
			Position: this.writePosition( condition.position )
		};

	}

	writeStory ( story: Story ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			return {
				attr_name: story.name,
				attr_owner: story.ownerName,
				ParameterDeclarations: {
					ParameterDeclaration: this.writeParameterDeclarations( story.parameterDeclarations )
				},
				Act: story.acts.map( act => this.writeAct( act ) ),
			};
		}

		return {
			attr_name: story.name,
			ParameterDeclarations: {
				ParameterDeclaration: this.writeParameterDeclarations( story.parameterDeclarations )
			},
			Act: story.acts.map( act => this.writeAct( act ) ),
		};
	}

	writeAct ( act: Act ): any {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				attr_name: act.name,
				Sequence: act.maneueverGroups.map( i => this.writeManeuverGroup( i ) ),
				Conditions: {
					Start: act.startConditionGroups.map( i => this.writeConditionGroup( i ) ),
					End: act.endConditionGroups.map( i => this.writeConditionGroup( i ) ),
					Cancel: act.cancelConditionGroups.map( i => this.writeConditionGroup( i ) ),
				}
			};

		}

		return {
			attr_name: act.name,
			ManeuverGroup: act.maneueverGroups.map( i => this.writeManeuverGroup( i ) ),
			StartTrigger: act.startConditionGroups.map( i => this.writeConditionGroup( i ) ),
			StopTrigger: act.endConditionGroups.map( i => this.writeConditionGroup( i ) ),
		};
	}

	writeManeuverGroup ( group: ManeuverGroup ): any {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				attr_name: group.name,
				attr_numberOfExecutions: group.numberOfExecutions,
				Actors: {
					Entity: group.actors.map( entityName => ( { attr_name: entityName } ) )
				},
				Maneuver: group.maneuvers.map( maneuver => this.writeManeuver( maneuver ) ),
			};

		}

		return {
			attr_name: group.name,
			attr_maximumExecutionCount: group.numberOfExecutions,
			Actors: {
				attr_selectTriggeringEntities: group.selectTriggeringEntities,
				EntityRef: group.actors.map( entityName => ( { attr_entityRef: entityName } ) )
			},
			Maneuver: group.maneuvers.map( maneuver => this.writeManeuver( maneuver ) ),
		};
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

		const conditionKey = this.version == OpenScenarioVersion.v0_9 ?
			'StartConditions' :
			'StartTrigger';

		let xml = {

			attr_name: event.name,
			attr_priority: event.priority,

			Action: [],

			[ conditionKey ]: event.startConditionGroups.map( i => this.writeConditionGroup( i ) )
		};

		event.getActionMap().forEach( ( action, name ) => {

			let actionXml =
			{
				attr_name: name
			};

			if ( action.category == ActionCategory.private ) {

				const key = this.version == OpenScenarioVersion.v0_9 ?
					'Private' :
					'PrivateAction';

				actionXml[ key ] = this.writePrivateAction( action as PrivateAction );

			}

			xml.Action.push( actionXml );

		} );

		return xml;
	}

	writeInitActions ( xml: any ): void {

		this.openScenario.objects.forEach( object => {

			const privateXml = {
				PrivateAction: []
			};

			if ( this.version == OpenScenarioVersion.v0_9 ) {

				privateXml[ 'attr_object' ] = object.name;

			} else {

				privateXml[ 'attr_entityRef' ] = object.name;

			}

			xml.Private.push( privateXml );

			object.initActions.forEach( initAction => {

				privateXml.PrivateAction.push( this.writePrivateAction( initAction ) );

			} );

		} );

	}

	writePrivateAction ( privateAction: PrivateAction ): any {

		let xml = null;

		switch ( privateAction.actionType ) {

			case ActionType.Private_Position:
				xml = this.writePositionAction( privateAction as TeleportAction );
				break;

			case ActionType.Private_Longitudinal_Speed:
				xml = this.writeLongitudinalSpeedAction( privateAction as SpeedAction );
				break;

			case ActionType.Private_Longitudinal_Distance:
				// TODO: implement
				break;

			case ActionType.Private_LaneChange:
				xml = this.writeLaneChangeAction( privateAction as LaneChangeAction );
				break;

			case ActionType.Private_LaneOffset:
				xml = this.writeLaneOffsetAction( privateAction as LaneOffsetAction );
				break;

			case ActionType.Private_Routing_AssignRoute: // or FollowRouteAction
				xml = this.writeAssignRouteAction( privateAction as FollowRouteAction );
				break;

			case ActionType.Private_Routing_FollowTrajectory:
				xml = this.writeFollowTrajectoryAction( privateAction as FollowTrajectoryAction );
				break;

			case ActionType.Private_Routing_AcquirePosition:
				xml = this.writeAcquirePosition( privateAction as AcquirePositionAction );
				break;

			default:
				TvConsole.warn( 'Unsupported private action' );
				break;
		}

		return xml;

	}

	writeAcquirePosition ( arg0: AcquirePositionAction ): any {

		TvConsole.warn( 'AcquirePositionAction not supported yet' );

	}

	writeAssignRouteAction ( arg0: FollowRouteAction ): any {

		TvConsole.warn( 'FollowRouteAction not supported yet' );

	}

	writeLaneOffsetAction ( action: LaneOffsetAction ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			const duration = action.target.value / action.maxLateralAcc;

			return {
				Lateral: {
					LaneOffset: {
						Dynamics: {
							attr_shape: action.dynamicsShape,
							attr_maxLateralAcc: action.maxLateralAcc,
							attr_duration: duration,
						},
						Target: this.writeTarget( action.target )
					}
				}
			};

		}

		return {
			LateralAction: {
				LaneOffsetAction: {
					attr_continuous: action.continous,
					LaneOffsetActionDynamics: {
						attr_dynamicsShape: action.dynamicsShape,
						attr_maxLateralAcc: action.maxLateralAcc,
					},
					LaneOffsetTarget: this.writeTarget( action.target, 'AbsoluteTargetLaneOffset', 'RelativeTargetLaneOffset' ),
				}
			}
		};

	}

	writeFollowTrajectoryAction ( action: FollowTrajectoryAction ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				Routing: {
					FollowTrajectory: {
						Lateral: {
							attr_purpose: action.trajectoryFollowingMode
						},
						Longitudinal: {
							Timing: {
								attr_domain: action.timeReference?.timing?.domain,
								attr_scale: action.timeReference?.timing?.scale,
								attr_offset: action.timeReference?.timing?.offset
							}
						},
						Trajectory: this.writeTrajectory( action.trajectory )
					}
				}
			};
		}

		return {
			RoutingAction: {
				FollowTrajectoryAction: {
					attr_initialDistanceOffset: action.initialDistanceOffset,
					TrajectoryFollowingMode: {
						attr_followingMode: action.trajectoryFollowingMode
					},
					TimeReference: {
						Timing: {
							attr_domainAbsoluteRelative: action.timeReference?.timing?.domain,
							attr_scale: action.timeReference?.timing?.scale,
							attr_offset: action.timeReference?.timing?.offset
						}
					},
					Trajectory: this.writeTrajectory( action.trajectory ),
				}
			}
		};


		let xml = {
			Routing: {
				FollowTrajectory: {
					Lateral: {
						attr_purpose: action.trajectoryFollowingMode
					},
					Longitudinal: {},
					Trajectory: {}
				}
			}
		};

		if ( action.timeReference && action.timeReference.timing != null ) {

			const timing = action.timeReference.timing;

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


		return xml;
	}

	writeLongitudinalSpeedAction ( action: SpeedAction ): any {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				Longitudinal: {
					Speed: {
						Dynamics: this.writeTransitionDynamics( action.dynamics ),
						Target: this.writeTarget( action.target )
					}
				}
			};

		} else {

			const target = this.writeTarget( action.target, 'AbsoluteTargetSpeed', 'RelativeTargetSpeed' );

			return {
				LongitudinalAction: {
					SpeedAction: {
						SpeedActionDynamics: this.writeTransitionDynamics( action.dynamics ),
						SpeedActionTarget: target
						// missing from RelativeTargetSpeed
						// continuous
						// speedTargetValueType: SpeedTargetValueType
					}
				}
			};
		}
	}

	writeLaneChangeAction ( action: LaneChangeAction ): any {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				Lateral: {
					LaneChange: {
						attr_targetLaneOffset: action.targetLaneOffset ? action.targetLaneOffset : 0,
						Dynamics: this.writeTransitionDynamics( action.dynamics ),
						Target: this.writeTarget( action.target )
					}
				}
			};

		}

		return {
			LateralAction: {
				LaneChangeAction: {
					attr_targetLaneOffset: action.targetLaneOffset ? action.targetLaneOffset : 0,
					LaneChangeActionDynamics: this.writeTransitionDynamics( action.dynamics ),
					LaneChangeTarget: this.writeTarget( action.target, 'AbsoluteTargetLane', 'RelativeTargetLane' )
				}
			}
		};

	}

	writeTarget ( abstractTarget: Target, absoluteKey = 'Absolute', relativeKey = 'Relative' ): any {

		if ( abstractTarget.targetType == TargetType.absolute ) {

			let target = abstractTarget as AbsoluteTarget;

			return {
				[ absoluteKey ]: {
					attr_value: target.value
				}
			};

		} else if ( abstractTarget.targetType == TargetType.relative ) {

			let target = abstractTarget as RelativeTarget;

			return {
				[ relativeKey ]: {
					[ this.entityKey ]: target.entityRef.name,
					attr_value: target.value
				}
			};

		}

	}

	writeTransitionDynamics ( dynamics: TransitionDynamics ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			// either time or distance should be returned
			return {
				attr_shape: dynamics.dynamicsShape,
				attr_time: dynamics.value,
				// attr_distance: dynamics.distance
			};
		}

		return {
			attr_dynamicsShape: dynamics.dynamicsShape,
			attr_value: dynamics.value,
			attr_dynamicsDimension: dynamics.dynamicsDimension
		};

	}

	writePositionAction ( action: TeleportAction ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			return {
				Position: this.writePosition( action.position )
			};
		}

		return {
			TeleportAction: {
				Position: this.writePosition( action.position )
			}
		};
	}

	writePosition ( position: Position ): any {

		let xml = null;

		switch ( position.type ) {

			case PositionType.World:
				xml = this.writeWorldPosition( position as WorldPosition );
				break;

			case PositionType.RelativeWorld:
				xml = this.writeRelativeWorldPosition( position as RelativeWorldPosition );
				break;

			case PositionType.RelativeObject:
				xml = this.writeRelativeObjectPosition( position as RelativeObjectPosition );
				break;

			case PositionType.Road:
				xml = this.writeRoadPosition( position as RoadPosition );
				break;

			case PositionType.RelativeRoad:
				xml = this.writeRelativeRoadPosition( position as RelativeRoadPosition );
				break;

			case PositionType.Lane:
				xml = this.writeLanePosition( position as LanePosition );
				break;

			case PositionType.RelativeLane:
				xml = this.writeRelativeLanePosition( position as RelativeLanePosition );
				break;

			default:
				TvConsole.warn( 'Unsupported position action' );
				break;
		}

		return xml;
	}

	writeRoadPosition ( position: RoadPosition ): XmlElement {

		const key = this.version == OpenScenarioVersion.v0_9 ?
			'Road' :
			'RoadPosition';

		return {
			[ key ]: {
				attr_roadId: position.roadId,
				attr_s: position.sValue,
				attr_t: position.tValue,
				Orientation: this.writeOrientation( position.orientation )
			}
		};

	}

	writeRelativeRoadPosition ( position: RelativeRoadPosition ): XmlElement {

		const key = this.version == OpenScenarioVersion.v0_9 ?
			'RelativeRoad' :
			'RelativeRoadPosition';

		return {
			[ key ]: {
				[ this.entityKey ]: position.entity,
				attr_roadId: position.roadId,
				attr_ds: position.ds,
				attr_dt: position.dt,
				Orientation: this.writeOrientation( position.orientation )
			}
		};

	}

	writeRelativeWorldPosition ( position: RelativeWorldPosition ): XmlElement {

		const key = this.version == OpenScenarioVersion.v0_9 ?
			'RelativeWorld' :
			'RelativeWorldPosition';

		return {
			[ key ]: {
				[ this.entityKey ]: position.entityRef?.name,
				attr_dx: position.delta.x,
				attr_dy: position.delta.y,
				attr_dz: position.delta.z,
				Orientation: this.writeOrientation( position.orientation )
			}
		};

	}

	writeOrientation ( orientation: Orientation ): any {

		if ( !orientation ) return;

		return orientation.toXML();

	}

	writeWorldPosition ( position: WorldPosition ): any {

		return position.toXML( this.version );

	}

	writeRelativeObjectPosition ( position: RelativeObjectPosition ): any {

		const key = this.version == OpenScenarioVersion.v0_9 ? 'RelativeObject' : 'RelativeObjectPosition';

		return {
			[ key ]: {
				[ this.entityKey ]: position.entityRef?.name,
				attr_dx: position.delta.x,
				attr_dy: position.delta.y,
				attr_dz: position.delta.z,
				Orientation: position.orientation?.toXML()
			}
		};
	}

	writeCatalogs ( rootNode: any, catalogs: Catalogs ): any {

		return undefined;

	}

	writeParameterDeclaration ( parameterDeclaration: ParameterDeclaration ): { attr_name: string; attr_value: string; attr_type: "string" | "boolean" | "integer" | "double" | "unsignedInt" | "unsignedShort" | "dateTime" | "unknown"; attr_parameterType?: undefined; } | { attr_name: string; attr_value: string; attr_parameterType: "string" | "boolean" | "integer" | "double" | "unsignedInt" | "unsignedShort" | "dateTime" | "unknown"; attr_type?: undefined; } {

		if ( this.version == OpenScenarioVersion.v0_9 ) {

			return {
				attr_name: parameterDeclaration.name,
				attr_value: parameterDeclaration.value,
				attr_type: ParameterDeclaration.typeToString( parameterDeclaration.type ),
			};

		}

		return {
			attr_name: parameterDeclaration.name,
			attr_value: parameterDeclaration.value,
			attr_parameterType: ParameterDeclaration.typeToString( parameterDeclaration.type ),
		};

	}

	writeParameterDeclarations ( parameterDeclarations: ParameterDeclaration[] ): XmlElement[] {

		return parameterDeclarations.map( item => this.writeParameterDeclaration( item ) );

	}

	writeLanePosition ( position: LanePosition ): any {

		const key = this.version == OpenScenarioVersion.v0_9 ? 'Lane' : 'LanePosition';

		return {
			[ key ]: {
				attr_roadId: position.roadId,
				attr_laneId: position.laneId,
				attr_s: position.sCoordinate,
				attr_offset: position.offset ? position.offset : 0,
				Orientation: position.orientation?.toXML()
			}
		};

	}

	writeRelativeLanePosition ( position: RelativeLanePosition ): any {

		const key = this.version == OpenScenarioVersion.v0_9 ? 'RelativeLane' : 'RelativeLanePosition';

		const xml = {
			[ key ]: {
				[ this.entityKey ]: position.entityRef?.name,
				attr_dLane: position.dLane,
				attr_ds: position.ds,
				Orientation: position.orientation?.toXML()
			}
		};

		if ( position.offset != 0 ) {
			xml[ key ][ 'attr_offset' ] = position.offset;
		}

		if ( !position.ds ) {
			xml[ key ][ 'attr_dsLane' ] = position.ds ? null : position.dsLane;
		}

		return xml;
	}

	writeTrajectory ( trajectory: Trajectory ): any {

		return {
			attr_name: trajectory.name,
			attr_domain: trajectory.domain,
			attr_closed: trajectory.closed,
			ParameterDeclarations: {
				ParameterDeclaration: this.writeParameterDeclarations( trajectory.parameterDeclarations )
			},
			Shape: this.writeShape( trajectory.shape )
		};

	}

	writeVertex ( vertex: Vertex ): XmlElement {

		if ( this.version == OpenScenarioVersion.v0_9 ) {
			return {
				attr_reference: vertex.time,
				Position: this.writePosition( vertex.position ),
			};
		}

		return {
			attr_time: vertex.time,
			Position: this.writePosition( vertex.position ),
		};
	}

	writeShape ( shape: AbstractShape ): XmlElement {

		// TODO : Test this against production
		if ( shape instanceof PolylineShape ) {

			return this.writePolyline( shape );

		} else if ( shape instanceof ClothoidShape ) {

			return this.writeClothoid( shape as ClothoidShape );

		} else if ( shape instanceof SplineShape ) {

			return this.writeSpline( shape as SplineShape );

		} else {

			TvConsole.warn( 'Unknown shape' );

		}
	}

	writePolyline ( shape: PolylineShape ): any {
		return {
			Polyline: {
				Vertex: shape.vertices.map( vertex => this.writeVertex( vertex ) )
			}
		};
	}

	writeClothoid ( shape: ClothoidShape ): any {
		return shape.toXML();
	}

	writeSpline ( shape: SplineShape ): any {
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
