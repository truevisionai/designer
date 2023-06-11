import { Injectable } from '@angular/core';
import { OpenScenario } from '../models/osc-scenario';
import { OscStoryboard } from '../models/osc-storyboard';
import { AbstractController, AbstractPosition, AbstractPrivateAction, CatalogReferenceController } from '../models/osc-interfaces';
import { OscRelativeLanePosition } from '../models/positions/osc-relative-lane-position';
import { OscLaneChangeDynamics } from '../models/actions/osc-private-action';
import { OscFile } from '../models/osc-common';
import { OscRoadNetwork } from '../models/osc-road-network';
import { OscEntityObject } from '../models/osc-entities';
import { OscCatalogReference, OscCatalogs } from '../models/osc-catalogs';
import { OscStory } from '../models/osc-story';
import { OscAct } from '../models/osc-act';
import { OscSequence } from '../models/osc-sequence';
import { OscManeuver } from '../models/osc-maneuver';
import { OscConditionGroup } from '../models/conditions/osc-condition-group';
import { AbstractByEntityCondition, AbstractCondition } from '../models/conditions/osc-condition';
import { OscOrientation } from '../models/osc-orientation';
import { OscSimulationTimeCondition } from '../models/conditions/osc-simulation-time-condition';
import { OscAtStartCondition } from '../models/conditions/osc-at-start-condition';
import { OscDistanceCondition } from '../models/conditions/osc-distance-condition';
import { OscWorldPosition } from '../models/positions/osc-world-position';
import { OscRelativeObjectPosition } from '../models/positions/osc-relative-object-position';
import { OscPositionAction } from '../models/actions/osc-position-action';
import { OscSpeedAction } from '../models/actions/osc-speed-action';
import { OscLaneChangeAction } from '../models/actions/osc-lane-change-action';
import { OscAbsoluteTarget } from '../models/actions/osc-absolute-target';
import { OscRelativeTarget } from '../models/actions/osc-relative-target';
import { AbstractTarget } from '../models/actions/abstract-target';
import {
    OscActionCategory,
    OscActionType,
    OscConditionCategory,
    OscConditionType,
    OscPositionType,
    OscTargetType
} from '../models/osc-enums';
import { OscParameter, OscParameterDeclaration } from '../models/osc-parameter-declaration';
import { OscLanePosition } from '../models/positions/osc-lane-position';
import { AbstractOscShape, OscClothoidShape, OscPolylineShape, OscSplineShape, OscTrajectory, OscVertex } from '../models/osc-trajectory';
import { Debug } from 'app/core/utils/debug';
import { OscEvent } from '../models/osc-event';
import { OscFollowTrajectoryAction } from '../models/actions/osc-follow-trajectory-action';
import { DefaultVehicleController } from '../controllers/vehicle-controller';

@Injectable( {
    providedIn: 'root'
} )

export class OscWriterService {

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

    writeEntities ( rootNode: any, objects: Map<string, OscEntityObject> ) {

        var entities = {
            Object: []
        };

        objects.forEach( ( item, key ) => {

            entities.Object.push( this.writeEntityObject( key, item ) );

        } );

        rootNode.Entities = entities;
    }

