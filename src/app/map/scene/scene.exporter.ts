/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IFile } from 'app/io/file';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { AbstractSpline, NewSegment } from 'app/core/shapes/abstract-spline';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { TvConsole } from 'app/core/utils/console';
import { RoadControlPoint } from 'app/objects/road-control-point';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvRoadTypeClass } from 'app/map/models/tv-road-type.class';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Surface } from 'app/map/surface/surface.model';
import { XMLBuilder } from 'fast-xml-parser';
import { FileService } from '../../io/file.service';
import { TvJunctionConnection } from '../models/junctions/tv-junction-connection';
import { SnackBar } from '../../services/snack-bar.service';
import { TvElectronService } from '../../services/tv-electron.service';
import { ThreeService } from 'app/renderer/three.service';
import { TvLaneSide } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneAccess } from 'app/map/models/tv-lane-access';
import { TvLaneHeight } from 'app/map/lane-height/lane-height.model';
import { TvLaneMaterial } from 'app/map/models/tv-lane-material';
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneSpeed } from 'app/map/models/tv-lane-speed';
import { TvLaneVisibility } from 'app/map/models/tv-lane-visibility';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { XmlElement } from "../../importers/xml.element";
import { MapService } from "../../services/map/map.service";
import { TvMapInstance } from 'app/map/services/tv-map-instance';
import { OpenDriveExporter } from 'app/map/services/open-drive-exporter';
import { TvTransform } from 'app/map/models/tv-transform';
import { AssetExporter } from "../../core/interfaces/asset-exporter";
import { TvRoadSignal } from '../road-signal/tv-road-signal.model';
import { SplineSegmentType } from 'app/core/shapes/spline-segment';

@Injectable( {
	providedIn: 'root'
} )
export class SceneExporter implements AssetExporter<TvMap> {

	readonly extension = 'scene';

	get map (): TvMap {
		return this.mapService.map;
	}

	constructor (
		private fileService: FileService,
		private electron: TvElectronService,
		private threeService: ThreeService,
		private mapService: MapService,
		private openDrive: OpenDriveExporter,
		private snackBar: SnackBar
	) {
	}

	get currentFile (): IFile {
		return TvMapInstance.currentFile;
	}

