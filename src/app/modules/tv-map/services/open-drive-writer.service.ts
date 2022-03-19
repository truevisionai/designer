/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMap } from '../models/tv-map.model';
import { TvRoad } from '../models/tv-road.model';
import { TvAbstractRoadGeometry } from '../models/geometries/tv-abstract-road-geometry';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvLane } from '../models/tv-lane';
import { TvObjectOutline, TvRoadObject } from '../models/tv-road-object';
import { TvJunction } from '../models/tv-junction';
import { TvGeometryType, TvLaneSide, TvUserData } from '../models/tv-common';
import { TvLaneRoadMark } from '../models/tv-lane-road-mark';
import { TvLaneWidth } from '../models/tv-lane-width';
import { TvLaneMaterial } from '../models/tv-lane-material';
import { TvLaneVisibility } from '../models/tv-lane-visibility';
import { TvLaneSpeed } from '../models/tv-lane-speed';
import { TvLaneAccess } from '../models/tv-lane-access';
import { TvLaneHeight } from '../models/tv-lane-height';
import { TvArcGeometry } from '../models/geometries/tv-arc-geometry';
import { TvSpiralGeometry } from '../models/geometries/tv-spiral-geometry';
import { TvPoly3Geometry } from '../models/geometries/tv-poly3-geometry';
import { TvParamPoly3Geometry } from '../models/geometries/tv-param-poly3-geometry';
import { TvJunctionConnection } from '../models/tv-junction-connection';

@Injectable( {
    providedIn: 'root'
} )
export class OdWriter {

    public xmlDocument: Object;
    public openDrive: TvMap;

    public constructor () {

    }

    public getOutput ( openDrive: TvMap ): string {

        this.openDrive = openDrive;

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

        this.writeFile( '' );

        const data = parser.parse( this.xmlDocument );

        // if ( Environment.production ) {

        //   const blob: any = new Blob( [data], { type: 'application/xml' } );

        //   // Debug.log( blob );

        //   // TODO : Export OpenDRIVE
        //   // saveAs( blob, 'openDrive.xodr' );

        // } else {

        //   Debug.log( data );

        // }

        return data;

    }

    public writeLaneLinks ( laneNode: any, lane: TvLane ) {

        // not link for center lanes
        if ( lane.side === TvLaneSide.CENTER ) return;

        if ( lane.predecessorExists != null )
            laneNode.link[ 'predecessor' ] = { attr_id: lane.predecessor };

        if ( lane.successorExists != null )
            laneNode.link[ 'successor' ] = { attr_id: lane.succcessor };

    }

    /**
     * Writes the data from the OpenDrive structure to a file
     */
    public writeFile ( fileName: string ) {

        const rootNode = {
            header: {},
            road: [],
            junction: []
        };

        this.xmlDocument = {
            'OpenDRIVE': rootNode
        };

        this.writeHeader( rootNode.header );

        this.openDrive.roads.forEach( road => {

            this.writeRoad( rootNode, road );

        } );

        this.writeControllers( rootNode );

        this.openDrive.junctions.forEach( junction => {

            this.writeJunction( rootNode, junction );

        } );
    }

    /**
     * The following methods are used to create the XML representation of the OpenDrive structure
     * Methods follow the same hierarchical structure and are called automatically when WriteFile
     * is executed
     */
    public writeHeader ( xmlNode ) {

        const header = this.openDrive.getHeader();

        // Add all attributes
        xmlNode.attr_revMajor = header.revMajor;
        xmlNode.attr_revMinor = header.revMinor;
        xmlNode.attr_name = header.name;
        xmlNode.attr_version = header.version;
        xmlNode.attr_date = header.date;
        xmlNode.attr_north = header.north;
        xmlNode.attr_south = header.south;
        xmlNode.attr_east = header.east;
        xmlNode.attr_west = header.west;
        xmlNode.attr_vendor = header.vendor;

    }

    public writeRoad ( xmlNode, road: TvRoad ) {

        const nodeRoad = {
            attr_name: road.name,
            attr_length: road.length,
            attr_id: road.id,
            attr_junction: road.junction,
        };

        xmlNode.road.push( nodeRoad );

        this.writeRoadLinks( nodeRoad, road );

        this.writeRoadType( nodeRoad, road );

        this.writePlanView( nodeRoad, road );

        this.writeElevationProfile( nodeRoad, road );

        this.writeLateralProfile( nodeRoad, road );

        this.writeLanes( nodeRoad, road );

        this.writeObjects( nodeRoad, road );

        this.writeSignals( nodeRoad, road );
    }

