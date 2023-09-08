/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IFile } from 'app/core/io/file';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { TvConsole } from 'app/core/utils/console';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadTypeClass } from 'app/modules/tv-map/models/tv-road-type.class';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { XMLBuilder } from 'fast-xml-parser';
import { FileService } from '../core/io/file.service';
import { TvJunctionConnection } from '../modules/tv-map/models/tv-junction-connection';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';
import { ThreeService } from 'app/modules/three-js/three.service';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneAccess } from 'app/modules/tv-map/models/tv-lane-access';
import { TvLaneHeight } from 'app/modules/tv-map/models/tv-lane-height';
import { TvLaneMaterial } from 'app/modules/tv-map/models/tv-lane-material';
import { TvLaneRoadMark } from 'app/modules/tv-map/models/tv-lane-road-mark';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvLaneSpeed } from 'app/modules/tv-map/models/tv-lane-speed';
import { TvLaneVisibility } from 'app/modules/tv-map/models/tv-lane-visibility';
import { TvLaneWidth } from 'app/modules/tv-map/models/tv-lane-width';
import { TvObjectMarking } from 'app/modules/tv-map/models/tv-object-marking';
import { TvRoadObject, TvObjectOutline, TvCornerLocal, TvCornerRoad } from 'app/modules/tv-map/models/tv-road-object';
import { XmlElement } from 'app/modules/tv-map/services/open-drive-parser.service';

@Injectable( {
	providedIn: 'root'
} )
export class SceneExporterService {

	private readonly extension = 'scene';

	private map: TvMap;

	constructor (
		private fileService: FileService,
		private electron: TvElectronService,
		private threeService: ThreeService,
	) {
	}

	get currentFile (): IFile {
		return TvMapInstance.currentFile;
	}

	set currentFile ( value: IFile ) {
		TvMapInstance.currentFile = value;
	}

	static exportJunctionConnection ( connection: TvJunctionConnection ) {
		return {
			attr_id: connection.id,
			attr_incomingRoad: connection.incomingRoadId,
			attr_connectingRoad: connection.connectingRoadId,
			attr_contactPoint: connection.contactPoint,
			laneLink: connection.laneLink.map( link => {
				return {
					attr_from: link.from,
					attr_to: link.to,
				};
			} ),
		};
	}

	export ( map?: TvMap ): string {

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			ignoreAttributes: false,
			supressEmptyNode: true,
			format: true,
			trimValues: true,
			suppressBooleanAttributes: false,
		};

		const builder = new XMLBuilder( defaultOptions );

		this.map = map || TvMapInstance.map;

		const scene = this.exportMap( this.map );

		const xmlDocument = builder.build( scene );