    writeEntityObject ( key: string, object: OscEntityObject ): any {

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

    writeCatalogReference ( catalogReference: OscCatalogReference ): any {

        return {
            attr_catalogName: catalogReference.catalogName,
            attr_entryName: catalogReference.entryName,
        };

    }

    writeRoadNetwork ( xml: any, roadNetwork: OscRoadNetwork ) {

        xml.RoadNetwork = {
            Logics: null,
            SceneGraph: null,
        };

        if ( roadNetwork.logics != null ) {
            xml.RoadNetwork.Logics = this.writeOscFile( roadNetwork.logics );
        }

        if ( roadNetwork.sceneGraph != null ) {
            xml.RoadNetwork.SceneGraph = this.writeOscFile( roadNetwork.sceneGraph );
        }

    }

    writeOscFile ( file: OscFile ) {

        return {
            attr_filepath: file.filepath
        };

    }

    writeStoryboard ( xml: any, storyboard: OscStoryboard ) {

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

    writeConditionGroup ( conditionGroup: OscConditionGroup ): any {

        let xml = {
            Condition: []
        };

        conditionGroup.conditions.forEach( condition => {

            xml.Condition.push( this.writeCondition( condition ) );

        } );

        return xml;
    }

    writeCondition ( condition: AbstractCondition ): any {

        let xml = {

            attr_name: condition.name,
            attr_delay: condition.delay,
            attr_edge: condition.edge,

        };

        if ( condition.category == OscConditionCategory.ByEntity ) {

            xml[ 'ByEntity' ] = this.writeByEntityCondition( condition as AbstractByEntityCondition );

        } else if ( condition.category == OscConditionCategory.ByValue ) {

            xml[ 'ByValue' ] = this.writeByValueCondition( condition );

        } else if ( condition.category == OscConditionCategory.ByState ) {

            xml[ 'ByState' ] = this.writeByStateCondition( condition );

        }

        return xml;
    }

    writeByStateCondition ( abstractCondition: AbstractCondition ): any {

        let xml = {};

        // TODO : Write test for this in production for constructor error
        if ( abstractCondition.conditionType === OscConditionType.ByState_AtStart ) {

            xml[ 'AtStart' ] = {};

            let condition = abstractCondition as OscAtStartCondition;

            xml[ 'AtStart' ][ 'attr_type' ] = condition.type;
            xml[ 'AtStart' ][ 'attr_name' ] = condition.elementName;

        }

        return xml;
    }

    writeByValueCondition ( abstractCondition: AbstractCondition ): any {

        let xml = {};

        // TODO : Write test for this in production for construtor error
        if ( abstractCondition.conditionType === OscConditionType.ByValue_SimulationTime ) {

            xml[ 'SimulationTime' ] = {};

            let condition = abstractCondition as OscSimulationTimeCondition;

            xml[ 'SimulationTime' ][ 'attr_value' ] = condition.value;
            xml[ 'SimulationTime' ][ 'attr_rule' ] = condition.rule;

        }

        return xml;
    }

    writeByEntityCondition ( abstractCondition: AbstractByEntityCondition ): any {

        let xml = {

            TriggeringEntities: {
                attr_rule: abstractCondition.triggeringRule,
                Entity: []
            },

            EntityCondition: {}

        };

        abstractCondition.entities.forEach( entityName => {

            xml.TriggeringEntities.Entity.push( {
                attr_name: entityName
            } );

        } );

        // TODO : Write test for this in production for constructor
        if ( abstractCondition.conditionType === OscConditionType.ByEntity_Distance ) {

            xml.EntityCondition[ 'Distance' ] = this.writeDistanceCondition( abstractCondition as OscDistanceCondition );

        }

        return xml;
    }

    writeDistanceCondition ( condition: OscDistanceCondition ): any {

        return {

            attr_value: condition.value,
            attr_freespace: condition.freespace,
            attr_alongRoute: condition.alongRoute,
            attr_rule: condition.rule,

            Position: this.writePosition( condition.position )

        };

    }

    writeStory ( story: OscStory ): any {

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

    writeAct ( act: OscAct ): any {

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

    writeSequence ( sequence: OscSequence ): any {

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

    writeManeuver ( maneuver: OscManeuver ): any {

        let xml = {

            attr_name: maneuver.name,

            Event: []

        };

        maneuver.events.forEach( event => {

            xml.Event.push( this.writeEvent( event ) );

        } );

        return xml;
    }

    writeEvent ( event: OscEvent ): any {

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

            if ( action.category == OscActionCategory.private ) {

                actionXml[ 'Private' ] = this.writePrivateAction( action as AbstractPrivateAction );

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

    writePrivateAction ( abstractAction: AbstractPrivateAction ) {

        let xml = null;

        switch ( abstractAction.actionType ) {

            case OscActionType.Private_Position:
                xml = this.writePositionAction( abstractAction as OscPositionAction );
                break;

            case OscActionType.Private_Longitudinal_Speed:
                xml = this.writeLongitudinalSpeedAction( abstractAction as OscSpeedAction );
                break;

            case OscActionType.Private_Lateral:
                xml = this.writeLaneChangeAction( abstractAction as OscLaneChangeAction );
                break;

            case OscActionType.Private_Routing:
                xml = this.writeFollowTrajectoryAction( abstractAction as OscFollowTrajectoryAction );
                break;

            default:
                throw new Error( 'Unsupported private action' );
                break;
        }

        return xml;

    }

    writeFollowTrajectoryAction ( action: OscFollowTrajectoryAction ): any {

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

            throw new Error( "Unsupported action" );

        } else {

            const trajectory = this.writeTrajectory( action.trajectory );

            xml.Routing.FollowTrajectory.Trajectory = trajectory.Trajectory;

        }

        return xml;
    }

    writeLongitudinalSpeedAction ( action: OscSpeedAction ): any {

        return {
            Longitudinal: {
                Speed: {
                    Dynamics: this.writeDynamics( action.dynamics ),
                    Target: this.writeTarget( action.target )
                }
            }
        };

    }

    writeLaneChangeAction ( action: OscLaneChangeAction ): any {

        return {

            Lateral: {

                LaneChange: {

                    // TODO: dont add this when value is null
                    attr_targetLaneOffset: action.targetLaneOffset ? action.targetLaneOffset : 0,

                    Dynamics: this.writeDynamics( action.dynamics ),

                    Target: this.writeTarget( action.target )
                }
            }

        };

    }

    writeTarget ( abstractTarget: AbstractTarget ) {

        if ( abstractTarget.targetType == OscTargetType.absolute ) {

            let target = abstractTarget as OscAbsoluteTarget;

            return {
                Absolute: {
                    attr_value: target.value
                }
            };

        } else if ( abstractTarget.targetType == OscTargetType.relative ) {

            let target = abstractTarget as OscRelativeTarget;

            return {
                Relative: {
                    attr_object: target.object,
                    attr_value: target.value
                }
            };

        }

    }

    writeDynamics ( dynamics: OscLaneChangeDynamics ) {

        let xml = {};

        dynamics.time ? xml[ 'attr_time' ] = dynamics.time : null;
        dynamics.distance ? xml[ 'attr_distance' ] = dynamics.distance : null;
        dynamics.shape ? xml[ 'attr_shape' ] = dynamics.shape : null;

        return xml;
    }

    writePositionAction ( action: OscPositionAction ) {

        return {
            Position: this.writePosition( action.position )
        };

    }

    writePosition ( position: AbstractPosition ): any {

        let xml = null;

        switch ( position.type ) {

            case OscPositionType.World:
                xml = this.writeWorldPosition( position as OscWorldPosition );
                break;

            case OscPositionType.RelativeObject:
                xml = this.writeRelativeObjectPosition( position as OscRelativeObjectPosition );
                break;

            case OscPositionType.RelativeLane:
                xml = this.writeRelativeLanePosition( position as OscRelativeLanePosition );
                break;

            case OscPositionType.Lane:
                xml = this.writeLanePosition( position as OscLanePosition );
                break;

            default:
                throw new Error( 'Unsupported position action' );
                break;
        }

        return xml;
    }

    writeRelativeLanePosition ( position: OscRelativeLanePosition ): any {

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

    writeOrientation ( orientation: OscOrientation ) {

        return {

            attr_h: orientation.h,
            attr_p: orientation.p ? orientation.p : 0,
            attr_r: orientation.r ? orientation.r : 0,

            attr_type: orientation.type
        };

    }

    writeWorldPosition ( position: OscWorldPosition ) {

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

    writeRelativeObjectPosition ( position: OscRelativeObjectPosition ) {

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

    writeCatalogs ( rootNode: any, catalogs: OscCatalogs ) {

        return undefined;

    }

    writeParameterDeclaration ( parameterDeclaration: OscParameterDeclaration ) {

        let xml = {
            Parameter: []
        };

        parameterDeclaration.parameters.forEach( ( parameter: OscParameter ) => {

            xml.Parameter.push( {
                attr_name: parameter.name,
                attr_value: parameter.value,
                attr_type: parameter.type,
            } );

        } );

        return xml;

    }

    writeLanePosition ( position: OscLanePosition ) {


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

    writeTrajectory ( trajectory: OscTrajectory ) {

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

        } )

        return xml;
    }

    writeVertex ( vertex: OscVertex ) {

        const xml = {
            attr_reference: vertex.reference,
            Position: this.writePosition( vertex.position ),
            Shape: this.writeShape( vertex.shape )
        }

        return xml;
    }

    writeShape ( shape: AbstractOscShape ) {


        // TODO : Test this against production
        if ( shape instanceof OscPolylineShape ) {

            return this.writePolyline( shape );

        } else if ( shape instanceof OscClothoidShape ) {

            return this.writeClothoid( shape as OscClothoidShape );

        } else if ( shape instanceof OscSplineShape ) {

            return this.writeSpline( shape as OscSplineShape );

        } else {

            throw new Error( 'Unknown shape' );

        }
    }

    writePolyline ( shape: OscPolylineShape ) {
        return {
            Polyline: {}
        }
    }

    writeClothoid ( shape: OscClothoidShape ) {
        return {
            Clothoid: {
                attr_curvature: shape.curvature,
                attr_curvatureDot: shape.curvatureDot,
                attr_length: shape.length
            }
        }
    }

    writeSpline ( shape: OscSplineShape ) {
        return {
            Spline: {
                ControlPoint1: {
                    attr_status: shape.controlPoint1.status
                },
                ControlPoint2: {
                    attr_status: shape.controlPoint2.status
                }
            }
        }
    }

}