    public writeRoadLinks ( xmlNode, road: TvRoad ) {

        xmlNode.link = {};

        if ( road.predecessor != null ) {

            if ( road.predecessor.elementType === 'junction' ) {

                xmlNode.link.predecessor = {
                    attr_elementType: road.predecessor.attr_elementType,
                    attr_elementId: road.predecessor.attr_elementId,
                };

            } else {

                xmlNode.link.predecessor = {
                    attr_elementType: road.predecessor.elementType,
                    attr_elementId: road.predecessor.elementId,
                    attr_contactPoint: road.predecessor.contactPoint,
                };

            }
        }

        if ( road.successor != null ) {

            if ( road.successor.elementType === 'junction' ) {

                xmlNode.link.successor = {
                    attr_elementType: road.successor.attr_elementType,
                    attr_elementId: road.successor.attr_elementId,
                };

            } else {

                xmlNode.link.successor = {
                    attr_elementType: road.successor.elementType,
                    attr_elementId: road.successor.elementId,
                    attr_contactPoint: road.successor.contactPoint,
                };

            }
        }

        // // dont support neighbour
        // if ( road.link != null ) {
        //
        //     for ( let i = 0; i < road.link.getNeighborCount(); i++ ) {
        //
        //         const neighbor = road.link.getNeighbour( i );
        //
        //         xmlNode.link.neighbor.push( {
        //             attr_side: neighbor.attr_side,
        //             attr_elementId: neighbor.attr_elementId,
        //             attr_direction: neighbor.attr_direction,
        //         } );
        //
        //     }
        // }

    }

    public writeRoadType ( xmlNode, road: TvRoad ) {

        if ( road.type.length > 0 ) {

            xmlNode.type = [];

            road.getTypes().forEach( type => {

                const typeXml = {
                    attr_s: type.s,
                    attr_type: type.type,
                };

                if ( type.speed ) {
                    typeXml[ 'speed' ] = {};
                    typeXml[ 'speed' ][ 'attr_max' ] = type.speed.max;
                    typeXml[ 'speed' ][ 'attr_unit' ] = type.speed.unit;
                }

                xmlNode.type.push( typeXml );

            } );
        }

    }

    public writePlanView ( xmlNode, road: TvRoad ) {

        xmlNode.planView = {
            geometry: []
        };

        const geometryCount = road.getGeometryBlockCount();

        for ( let i = 0; i < geometryCount; i++ ) {
            this.writeGeometryBlock( xmlNode.planView, road.getGeometryBlock( i ) );
        }
    }

    public writeGeometryBlock ( xmlNode, geometryBlock: TvAbstractRoadGeometry ) {

        const nodeGeometry = {
            attr_s: geometryBlock.s.toExponential( 16 ),
            attr_x: geometryBlock.x.toExponential( 16 ),
            attr_y: geometryBlock.y.toExponential( 16 ),
            attr_hdg: geometryBlock.hdg.toExponential( 16 ),
            attr_length: geometryBlock.length.toExponential( 16 ),
        };

        xmlNode.geometry.push( nodeGeometry );

        // TODO: ADD POLY3 GEOMETRY
        switch ( geometryBlock.geometryType ) {

            case TvGeometryType.LINE:

                nodeGeometry[ 'line' ] = null;

                break;

            case TvGeometryType.ARC:

                const arc = geometryBlock as TvArcGeometry;

                nodeGeometry[ 'arc' ] = {};
                nodeGeometry[ 'arc' ][ 'attr_curvature' ] = arc.curvature;

                break;

            case TvGeometryType.SPIRAL:

                const sprial = geometryBlock as TvSpiralGeometry;

                // TODO: ADD REST OF THE VALUES
                nodeGeometry[ 'spiral' ] = {};
                nodeGeometry[ 'spiral' ][ 'attr_curvStart' ] = sprial.attr_curvStart;
                nodeGeometry[ 'spiral' ][ 'attr_curvEnd' ] = sprial.attr_curvEnd;

                break;

            case TvGeometryType.POLY3:

                const poly3 = geometryBlock as TvPoly3Geometry;

                nodeGeometry[ 'poly3' ] = {};
                nodeGeometry[ 'poly3' ][ 'attr_a' ] = poly3.attr_a;
                nodeGeometry[ 'poly3' ][ 'attr_b' ] = poly3.attr_b;
                nodeGeometry[ 'poly3' ][ 'attr_c' ] = poly3.attr_c;
                nodeGeometry[ 'poly3' ][ 'attr_d' ] = poly3.attr_d;

                break;

            case TvGeometryType.PARAMPOLY3:

                const paramPoly3 = geometryBlock as TvParamPoly3Geometry;

                nodeGeometry[ 'paramPoly3' ] = {};

                nodeGeometry[ 'paramPoly3' ][ 'attr_aU' ] = paramPoly3.aU;
                nodeGeometry[ 'paramPoly3' ][ 'attr_bU' ] = paramPoly3.bU;
                nodeGeometry[ 'paramPoly3' ][ 'attr_cU' ] = paramPoly3.cU;
                nodeGeometry[ 'paramPoly3' ][ 'attr_dU' ] = paramPoly3.dU;

                nodeGeometry[ 'paramPoly3' ][ 'attr_aV' ] = paramPoly3.aV;
                nodeGeometry[ 'paramPoly3' ][ 'attr_bV' ] = paramPoly3.bV;
                nodeGeometry[ 'paramPoly3' ][ 'attr_cV' ] = paramPoly3.cV;
                nodeGeometry[ 'paramPoly3' ][ 'attr_dV' ] = paramPoly3.dV;

                break;
        }

    }

