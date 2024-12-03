/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { TvConsole } from 'app/core/utils/console';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Surface } from 'app/map/surface/surface.model';
import { XMLBuilder } from 'fast-xml-parser';
import { FileService } from '../../io/file.service';
import { TvJunctionConnection } from '../models/connections/tv-junction-connection';
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
import { XmlElement } from "../../importers/xml.element";
import { MapService } from "../../services/map/map.service";
import { OpenDriveExporter } from 'app/map/services/open-drive-exporter';
import { TvTransform } from 'app/map/models/tv-transform';
import { AssetExporter } from "../../core/interfaces/asset-exporter";
import { TvRoadSignal } from '../road-signal/tv-road-signal.model';
import { TvJunctionSegmentBoundary } from '../junction-boundary/tv-junction-boundary';
import { TvLaneOffset } from "../models/tv-lane-offset";
import { SplineExporter } from "./spline-exporter";
import { TvLaneBoundary } from "../junction-boundary/tv-lane-boundary";
import { TvJointBoundary } from "../junction-boundary/tv-joint-boundary";

@Injectable( {
	providedIn: 'root'
} )
export class SceneExporter implements AssetExporter<TvMap> {

	readonly extension = 'scene';

	constructor (
		private fileService: FileService,
		private electron: TvElectronService,
		private threeService: ThreeService,
		private mapService: MapService,
		private openDrive: OpenDriveExporter,
		private snackBar: SnackBar,
		private splineExporter: SplineExporter,
	) {
	}