		return xmlDocument;
	}

	saveAs () {

		const contents = this.export();

		const folder = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( folder, contents, this.extension, ( file: IFile ) => {

			this.currentFile.path = file.path;
			this.currentFile.name = file.name;

			this.electron.setTitle( file.name, file.path );

		} );

	}

	exportMap ( map: TvMap ) {

		return {
			version: 0.1,
			road: this.exportRoads( [ ...this.map.roads.values() ] ),
			prop: this.exportProps( map.props ),
			propCurve: this.exportPropCurves( map.propCurves ),
			propPolygon: this.exportPropPolygons( map.propPolygons ),
			surface: this.exportSurfaces( map.surfaces ),
			junction: map.getJunctions().map( junction => this.exportJunction( junction ) ),
			environment: this.threeService.environment.export()
		};

	}

	exportRoads ( roads: TvRoad[] ) {

		return roads.map( road => this.exportRoad( road ) );

	}

	exportRoad ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) {
			TvConsole.error( 'Road spline must have atleast 2 control points. Skipping export' );
			SnackBar.error( 'Road spline must have atleast 2 control points. Skipping export' );
			return;
		}

		const xml = {
			attr_id: road.id,
			attr_name: road.name,
			attr_length: road.length,
			attr_junction: road.junctionId,
			drivingMaterialGuid: road.drivingMaterialGuid,
			sidewalkMaterialGuid: road.sidewalkMaterialGuid,
			borderMaterialGuid: road.borderMaterialGuid,
			shoulderMaterialGuid: road.shoulderMaterialGuid,
			spline: this.exportRoadSpline( road.spline ),
		};

		this.writeRoadLinks( xml, road );

		this.writeRoadType( xml, road );

		this.writeElevationProfile( xml, road );

		this.writeLateralProfile( xml, road );

		this.writeLanes( xml, road );

		this.writeObjects( xml, road );

		// TODO: maybe not required here
		this.writeSignals( xml, road );


		return xml;
	}

	exportRoadSpline ( spline: AbstractSpline ) {

		if ( spline instanceof AutoSpline ) {

			return {
				attr_type: spline.type,
				point: spline.controlPointPositions.map( point => ( {
					attr_x: point.x,
					attr_y: point.y,
					attr_z: point.z
				} ) )
			};


		} else if ( spline instanceof ExplicitSpline ) {

			return {
				attr_type: spline.type,
				point: spline.controlPoints.map( ( point: RoadControlPoint ) => ( {
					attr_x: point.position.x,
					attr_y: point.position.y,
					attr_z: point.position.z,
					attr_hdg: point.hdg,
					attr_type: point.segmentType,
				} ) )
			};

		} else {

			SnackBar.error( 'Not able to export this spline type' );

		}

	}

	exportTypes ( types: TvRoadTypeClass[] ) {

		return types.map( type => {

			return {
				attr_s: type.s,
				attr_type: type.type,
				speed: {
					attr_max: type.speed.max,
					attr_unit: type.speed.unit
				},
			};

		} );

	}

	exportJunctions ( junctions: TvJunction[] ) {

		return junctions.map( junction => this.exportJunction( junction ) );

	}

	exportJunction ( junction: TvJunction ) {

		return {
			attr_id: junction.id,
			attr_name: junction.name,
			position: {
				attr_x: junction.position ? junction.position.x : 0,
				attr_y: junction.position ? junction.position.y : 0,
				attr_z: junction.position ? junction.position.z : 0,
			},
			connection: junction.getConnections().map( connection => SceneExporterService.exportJunctionConnection( connection ) ),
			priority: [],
			controller: []
		};

		// this.openDriveWriter.writeJunctionConnection( xml, junction );

		// TODO: Add controller and priority as well

		// this.openDriveWriter.writeJunctionController( xml, junction );

		// this.openDriveWriter.writeJunctionPriority( xml, junction );

		// return xml;
	}

	exportProps ( props: PropInstance[] ) {

		return props.map( prop => this.exportProp( prop ) );

	}

	exportProp ( prop: PropInstance ) {

		return {
			attr_guid: prop.guid,
			position: {
				attr_x: prop.object.position.x,
				attr_y: prop.object.position.y,
				attr_z: prop.object.position.z,
			},
			rotation: {
				attr_x: prop.object.rotation.x,
				attr_y: prop.object.rotation.y,
				attr_z: prop.object.rotation.z,
			},
			scale: {
				attr_x: prop.object.scale.x,
				attr_y: prop.object.scale.y,
				attr_z: prop.object.scale.z,
			}
		};

	}

	exportPropCurves ( curves: PropCurve[] ) {

		return curves.map( curve => this.exportPropCurve( curve ) );

	}

	exportPropCurve ( curve: PropCurve ) {

		return {
			attr_rotation: curve.rotation,
			attr_positionVariance: curve.positionVariance,
			attr_reverse: curve.reverse,
			attr_guid: curve.propGuid,
			props: curve.props.map( prop => ( {
				attr_guid: curve.propGuid,
				position: {
					attr_x: prop.position.x,
					attr_y: prop.position.y,
					attr_z: prop.position.z,
				},
				rotation: {
					attr_x: prop.rotation.x,
					attr_y: prop.rotation.y,
					attr_z: prop.rotation.z,
				},
				scale: {
					attr_x: prop.scale.x,
					attr_y: prop.scale.y,
					attr_z: prop.scale.z,
				}
			} ) ),
			spline: {
				attr_type: curve.spline.type,
				attr_closed: curve.spline.closed,
				attr_tension: curve.spline.tension,
				point: curve.spline.controlPointPositions.map( p => ( {
					attr_x: p.x,
					attr_y: p.y,
					attr_z: p.z,
				} ) )
			}
		};

	}

	exportPropPolygons ( polygons: PropPolygon[] ) {

		return polygons.map( polygon => this.exportPropPolygon( polygon ) );

	}

	exportPropPolygon ( polygon: PropPolygon ) {

		return {
			attr_guid: polygon.propGuid,
			attr_density: polygon.density,
			props: polygon.getExportJson(),
			spline: {
				attr_type: polygon.spline.type,
				attr_closed: polygon.spline.closed,
				attr_tension: polygon.spline.tension,
				point: polygon.spline.controlPointPositions.map( p => ( {
					attr_x: p.x,
					attr_y: p.y,
					attr_z: p.z,
				} ) )
			}
		};

	}

	exportSurfaces ( surfaces: TvSurface[] ) {

		return surfaces.map( surface => this.exportSurface( surface ) );

	}

	exportSurface ( surface: TvSurface ) {

		return surface.toJson();

	}

	writeRoadLinks ( xmlNode, road: TvRoad ) {

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
	}

	writeRoadType ( xmlNode, road: TvRoad ) {

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

	writeElevationProfile ( xmlNode, road: TvRoad ) {

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

	writeLateralProfile ( xmlNode, road: TvRoad ) {
	}

	writeLanes ( xmlNode, road: TvRoad ) {

		xmlNode.lanes = {
			laneOffset: [],
			laneSection: []
		};

		this.writeLaneOffset( xmlNode.lanes, road );

		for ( let i = 0; i < road.getLaneSectionCount(); i++ ) {
			this.writeLaneSections( xmlNode.lanes, road.getLaneSection( i ) );
		}
	}

	writeLaneOffset ( xmlNode, road: TvRoad ) {

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

	writeLaneSections ( xmlNode, laneSection: TvLaneSection ) {

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

		if ( leftLanes.lane.length > 0 ) laneSectionNode[ 'left' ] = leftLanes;

		if ( centerLanes.lane.length > 0 ) laneSectionNode[ 'center' ] = centerLanes;

		if ( rightLanes.lane.length > 0 ) laneSectionNode[ 'right' ] = rightLanes;

		xmlNode.laneSection.push( laneSectionNode );

	}

	writeLane ( xmlNode, lane: TvLane ): any {

		const laneNode = {
			attr_id: lane.id,
			attr_type: lane.type,
			attr_level: lane.level === true ? 'true' : 'false',
			attr_materialGuid: lane.threeMaterialGuid,
			link: {},
			width: lane.width.map( width => this.writeLaneWidth( width ) ),
			roadMark: lane.roadMark.map( mark => this.writeLaneRoadMark( mark ) ),
			material: lane.material.map( material => this.writeLaneMaterial( material ) ),
			visibility: lane.visibility.map( visibility => this.writeLaneVisibility( visibility ) ),
			speed: lane.speed.map( speed => this.writeLaneSpeed( speed ) ),
			access: lane.access.map( access => this.writeLaneAccess( access ) ),
			height: lane.height.map( height => this.writeLaneHeight( height ) ),
		};

		this.writeLaneLinks( laneNode, lane );

		xmlNode.lane.push( laneNode );

		return laneNode;
	}

	writeLaneLinks ( laneNode: any, lane: TvLane ) {

		// not link for center lanes
		if ( lane.side === TvLaneSide.CENTER ) return;

		if ( lane.predecessorExists != null ) {
			laneNode.link[ 'predecessor' ] = { attr_id: lane.predecessor };
		}

		if ( lane.successorExists != null ) {
			laneNode.link[ 'successor' ] = { attr_id: lane.succcessor };
		}

	}


	writeLaneWidth ( laneWidth: TvLaneWidth ) {

		return {
			attr_sOffset: laneWidth.s,
			attr_a: laneWidth.a,
			attr_b: laneWidth.b,
			attr_c: laneWidth.c,
			attr_d: laneWidth.d,
		}
	}

	writeLaneRoadMark ( laneRoadMark: TvLaneRoadMark ) {

		return {
			attr_sOffset: laneRoadMark.sOffset,
			attr_type: laneRoadMark.type,
			attr_weight: laneRoadMark.weight,
			attr_color: laneRoadMark.color,
			attr_material: laneRoadMark.materialDetails,
			attr_width: laneRoadMark.width,
			attr_laneChange: laneRoadMark.laneChange,
			attr_height: laneRoadMark.height,
			attr_length: laneRoadMark.length,
			attr_space: laneRoadMark.space,
			attr_materialGuid: laneRoadMark.materialGuid,
		};
	}

	writeLaneMaterial ( laneMaterial: TvLaneMaterial ) {

		return {
			attr_sOffset: laneMaterial.sOffset,
			attr_surface: laneMaterial.surface,
			attr_friction: laneMaterial.friction,
			attr_roughness: laneMaterial.roughness,
		}
	}

	writeLaneVisibility ( laneVisibility: TvLaneVisibility ) {

		return {
			attr_sOffset: laneVisibility.sOffset,
			attr_forward: laneVisibility.forward,
			attr_back: laneVisibility.back,
			attr_left: laneVisibility.left,
			attr_right: laneVisibility.right,
		};

	}

	writeLaneSpeed ( laneSpeed: TvLaneSpeed ) {

		return {
			attr_sOffset: laneSpeed.sOffset,
			attr_max: laneSpeed.max,
			attr_unit: laneSpeed.unit,
		}
	}

	writeLaneAccess ( laneAccess: TvLaneAccess ) {

		return {
			attr_sOffset: laneAccess.sOffset,
			attr_restriction: laneAccess.restriction,
		};
	}

	writeLaneHeight ( laneHeight: TvLaneHeight ) {

		return {
			attr_sOffset: laneHeight.sOffset,
			attr_inner: laneHeight.inner,
			attr_outer: laneHeight.outer,
		};

	}

	writeObjects ( xmlNode, road: TvRoad ) {

		xmlNode.objects = {
			object: []
		};

		for ( let i = 0; i < road.getRoadObjectCount(); i++ ) {

			const roadObject = road.getRoadObject( i );

			this.writeObject( xmlNode.objects, roadObject );

		}
	}

	writeObject ( xmlNode: XmlElement, roadObject: TvRoadObject ) {

		const nodeRoadObject = {

			// Attributes
			attr_type: roadObject.attr_type,
			attr_name: roadObject.name,
			attr_id: roadObject.attr_id,
			attr_s: roadObject.s,
			attr_t: roadObject.t,

			// Elements
			repeat: [],
			validity: [],
			userData: [],
			markings: {
				marking: roadObject.markings.map( marking => this.writeObjectMarking( marking ) )
			},
			outlines: {
				outline: roadObject.outlines.map( outline => this.writeObjectOutlineV2( outline ) )
			},
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

		this.writeObjectMaterial( nodeRoadObject, roadObject );

		this.writeObjectValidity( nodeRoadObject, roadObject );

		this.writeObjectParkingSpace( nodeRoadObject, roadObject );

		xmlNode.object.push( nodeRoadObject );
	}

	writeObjectMarking ( marking: TvObjectMarking ): XmlElement {

		return {
			attr_color: marking.color,
			attr_spaceLength: marking.spaceLength,
			attr_lineLength: marking.lineLength,
			attr_side: marking.side,
			attr_weight: marking.weight,
			attr_startOffset: marking.startOffset,
			attr_stopOffset: marking.stopOffset,
			attr_zOffset: marking.zOffset,
			attr_width: marking.width,
			attr_materialGuid: marking.materialGuid,
			cornerReference: marking.cornerReferences.map( reference => {
				return {
					attr_id: reference
				};
			} ),
		};

	}

	writeObjectRepeat ( xmlNode, roadObject: TvRoadObject ) {

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

	writeObjectOutlineV2 ( objectOutline: TvObjectOutline ): XmlElement {

		return {
			attr_id: objectOutline.id,
			attr_fillType: objectOutline.fillType,
			attr_outer: objectOutline.outer,
			attr_closed: objectOutline.closed,
			attr_laneType: objectOutline.laneType,
			cornerRoad: objectOutline?.cornerRoad.map(
				cornerRoad => this.writeObjectCornerRoad( cornerRoad )
			),
			cornerLocal: objectOutline?.cornerLocal.map(
				cornerLocal => this.writeObjectCornerLocal( cornerLocal )
			),
		};

	}

	writeObjectCornerLocal ( cornerLocal: TvCornerLocal ): XmlElement {

		return {
			attr_u: cornerLocal.attr_u,
			attr_v: cornerLocal.attr_v,
			attr_z: cornerLocal.attr_z,
			attr_height: cornerLocal.attr_height,
		};

	}

	writeObjectCornerRoad ( cornerRoad: TvCornerRoad ): XmlElement {

		return {
			attr_id: cornerRoad.attr_id,
			// attr_roadId: cornerRoad.roadId, // roadId is not part of the OpenDRIVE standard
			attr_s: cornerRoad.s,
			attr_t: cornerRoad.t,
			attr_dz: cornerRoad.dz,
			attr_height: cornerRoad.height,
		};

	}

	writeObjectMaterial ( xmlNode, roadObject: TvRoadObject ) {

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

	writeObjectValidity ( xmlNode, roadObject: TvRoadObject ) {

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

	writeObjectParkingSpace ( xmlNode, roadObject: TvRoadObject ) {

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

	writeSignals ( xmlNode, road: TvRoad ) {

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

	writeSurface ( xmlNode, road: TvRoad ) {
	}

	writeControllers ( xmlNode ) {

		xmlNode.controller = [];

		this.map.controllers.forEach( controller => {

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

	writeJunction ( xmlNode, junction: TvJunction ) {

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

	writeJunctionConnection ( xmlNode, junction: TvJunction ) {

		junction.connections.forEach( connection => {

			const nodeConnection = {
				attr_id: connection.id,
				attr_incomingRoad: connection.incomingRoadId,
				attr_connectingRoad: connection.connectingRoadId,
				laneLink: []
			};

			if ( connection.contactPoint != null ) {

				nodeConnection[ 'attr_contactPoint' ] = connection.contactPoint;

			}

			this.writeJunctionConnectionLaneLink( nodeConnection, connection );

			xmlNode.connection.push( nodeConnection );

		} );

	}

	writeJunctionConnectionLaneLink ( xmlNode, junctionConnection: TvJunctionConnection ) {

		for ( let i = 0; i < junctionConnection.getJunctionLaneLinkCount(); i++ ) {

			const laneLink = junctionConnection.getJunctionLaneLink( i );

			xmlNode.laneLink.push( {
				attr_from: laneLink.from,
				attr_to: laneLink.to,
			} );
		}
	}

	writeJunctionPriority ( xmlNode, junction: TvJunction ) {

		for ( let i = 0; i < junction.getJunctionPriorityCount(); i++ ) {

			const priority = junction.getJunctionPriority( i );

			xmlNode.priority.push( {
				attr_high: priority.high,
				attr_low: priority.low,
			} );
		}
	}

	writeJunctionController ( xmlNode, junction: TvJunction ) {

		for ( let i = 0; i < junction.getJunctionControllerCount(); i++ ) {

			const controller = junction.getJunctionController( i );

			xmlNode.priority.push( {
				attr_id: controller.id,
				attr_type: controller.type,
				attr_sequence: controller.sequence,
			} );
		}
	}
}