    public writeGeometry ( xmlNode, roadGeometry, geometryType ) {
    }

    public writeElevationProfile ( xmlNode, road: TvRoad ) {

        const elevationProfile = road.getElevationProfile();

        if ( elevationProfile != null ) {

            xmlNode.elevationProfile = {
                elevation: []
            };

            if ( elevationProfile.getElevationCount() == 0 ) road.addElevation( 0, 0, 0, 0, 0 );

            for ( let i = 0; i < elevationProfile.getElevationCount(); i++ ) {

                const element = elevationProfile.getElevation( i );

                xmlNode.elevationProfile.elevation.push( {
                    attr_s: element.s,
                    attr_a: element.a,
                    attr_b: element.b,
                    attr_c: element.c,
                    attr_d: element.d,
                } );

            }

        }

    }

    public writeLateralProfile ( xmlNode, road: TvRoad ) {
    }

    public writeLanes ( xmlNode, road: TvRoad ) {

        xmlNode.lanes = {
            laneOffset: [],
            laneSection: []
        };

        this.writeLaneOffset( xmlNode.lanes, road );

        for ( let i = 0; i < road.getLaneSectionCount(); i++ ) {
            this.writeLaneSections( xmlNode.lanes, road.getLaneSection( i ) );
        }
    }

    public writeLaneOffset ( xmlNode, road: TvRoad ) {

        const laneOffsets = road.getLaneOffsets();

        if ( laneOffsets.length === 0 ) road.addLaneOffset( 0, 0, 0, 0, 0 );

        if ( laneOffsets != null ) {

            xmlNode.laneOffset = [];

            laneOffsets.forEach( laneOffset => {

                xmlNode.laneOffset.push( {
                    attr_s: laneOffset.s,
                    attr_a: laneOffset.a,
                    attr_b: laneOffset.b,
                    attr_c: laneOffset.c,
                    attr_d: laneOffset.d,
                } );

            } );

        }
    }

    public writeLaneSections ( xmlNode, laneSection: TvLaneSection ) {

        const leftLanes = {
            lane: []
        };
        const centerLanes = {
            lane: []
        };
        const rightLanes = {
            lane: []
        };

        for ( let i = 0; i < laneSection.getLaneCount(); i++ ) {

            const lane = laneSection.getLane( i );
            const side = lane.getSide();

            if ( side === TvLaneSide.LEFT ) {

                this.writeLane( leftLanes, lane );

            } else if ( side === TvLaneSide.RIGHT ) {

                this.writeLane( rightLanes, lane );

            } else if ( side === TvLaneSide.CENTER ) {

                this.writeLane( centerLanes, lane );

            }
        }

        const laneSectionNode = {
            attr_s: laneSection.s,
        };

        if ( leftLanes.lane.length > 0 ) laneSectionNode[ "left" ] = leftLanes;

        if ( centerLanes.lane.length > 0 ) laneSectionNode[ "center" ] = centerLanes;

        if ( rightLanes.lane.length > 0 ) laneSectionNode[ "right" ] = rightLanes;

        xmlNode.laneSection.push( laneSectionNode );

    }