	exportJunctionConnection ( connection: TvJunctionConnection ) {
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

	exportAsString ( map?: TvMap ): string {

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

		const scene = this.exportAsJSON( map || this.map );

		const xmlDocument = builder.build( scene );

		return xmlDocument;
	}

	saveAs () {

		const contents = this.exportAsString();

		const folder = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( folder, contents, this.extension, ( file: IFile ) => {

			this.currentFile.path = file.path;
			this.currentFile.name = file.name;

			this.electron.setTitle( file.name, file.path );

		} );

	}

	exportAsJSON ( map: TvMap ) {

		return {
			version: 0.1,
			road: this.exportRoads( [ ...this.map.roads.values() ] ),
			prop: this.exportProps( map.props ),
			propCurve: this.exportPropCurves( map.propCurves ),
			propPolygon: this.exportPropPolygons( map.propPolygons ),
			surface: this.exportSurfaces( map.surfaces ),
			spline: this.map.getSplines().map( spline => this.exportSpline( spline ) ),
			junction: map.getJunctions().map( junction => this.exportJunction( junction ) ),
			environment: this.threeService.environment.export()
		};

	}

	exportSpline ( spline: AbstractSpline ): any {

		function exportSegmentType ( segment: NewSegment ): string {
			if ( segment instanceof TvRoad ) {
				return SplineSegmentType.ROAD;
			} else if ( segment instanceof TvJunction ) {
				return SplineSegmentType.JUNCTION;
			} else {
				return null;
			}
		}

		if ( spline instanceof AutoSpline ) {

			return {
				attr_uuid: spline.uuid,
				attr_type: spline.type,
				point: spline.controlPointPositions.map( point => ( {
					attr_x: point.x,
					attr_y: point.y,
					attr_z: point.z
				} ) ),
				roadSegment: spline.segmentMap.map( ( segment, s ) => {
					return {
						attr_start: s,
						attr_id: segment.id,
						attr_type: exportSegmentType( segment )
					};
				} )
			};

		}

		if ( spline instanceof AutoSplineV2 ) {

			return {
				attr_uuid: spline.uuid,
				attr_type: spline.type,
				point: spline.controlPointPositions.map( point => ( {
					attr_x: point.x,
					attr_y: point.y,
					attr_z: point.z
				} ) ),
				roadSegment: spline.segmentMap.map( ( segment, s ) => ( {
					attr_start: s,
					attr_id: segment.id,
					attr_type: exportSegmentType( segment )
				} ) )
			};

		}

		if ( spline instanceof ExplicitSpline ) {

			return {
				attr_uuid: spline.uuid,
				attr_type: spline.type,
				point: spline.controlPoints.map( ( point: RoadControlPoint ) => ( {
					attr_x: point.position.x,
					attr_y: point.position.y,
					attr_z: point.position.z,
					attr_hdg: point.hdg,
					attr_type: point.segmentType,
				} ) ),
				roadSegment: spline.segmentMap.map( ( segment, s ) => ( {
					attr_start: s,
					attr_id: segment.id,
					attr_type: exportSegmentType( segment )
				} ) )
			};

		}

		this.snackBar.error( 'Not able to export this spline type' );

	}

	exportRoads ( roads: TvRoad[] ) {

		return roads.map( road => this.exportRoad( road ) );

	}

	exportRoad ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) {
			TvConsole.error( 'Road spline must have atleast 2 control points. Skipping export' );
			this.snackBar.error( 'Road spline must have atleast 2 control points. Skipping export' );
			return;
		}

		const xml = {
			attr_id: road.id,
			attr_sStart: road.sStart,
			attr_name: road.name,
			attr_length: road.length,
			attr_junction: road.junctionId,
			attr_rule: TvRoad.ruleToString( road.trafficRule ),
			drivingMaterialGuid: road.drivingMaterialGuid,
			sidewalkMaterialGuid: road.sidewalkMaterialGuid,
			borderMaterialGuid: road.borderMaterialGuid,
			shoulderMaterialGuid: road.shoulderMaterialGuid,
		};

		if ( road.spline?.type == 'explicit' ) {
			xml[ 'spline' ] = this.exportRoadSpline( road.spline );
		}

		this.writeRoadLinks( xml, road );

		this.writeRoadType( xml, road );

		this.writeElevationProfile( xml, road );

		this.writeLateralProfile( xml, road );

		this.writeLanes( xml, road );