	exportJunctionConnection ( connection: TvJunctionConnection ) {
		return {
			attr_id: connection.id,
			attr_incomingRoad: connection.incomingRoadId,
			attr_connectingRoad: connection.connectingRoadId,
			attr_contactPoint: connection.contactPoint,
			laneLink: connection.getLaneLinks().map( link => {
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

		const scene = this.exportAsJSON( map || this.mapService.map );

		const xmlDocument = builder.build( scene );

		return xmlDocument;
	}

	exportAsJSON ( map: TvMap ) {

		return {
			version: 0.1,
			road: map.getRoads().map( road => this.exportRoad( road ) ),
			prop: map.getProps().map( prop => this.exportProp( prop ) ),
			propCurve: this.exportPropCurves( map.propCurves ),
			propPolygon: this.exportPropPolygons( map.propPolygons ),
			surface: map.getSurfaces().map( surface => this.exportSurface( surface ) ),
			spline: map.getSplines().map( spline => this.splineExporter.export( spline ) ),
			junction: map.getJunctions().map( junction => this.exportJunction( junction ) ),
			environment: this.threeService.environment.export()
		};

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
			xml[ 'spline' ] = this.splineExporter.export( road.spline );
		}

		this.writeRoadLinks( xml, road );

		this.writeRoadType( xml, road );

		xml[ 'elevationProfile' ] = this.openDrive.writeElevationProfile( road.getElevationProfile() );

		xml[ 'lateralProfile' ] = this.openDrive.writeLateralProfile( road.getLateralProfile() );

		this.writeLanes( xml, road );

		xml[ 'objects' ] = {
			object: road.getRoadObjects().map( roadObject => this.writeRoadObject( roadObject ) )
		};

		// TODO: maybe not required here
		this.writeSignals( xml, road );

		return xml;
	}

	exportJunction ( junction: TvJunction ) {

		return {
			attr_id: junction.id,
			attr_name: junction.name,
			attr_auto: junction.auto ? 'true' : 'false',
			position: {
				attr_x: junction.centroid ? junction.centroid.x : 0,
				attr_y: junction.centroid ? junction.centroid.y : 0,
				attr_z: junction.centroid ? junction.centroid.z : 0,
			},
			connection: junction.getConnections().map( connection => this.exportJunctionConnection( connection ) ),
			priority: [],
			controller: [],
			boundary: {
				segment: junction.outerBoundary?.getSegments().map( segment => this.exportBoundarySegment( segment ) )
			},
		};

		// this.openDriveWriter.writeJunctionConnection( xml, junction );

		// TODO: Add controller and priority as well

		// this.openDriveWriter.writeJunctionController( xml, junction );

		// this.openDriveWriter.writeJunctionPriority( xml, junction );

		// return xml;
	}

	exportBoundarySegment ( segment: TvJunctionSegmentBoundary ): XmlElement {

		if ( segment instanceof TvLaneBoundary ) {
			return {
				attr_type: 'lane',
				attr_roadId: segment.road.id,
				attr_boundaryLane: segment.boundaryLane.id,
				attr_sStart: segment.sStart,
				attr_sEnd: segment.sEnd,
			};
		}

		if ( segment instanceof TvJointBoundary ) {
			return {
				attr_type: 'joint',
				attr_roadId: segment.road.id,
				attr_contactPoint: segment.contactPoint,
				attr_jointLaneStart: segment.jointLaneStart?.id,
				attr_jointLaneEnd: segment.jointLaneEnd?.id,
			};
		}

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

	exportSurface ( surface: Surface ) {

		return surface.toJson();

	}

	writeRoadLinks ( xmlNode, road: TvRoad ): void {

		xmlNode.link = {};

		if ( road.predecessor != null ) {

			if ( road.predecessor.type === 'junction' ) {

				xmlNode.link.predecessor = {
					attr_elementType: road.predecessor.type,
					attr_elementId: road.predecessor.id,
				};

			} else {

				xmlNode.link.predecessor = {
					attr_elementType: road.predecessor.type,
					attr_elementId: road.predecessor.id,
					attr_contactPoint: road.predecessor.contactPoint,
				};

			}
		}

		if ( road.successor != null ) {

			if ( road.successor.type === 'junction' ) {

				xmlNode.link.successor = {
					attr_elementType: road.successor.type,
					attr_elementId: road.successor.id,
				};

			} else {

				xmlNode.link.successor = {
					attr_elementType: road.successor.type,
					attr_elementId: road.successor.id,
					attr_contactPoint: road.successor.contactPoint,
				};

			}
		}
	}

	writeRoadType ( xmlNode, road: TvRoad ): void {

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

	writeLanes ( xmlNode, road: TvRoad ): void {

		// add default lane offset if not present
		if ( road.laneOffsets.length == 0 ) {
			road.getLaneProfile().createAndAddLaneOffset( 0, 0, 0, 0, 0 );
		}

		xmlNode.lanes = {
			laneOffset: road.getLaneProfile().getLaneOffsets().map( laneOffset => this.writeLaneOffset( laneOffset ) ),
			laneSection: []
		};

		road.getLaneProfile().getLaneSections().forEach( laneSection => {
			this.writeLaneSections( xmlNode.lanes, laneSection );
		} );
	}

	writeLaneOffset ( laneOffset: TvLaneOffset ) {

		return {
			attr_s: laneOffset.s,
			attr_a: laneOffset.a,
			attr_b: laneOffset.b,
			attr_c: laneOffset.c,
			attr_d: laneOffset.d,
		};

	}

	writeLaneSections ( xmlNode, laneSection: TvLaneSection ): void {

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

			const lane = laneSection.getLaneAtIndex( i );

			if ( lane.isLeft ) {

				this.writeLane( leftLanes, lane );

			} else if ( lane.isRight ) {

				this.writeLane( rightLanes, lane );

			} else if ( lane.isCenter ) {

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
			width: lane.getWidthArray().map( width => this.writeLaneWidth( width ) ),
			roadMark: lane.roadMarks.map( mark => this.writeLaneRoadMark( mark ) ),
			material: lane.materials.map( material => this.writeLaneMaterial( material ) ),
			visibility: lane.visibility.map( visibility => this.writeLaneVisibility( visibility ) ),
			speed: lane.speed.map( speed => this.writeLaneSpeed( speed ) ),
			access: lane.access.map( access => this.writeLaneAccess( access ) ),
			height: lane.height.map( height => this.writeLaneHeight( height ) ),
		};

		this.writeLaneLinks( laneNode, lane );

		xmlNode.lane.push( laneNode );

		return laneNode;
	}

	writeLaneLinks ( laneNode: any, lane: TvLane ): void {

		// not link for center lanes
		if ( lane.isCenter ) return;

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

	writeSignals ( xmlNode: XmlElement, road: TvRoad ): void {

		if ( road.getSignalCount() === 0 ) return;

		xmlNode.signals = {
			signal: road.getRoadSignals().map( signal => this.writeSignal( signal ) )
		};

	}

	writeSignal ( signal: TvRoadSignal ) {

		const xml = this.openDrive.writeSignal( signal );

		if ( signal.assetGuid != null ) xml[ 'attr_assetGuid' ] = signal.assetGuid;

		return xml;

	}

}