    public writeLane ( xmlNode, lane: TvLane ): any {

        const laneNode = {
            attr_id: lane.id,
            attr_type: lane.type,
            attr_level: lane.level,
            link: {},
            width: [],
            roadMark: [],
            material: [],
            visibility: [],
            speed: [],
            access: [],
            height: []
        };

        this.writeLaneLinks( laneNode, lane );

        for ( let i = 0; i < lane.getLaneWidthCount(); i++ ) {
            this.writeLaneWidth( laneNode, lane.getLaneWidth( i ) );
        }

        for ( let i = 0; i < lane.getLaneRoadMarkCount(); i++ ) {
            this.writeLaneRoadMark( laneNode, lane.getLaneRoadMark( i ) );
        }

        for ( let i = 0; i < lane.getLaneMaterialCount(); i++ ) {
            this.writeLaneMaterial( laneNode, lane.getLaneMaterial( i ) );
        }

        for ( let i = 0; i < lane.getLaneVisibilityCount(); i++ ) {
            this.writeLaneVisibility( laneNode, lane.getLaneVisibility( i ) );
        }

        for ( let i = 0; i < lane.getLaneSpeedCount(); i++ ) {
            this.writeLaneSpeed( laneNode, lane.getLaneSpeed( i ) );
        }

        for ( let i = 0; i < lane.getLaneAccessCount(); i++ ) {
            this.writeLaneAccess( laneNode, lane.getLaneAccess( i ) );
        }

        for ( let i = 0; i < lane.getLaneHeightCount(); i++ ) {
            this.writeLaneHeight( laneNode, lane.getLaneHeight( i ) );
        }

        xmlNode.lane.push( laneNode );

        return laneNode;
    }

    public writeLaneWidth ( xmlNode, laneWidth: TvLaneWidth ) {

        xmlNode.width.push( {
            attr_sOffset: laneWidth.s,
            attr_a: laneWidth.a,
            attr_b: laneWidth.b,
            attr_c: laneWidth.c,
            attr_d: laneWidth.d,
        } );
    }

    public writeLaneRoadMark ( xmlNode, laneRoadMark: TvLaneRoadMark ) {

        xmlNode.roadMark.push( {
            attr_sOffset: laneRoadMark.sOffset,
            attr_type: laneRoadMark.type,
            attr_weight: laneRoadMark.weight,
            attr_color: laneRoadMark.color,
            attr_material: laneRoadMark.material,
            attr_width: laneRoadMark.width,
            attr_laneChange: laneRoadMark.laneChange,
            attr_height: laneRoadMark.height,
        } );
    }

    public writeLaneMaterial ( xmlNode, laneMaterial: TvLaneMaterial ) {

        xmlNode.material.push( {
            attr_sOffset: laneMaterial.sOffset,
            attr_surface: laneMaterial.surface,
            attr_friction: laneMaterial.friction,
            attr_roughness: laneMaterial.roughness,
        } );
    }

    public writeLaneVisibility ( xmlNode, laneVisibility: TvLaneVisibility ) {

        xmlNode.visibility.push( {
            attr_sOffset: laneVisibility.sOffset,
            attr_forward: laneVisibility.forward,
            attr_back: laneVisibility.back,
            attr_left: laneVisibility.left,
            attr_right: laneVisibility.right,
        } );
    }

    public writeLaneSpeed ( xmlNode, laneSpeed: TvLaneSpeed ) {

        xmlNode.speed.push( {
            attr_sOffset: laneSpeed.sOffset,
            attr_max: laneSpeed.max,
            attr_unit: laneSpeed.unit,
        } );
    }

    public writeLaneAccess ( xmlNode, laneAccess: TvLaneAccess ) {

        xmlNode.access.push( {
            attr_sOffset: laneAccess.sOffset,
            attr_restriction: laneAccess.restriction,
        } );
    }

    public writeLaneHeight ( xmlNode, laneHeight: TvLaneHeight ) {

        xmlNode.height.push( {
            attr_sOffset: laneHeight.sOffset,
            attr_inner: laneHeight.inner,
            attr_outer: laneHeight.outer,
        } );
    }