		xml[ 'objects' ] = {
			object: road.objects.object.map( roadObject => this.writeRoadObject( roadObject ) )
		};

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

		}

		if ( spline instanceof AutoSplineV2 ) {

			return {
				attr_type: spline.type,
				point: spline.controlPointPositions.map( point => ( {
					attr_x: point.x,
					attr_y: point.y,
					attr_z: point.z
				} ) )
			};

		}

		if ( spline instanceof ExplicitSpline ) {

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

		}

		this.snackBar.error( 'Not able to export this spline type' );

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
			connection: junction.getConnections().map( connection => this.exportJunctionConnection( connection ) ),
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
			attr_spacing: curve.spacing,
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
			attr_id: polygon.id,
			attr_density: polygon.density,
			prop: polygon.props.map( prop => {
				return {
					attr_guid: prop.guid,
					transform: this.exportTransform( prop.transform )
				};
			} ),
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

	exportTransform ( transform: TvTransform ) {

		return {
			position: {
				attr_x: transform.position?.x || 0,
				attr_y: transform.position?.y || 0,
				attr_z: transform.position?.z || 0,
			},
			rotation: {
				attr_x: transform.rotation?.x || 0,
				attr_y: transform.rotation?.y || 0,
				attr_z: transform.rotation?.z || 0,
			},
			scale: {
				attr_x: transform.scale?.x || 1,
				attr_y: transform.scale?.y || 1,
				attr_z: transform.scale?.z || 1,
			}
		};

	}

	exportSurfaces ( surfaces: Surface[] ) {

		return surfaces.map( surface => this.exportSurface( surface ) );

	}

	exportSurface ( surface: Surface ) {

		return surface.toJson();

	}

	writeRoadLinks ( xmlNode, road: TvRoad ) {

		xmlNode.link = {};

		if ( road.predecessor != null ) {

			if ( road.predecessor.elementType === 'junction' ) {

				xmlNode.link.predecessor = {
					attr_elementType: road.predecessor.elementType,
					attr_elementId: road.predecessor.elementId,
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
					attr_elementType: road.successor.elementType,
					attr_elementId: road.successor.elementId,
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

			if ( lane.side === TvLaneSide.LEFT ) {

				this.writeLane( leftLanes, lane );

			} else if ( lane.side === TvLaneSide.RIGHT ) {

				this.writeLane( rightLanes, lane );

			} else if ( lane.side === TvLaneSide.CENTER ) {

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
			attr_type: TvLane.typeToString( lane.type ),
			attr_level: lane.level === true ? 'true' : 'false',
			attr_materialGuid: lane.threeMaterialGuid,
			attr_direction: lane.direction,
			link: {},
			width: lane.width.map( width => this.writeLaneWidth( width ) ),
			roadMark: lane.roadMarks.map( mark => this.writeLaneRoadMark( mark ) ),
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

		if ( lane.predecessorExists ) {
			laneNode.link[ 'predecessor' ] = { attr_id: lane.predecessorId };
		}

		if ( lane.successorExists ) {
			laneNode.link[ 'successor' ] = { attr_id: lane.successorId };
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

		const xml = {
			attr_sOffset: laneRoadMark.sOffset,
			attr_type: laneRoadMark.type,
			attr_weight: laneRoadMark.weight,
			attr_color: laneRoadMark.color,
			attr_material: laneRoadMark.materialName,
			attr_width: laneRoadMark.width,
			attr_laneChange: laneRoadMark.laneChange,
			attr_height: laneRoadMark.height,
			attr_length: laneRoadMark.length,
			attr_space: laneRoadMark.space,
		};

		if ( laneRoadMark.materialGuid ) {
			xml[ 'attr_materialGuid' ] = laneRoadMark.materialGuid;
		}

		return xml;
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

	writeRoadObject ( roadObject: TvRoadObject ): XmlElement {

		const xml = this.openDrive.writeRoadObject( roadObject );

		roadObject.assetGuid ? xml[ 'attr_assetGuid' ] = roadObject.assetGuid : null;

		return xml
	}

	//writeObjectOutlineV2 ( objectOutline: TvObjectOutline ): XmlElement {
	//
	//	return {
	//		attr_id: objectOutline.id,
	//		attr_fillType: objectOutline.fillType,
	//		attr_outer: objectOutline.outer,
	//		attr_closed: objectOutline.closed,
	//		attr_laneType: objectOutline.laneType,
	//		cornerRoad: objectOutline?.cornerRoad.models(
	//			cornerRoad => this.writeObjectCornerRoad( cornerRoad )
	//		),
	//		cornerLocal: objectOutline?.cornerLocal.models(
	//			cornerLocal => this.writeObjectCornerLocal( cornerLocal )
	//		),
	//	};
	//
	//}

	//writeObjectCornerLocal ( cornerLocal: TvCornerLocal ): XmlElement {
	//
	//	return {
	//		attr_u: cornerLocal.attr_u,
	//		attr_v: cornerLocal.attr_v,
	//		attr_z: cornerLocal.attr_z,
	//		attr_height: cornerLocal.attr_height,
	//	};
	//
	//}

	//writeObjectCornerRoad ( cornerRoad: TvCornerRoad ): XmlElement {
	//
	//	return {
	//		attr_id: cornerRoad.attr_id,
	//		// attr_roadId: cornerRoad.roadId, // roadId is not part of the OpenDRIVE standard
	//		attr_s: cornerRoad.s,
	//		attr_t: cornerRoad.t,
	//		attr_dz: cornerRoad.dz,
	//		attr_height: cornerRoad.height,
	//	};
	//
	//}

	//writeObjectMaterial ( xmlNode, roadObject: TvRoadObject ) {
	//
	//	if ( roadObject.material != null ) {
	//
	//		xmlNode[ 'material' ] = {};
	//
	//		// TODO: ACCESS VIA GETTERS & SETTERS
	//		xmlNode.material = {
	//			attr_surface: roadObject.material.attr_surface,
	//			attr_friction: roadObject.material.attr_friction,
	//			attr_roughness: roadObject.material.attr_roughness,
	//		};
	//	}
	//}

	//writeObjectValidity ( xmlNode, roadObject: TvRoadObject ) {
	//
	//	xmlNode.validity = [];
	//
	//	for ( let i = 0; i < roadObject.getValidityCount(); i++ ) {
	//
	//		const validity = roadObject.getValidity( i );
	//
	//		// TODO: ACCESS VIA GETTERS & SETTER
	//		xmlNode.validity.push( {
	//			attr_fromLane: validity.attr_fromLane,
	//			attr_toLane: validity.attr_toLane
	//		} );
	//	}
	//}

	//writeObjectParkingSpace ( xmlNode, roadObject: TvRoadObject ) {
	//
	//	if ( roadObject.parkingSpace != null ) {
	//
	//		xmlNode[ 'parkingSpace' ] = {};
	//
	//		// TODO: ACCESS VIA GETTERS & SETTERS
	//		xmlNode.parkingSpace = {
	//			attr_access: roadObject.parkingSpace.attr_access,
	//			attr_restriction: roadObject.parkingSpace.attr_restriction,
	//			marking: []
	//		};
	//
	//		for ( let i = 0; i < roadObject.parkingSpace.getMarkingCount(); i++ ) {
	//
	//			const marking = roadObject.parkingSpace.getMarking( i );
	//
	//			// TODO: ACCESS VIA GETTERS & SETTERS
	//			xmlNode.parkingSpace.marking.push( {
	//				attr_side: marking.attr_side,
	//				attr_type: marking.attr_type,
	//				attr_width: marking.attr_width,
	//				attr_color: marking.attr_color,
	//			} );
	//		}
	//	}
	//}

	writeSignals ( xmlNode: XmlElement, road: TvRoad ) {

		if ( road.signals.size === 0 ) return;

		xmlNode.signals = {
			signal: road.getRoadSignals().map( signal => this.writeSignal( signal ) )
		};

	}

	public writeSignal ( signal: TvRoadSignal ) {

		const xml = this.openDrive.writeSignal( signal );

		if ( signal.assetGuid != null ) xml[ 'attr_assetGuid' ] = signal.assetGuid;

		return xml;

	}

	//writeSurface ( xmlNode, road: TvRoad ) {}

	//writeControllers ( xmlNode ) {
	//
	//	xmlNode.controller = [];
	//
	//	this.models.controllers.forEach( controller => {
	//
	//		const nodeController = {
	//			attr_id: controller.id,
	//			attr_name: controller.name,
	//			control: []
	//		};
	//
	//		if ( controller.sequence ) {
	//			nodeController[ 'attr_sequence' ] = controller.sequence;
	//		}
	//
	//		controller.controls.forEach( control => {
	//
	//			nodeController.control.push( {
	//				attr_signalId: control.signalId,
	//				attr_type: control.type
	//			} );
	//
	//		} );
	//
	//		xmlNode.controller.push( nodeController );
	//
	//	} );
	//}

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