    public writeObjects ( xmlNode, road: TvRoad ) {

        xmlNode.objects = {
            object: []
        };

        for ( let i = 0; i < road.getRoadObjectCount(); i++ ) {

            const roadObject = road.getRoadObject( i );

            this.writeObject( xmlNode.objects, roadObject );

        }
    }

    public writeObject ( xmlNode, roadObject: TvRoadObject ) {

        const nodeRoadObject = {

            // Attributes
            attr_type: roadObject.type,
            attr_name: roadObject.name,
            attr_id: roadObject.id,
            attr_s: roadObject.s,
            attr_t: roadObject.t,

            // Elements
            repeat: [],
            validity: [],
            userData: [],
        };

        roadObject.zOffset ? nodeRoadObject[ 'attr_zOffset' ] = roadObject.zOffset : null;
        roadObject.validLength ? nodeRoadObject[ 'attr_validLength' ] = roadObject.validLength : null;
        roadObject.orientation ? nodeRoadObject[ 'attr_orientation' ] = roadObject.orientation : null;
        roadObject.length ? nodeRoadObject[ 'attr_length' ] = roadObject.length : null;
        roadObject.width ? nodeRoadObject[ 'attr_width' ] = roadObject.width : null;
        roadObject.radius ? nodeRoadObject[ 'attr_radius' ] = roadObject.radius : null;
        roadObject.height ? nodeRoadObject[ 'attr_height' ] = roadObject.height : null;
        roadObject.hdg ? nodeRoadObject[ 'attr_hdg' ] = roadObject.hdg : null;
        roadObject.pitch ? nodeRoadObject[ 'attr_pitch' ] = roadObject.pitch : null;
        roadObject.roll ? nodeRoadObject[ 'attr_roll' ] = roadObject.roll : null;

        this.writeObjectRepeat( nodeRoadObject, roadObject );

        this.writeObjectOutline( nodeRoadObject, roadObject.outline );

        this.writeObjectMaterial( nodeRoadObject, roadObject );

        this.writeObjectValidity( nodeRoadObject, roadObject );

        this.writeObjectParkingSpace( nodeRoadObject, roadObject );

        this.writeUserDataFromArray( nodeRoadObject.userData, roadObject.userData );

        xmlNode.object.push( nodeRoadObject );
    }

    public writeObjectRepeat ( xmlNode, roadObject: TvRoadObject ) {

        xmlNode.repeat = [];

        for ( let i = 0; i < roadObject.getRepeatCount(); i++ ) {

            const repeat = roadObject.getRepeat( i );

            xmlNode.repeat.push( {
                attr_s: repeat.s,
                attr_length: repeat.length,
                attr_distance: repeat.distance,
                attr_tStart: repeat.tStart,
                attr_tEnd: repeat.tEnd,
                attr_widthStart: repeat.widthStart,
                attr_widthEnd: repeat.widthEnd,
                attr_heightStart: repeat.heightStart,
                attr_heightEnd: repeat.heightEnd,
                attr_zOffsetStart: repeat.zOffsetStart,
                attr_zOffsetEnd: repeat.zOffsetEnd,
            } );
        }
    }

    public writeObjectOutline ( xmlNode, objectOutline: TvObjectOutline ) {

        if ( objectOutline != null ) {

            xmlNode[ 'outline' ] = {};

            xmlNode[ 'outline' ] = {
                cornerRoad: [],
                cornerLocal: []
            };

            for ( let i = 0; i < objectOutline.getCornerRoadCount(); i++ ) {

                const cornerRoad = objectOutline.getCornerRoad( i );

                // TODO: ACCESS VIA GETTERS & SETTERS
                xmlNode.cornerRoad.push( {
                    attr_s: cornerRoad.attr_s,
                    attr_t: cornerRoad.attr_t,
                    attr_dz: cornerRoad.attr_dz,
                    attr_heigh: cornerRoad.attr_height,
                } );
            }

            for ( let i = 0; i < objectOutline.getCornerLocalCount(); i++ ) {

                const cornerLocal = objectOutline.getCornerLocal( i );

                // TODO: ACCESS VIA GETTERS & SETTERS
                xmlNode.cornerLocal.push( {
                    attr_u: cornerLocal.attr_u,
                    attr_v: cornerLocal.attr_v,
                    attr_z: cornerLocal.attr_z,
                    attr_height: cornerLocal.attr_height,
                } );
            }
        }
    }

    public writeObjectMaterial ( xmlNode, roadObject: TvRoadObject ) {

        if ( roadObject.material != null ) {

            xmlNode[ 'material' ] = {};

            // TODO: ACCESS VIA GETTERS & SETTERS
            xmlNode.material = {
                attr_surface: roadObject.material.attr_surface,
                attr_friction: roadObject.material.attr_friction,
                attr_roughness: roadObject.material.attr_roughness,
            };
        }
    }

    public writeObjectValidity ( xmlNode, roadObject: TvRoadObject ) {

        xmlNode.validity = [];

        for ( let i = 0; i < roadObject.getValidityCount(); i++ ) {

            const validity = roadObject.getValidity( i );

            // TODO: ACCESS VIA GETTERS & SETTER
            xmlNode.validity.push( {
                attr_fromLane: validity.attr_fromLane,
                attr_toLane: validity.attr_toLane
            } );
        }
    }

    public writeObjectParkingSpace ( xmlNode, roadObject: TvRoadObject ) {

        if ( roadObject.parkingSpace != null ) {

            xmlNode[ 'parkingSpace' ] = {};

            // TODO: ACCESS VIA GETTERS & SETTERS
            xmlNode.parkingSpace = {
                attr_access: roadObject.parkingSpace.attr_access,
                attr_restriction: roadObject.parkingSpace.attr_restriction,
                marking: []
            };

            for ( let i = 0; i < roadObject.parkingSpace.getMarkingCount(); i++ ) {

                const marking = roadObject.parkingSpace.getMarking( i );

                // TODO: ACCESS VIA GETTERS & SETTERS
                xmlNode.parkingSpace.marking.push( {
                    attr_side: marking.attr_side,
                    attr_type: marking.attr_type,
                    attr_width: marking.attr_width,
                    attr_color: marking.attr_color,
                } );
            }
        }
    }

    public writeSignals ( xmlNode, road: TvRoad ) {

        xmlNode.signals = {
            signal: []
        };

        road.signals.forEach( ( signal, signalId ) => {

            const nodeSignal = {

                // TODO: ACCESS VIA GETTERS & SETTERS
                // Attributes
                attr_s: signal.s,
                attr_t: signal.t,
                attr_id: signal.id,
                attr_name: signal.name,
                attr_dynamic: signal.dynamic,
                attr_orientation: signal.orientations,
                attr_zOffset: signal.zOffset,
                attr_country: signal.country,
                attr_type: signal.type,
                attr_subtype: signal.subtype,

                // Elements
                validity: [],
                dependency: [],
                signalReference: [],
                userData: [],
            };

            if ( signal.value != null ) nodeSignal[ 'attr_value' ] = signal.value;
            if ( signal.unit != null ) nodeSignal[ 'attr_unit' ] = signal.unit;
            if ( signal.height != null ) nodeSignal[ 'attr_height' ] = signal.height;
            if ( signal.width != null ) nodeSignal[ 'attr_width' ] = signal.width;
            if ( signal.text != null ) nodeSignal[ 'attr_text' ] = signal.text;
            if ( signal.hOffset != null ) nodeSignal[ 'attr_hOffset' ] = signal.hOffset;
            if ( signal.pitch != null ) nodeSignal[ 'attr_pitch' ] = signal.pitch;
            if ( signal.roll != null ) nodeSignal[ 'attr_roll' ] = signal.roll;

            signal.userDataMap.delete( 'sign_shape' );
            signal.userDataMap.set( 'sign_shape', new TvUserData( 'sign_shape', signal.signShape ) );

            this.writeUserDataFromMap( nodeSignal.userData, signal.getUserData() );

            for ( let j = 0; j < signal.getValidityCount(); j++ ) {

                const validity = signal.getValidity( j );

                // TODO: ACCESS VIA GETTERS & SETTER
                nodeSignal.validity.push( {
                    attr_fromLane: validity.attr_fromLane,
                    attr_toLane: validity.attr_toLane
                } );
            }

            for ( let j = 0; j < signal.getDependencyCount(); j++ ) {

                const dependency = signal.getDependency( j );

                nodeSignal.dependency.push( {
                    attr_id: dependency.id,
                    attr_type: dependency.type
                } );
            }

            for ( let j = 0; j < signal.getSignalReferenceCount(); j++ ) {

                const signalReference = signal.getSignalReference( j );

                const nodeSignalReference = {
                    attr_s: signalReference.s,
                    attr_t: signalReference.t,
                    attr_id: signalReference.id,
                    attr_orientation: signalReference.orientations,
                    validity: []
                };

                for ( let k = 0; k < signalReference.getValidityCount(); k++ ) {

                    const validity = signalReference.getValidity( k );

                    // TODO: ACCESS VIA GETTERS & SETTER
                    nodeSignalReference.validity.push( {
                        attr_fromLane: validity.attr_fromLane,
                        attr_toLane: validity.attr_toLane
                    } );
                }

                nodeSignal.signalReference.push( nodeSignalReference );
            }

            xmlNode.signals.signal.push( nodeSignal );

        } );

    }

    public writeSurface ( xmlNode, road: TvRoad ) {
    }

    public writeControllers ( xmlNode ) {

        xmlNode.controller = [];

        this.openDrive.controllers.forEach( controller => {

            const nodeController = {
                attr_id: controller.id,
                attr_name: controller.name,
                control: []
            };

            if ( controller.sequence ) {
                nodeController[ 'attr_sequence' ] = controller.sequence;
            }

            controller.controls.forEach( control => {

                nodeController.control.push( {
                    attr_signalId: control.signalId,
                    attr_type: control.type
                } );

            } );

            xmlNode.controller.push( nodeController );

        } );
    }

    public writeJunction ( xmlNode, junction: TvJunction ) {

        if ( junction.connections.size === 0 ) return;

        const nodeJunction = {
            attr_id: junction.id,
            attr_name: junction.name,
            connection: [],
            priority: [],
            controller: []
        };

        this.writeJunctionConnection( nodeJunction, junction );

        this.writeJunctionPriority( nodeJunction, junction );

        this.writeJunctionController( nodeJunction, junction );

        xmlNode.junction.push( nodeJunction );
    }

    public writeJunctionConnection ( xmlNode, junction: TvJunction ) {

        junction.connections.forEach( connection => {

            const nodeConnection = {
                attr_id: connection.id,
                attr_incomingRoad: connection.incomingRoad,
                attr_connectingRoad: connection.connectingRoad,
                laneLink: []
            };

            if ( connection.contactPoint != null ) {

                nodeConnection[ 'attr_contactPoint' ] = connection.contactPoint;

            }

            this.writeJunctionConnectionLaneLink( nodeConnection, connection );

            xmlNode.connection.push( nodeConnection );

        } );

    }

    public writeJunctionConnectionLaneLink ( xmlNode, junctionConnection: TvJunctionConnection ) {

        for ( let i = 0; i < junctionConnection.getJunctionLaneLinkCount(); i++ ) {

            const laneLink = junctionConnection.getJunctionLaneLink( i );

            xmlNode.laneLink.push( {
                attr_from: laneLink.from,
                attr_to: laneLink.to,
            } );
        }
    }

    public writeJunctionPriority ( xmlNode, junction: TvJunction ) {

        for ( let i = 0; i < junction.getJunctionPriorityCount(); i++ ) {

            const priority = junction.getJunctionPriority( i );

            xmlNode.priority.push( {
                attr_high: priority.high,
                attr_low: priority.low,
            } );
        }
    }

    public writeJunctionController ( xmlNode, junction: TvJunction ) {

        for ( let i = 0; i < junction.getJunctionControllerCount(); i++ ) {

            const controller = junction.getJunctionController( i );

            xmlNode.priority.push( {
                attr_id: controller.id,
                attr_type: controller.type,
                attr_sequence: controller.sequence,
            } );
        }
    }

    public writeUserDataFromArray ( xmlNode, userData: TvUserData[] ) {

        for ( let i = 0; i < userData.length; i++ ) {

            const data = userData[ i ];

            xmlNode.push( {
                attr_code: data.attr_code,
                attr_value: data.attr_value
            } );

        }
    }

    public writeUserDataFromMap ( xmlNode, userData: Map<any, TvUserData> ) {

        userData.forEach( userData => {

            xmlNode.push( {

                attr_code: userData.attr_code,
                attr_value: userData.attr_value

            } );

        } );

    }

}


