/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';
import { TvAbstractRoadGeometry } from '../models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from '../models/geometries/tv-arc-geometry';
import { TvParamPoly3Geometry } from '../models/geometries/tv-param-poly3-geometry';
import { TvPoly3Geometry } from '../models/geometries/tv-poly3-geometry';
import { TvSpiralGeometry } from '../models/geometries/tv-spiral-geometry';
import { TvGeometryType, TvLaneSide } from '../models/tv-common';
import { TvUserData } from '../models/tv-user-data';
import { TvJunction } from '../models/junctions/tv-junction';
import { TvVirtualJunction } from '../models/junctions/tv-virtual-junction';
import { TvJunctionType } from '../models/junctions/tv-junction-type';
import { TvJunctionConnection } from '../models/junctions/tv-junction-connection';
import { TvLane } from '../models/tv-lane';
import { TvLaneAccess } from '../models/tv-lane-access';
import { TvLaneHeight } from '../lane-height/lane-height.model';
import { TvLaneMaterial } from '../models/tv-lane-material';
import { TvLaneRoadMark } from '../models/tv-lane-road-mark';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvLaneSpeed } from '../models/tv-lane-speed';
import { TvLaneVisibility } from '../models/tv-lane-visibility';
import { TvLaneWidth } from '../models/tv-lane-width';
import { TvMap } from '../models/tv-map.model';
import { TvObjectMarking } from '../models/tv-object-marking';
import { TvRoadObject } from '../models/objects/tv-road-object';
import { TvRoad } from '../models/tv-road.model';
import { TvCornerLocal } from "../models/objects/tv-corner-local";
import { TvCornerRoad } from "../models/objects/tv-corner-road";
import { TvObjectOutline } from "../models/objects/tv-object-outline";
import { XmlElement } from 'app/importers/xml.element';
import { TvConsole } from 'app/core/utils/console';
import { TvObjectRepeat } from '../models/objects/tv-object-repeat';
import { TvLaneValidity } from '../models/objects/tv-lane-validity';
import { TvObjectPolyline } from "../models/objects/tv-object-polyline";
import { TvObjectVertexRoad } from "../models/objects/tv-object-vertex-road";
import { TvObjectVertexLocal } from "../models/objects/tv-object-vertex-local";
import { TvReference, TvRoadSignal, TvSignalDependency } from '../road-signal/tv-road-signal.model';
import { TvJunctionController } from '../models/junctions/tv-junction-controller';
import { TvJunctionPriority } from '../models/junctions/tv-junction-priority';
import { TvControllerControl, TvSignalController } from '../signal-controller/tv-signal-controller';
import { TvMapHeader } from "../models/tv-map-header";
import { TvRoadTypeClass } from "../models/tv-road-type.class";
import { TvRoadSpeed } from "../models/tv-road.speed";
import { AssetExporter } from 'app/core/interfaces/asset-exporter';
import { TvLateralProfileShape, TvSuperElevation } from '../models/tv-lateral.profile';

@Injectable( {
	providedIn: 'root'
} )
export class OpenDriveExporter implements AssetExporter<TvMap> {

	public xmlDocument: Object;

	public map: TvMap;

	public constructor () {

	}

	exportAsString ( asset: TvMap ): string {

		const json = this.exportAsJSON( asset );

		const defaultOptions: Partial<XmlBuilderOptions> = {
			attributeNamePrefix: 'attr_',
			ignoreAttributes: false,
			suppressBooleanAttributes: false,
			format: true,
		};

		const builder = new XMLBuilder( defaultOptions );

		return builder.build( json );

	}

	exportAsJSON ( asset: TvMap ) {

		return this.writeFile( asset );

	}

	public getOutput ( map: TvMap ): string {

		return this.exportAsString( map );

	}

	public writeLaneLinks ( laneNode: any, lane: TvLane ) {

		// not link for center lanes
		if ( lane.side === TvLaneSide.CENTER ) return;

		if ( lane.predecessorExists ) {
			laneNode.link[ 'predecessor' ] = { attr_id: lane.predecessorId };
		}

		if ( lane.successorExists ) {
			laneNode.link[ 'successor' ] = { attr_id: lane.successorId };
		}

	}

	/**
	 * Writes the data from the OpenDrive structure to a file
	 */
	public writeFile ( map: TvMap ) {

		const rootNode = {
			header: this.writeHeader( map.header ),
			road: [],
			junction: map.getJunctions().map( junction => this.writeJunction( junction ) ),
			controller: map.getControllers().map( controller => this.writeSignalController( controller ) ),
		};

		const xmlDocument = {
			'OpenDRIVE': rootNode
		};

		map.roads.forEach( road => {

			this.writeRoad( rootNode, road );

		} );

		return xmlDocument;
	}

	/**
	 * The following methods are used to create the XML representation of the OpenDrive structure
	 * Methods follow the same hierarchical structure and are called automatically when WriteFile
	 * is executed
	 */
	public writeHeader ( header: TvMapHeader ) {

		return {
			attr_revMajor: header.revMajor,
			attr_revMinor: header.revMinor,
			attr_name: header.name,
			attr_version: header.version,
			attr_date: header.date,
			attr_north: header.north,
			attr_south: header.south,
			attr_east: header.east,
			attr_west: header.west,
			attr_vendor: header.vendor,
		};

	}

	public writeRoad ( xmlNode, road: TvRoad ) {

		const xml = {
			attr_name: road.name,
			attr_length: road.length,
			attr_id: road.id,
			attr_junction: road.junctionId,
			attr_rule: TvRoad.ruleToString( road.trafficRule ),
			type: road.type.map( type => this.writeRoadType( type ) ),
		};

		xmlNode.road.push( xml );

		this.writeRoadLinks( xml, road );

		this.writePlanView( xml, road );

		this.writeElevationProfile( xml, road );

		if ( road.lateralProfile ) {
			xml[ 'lateralProfile' ] = this.writeLateralProfile( road );
		}

		this.writeLanes( xml, road );

		xml[ 'objects' ] = {
			object: road.objects.object.map( roadObject => this.writeRoadObject( roadObject, road ) )
		};

		if ( road.signals.size > 0 ) {
			xml[ 'signals' ] = this.writeSignals( road );
		}
	}

	public writeRoadLinks ( xmlNode, road: TvRoad ) {

		xmlNode.link = {};

		if ( road.predecessor != null ) {

			if ( road.predecessor.isJunction ) {

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

				if ( road.predecessor.elementDir )
					xmlNode.link.predecessor[ 'attr_elementDir' ] = road.predecessor.elementDir;

				if ( road.predecessor.elementS )
					xmlNode.link.predecessor[ 'attr_elementS' ] = road.predecessor.elementS;

			}
		}

		if ( road.successor != null ) {

			if ( road.successor.isJunction ) {

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

				if ( road.successor.elementDir )
					xmlNode.link.successor[ 'attr_elementDir' ] = road.successor.elementDir;

				if ( road.successor.elementS )
					xmlNode.link.successor[ 'attr_elementS' ] = road.successor.elementS;

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

	public writeRoadType ( roadType: TvRoadTypeClass ) {

		const xml = {
			attr_s: roadType.s,
			attr_type: TvRoadTypeClass.typeToString( roadType.type ),
		};

		if ( roadType.speed ) {
			xml[ 'speed' ] = {};
			xml[ 'speed' ][ 'attr_max' ] = roadType.speed.max;
			xml[ 'speed' ][ 'attr_unit' ] = TvRoadSpeed.unitToString( roadType.speed.unit );
		}

		return xml;
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
				nodeGeometry[ 'spiral' ][ 'attr_curvStart' ] = sprial.curvStart;
				nodeGeometry[ 'spiral' ][ 'attr_curvEnd' ] = sprial.curvEnd;

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

				nodeGeometry[ 'paramPoly3' ][ 'attr_pRange' ] = paramPoly3.pRange;

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

	public writeLateralProfile ( road: TvRoad ) {

		return {
			superelevation: road.lateralProfile.superElevations.map( superElevation => this.writeSuperElevation( superElevation ) ),
			shape: road.lateralProfile.shapes.map( shape => this.writeLateralProfileShape( shape ) ),
			crossSectionSurface: [],
		}

	}

	writeSuperElevation ( superElevation: TvSuperElevation ): XmlElement {
		return {
			attr_s: superElevation.s,
			attr_a: superElevation.a,
			attr_b: superElevation.b,
			attr_c: superElevation.c,
			attr_d: superElevation.d,
		};
	}

	writeLateralProfileShape ( shape: TvLateralProfileShape ): XmlElement {
		return {
			attr_s: shape.s,
			attr_t: shape.t,
			attr_a: shape.a,
			attr_b: shape.b,
			attr_c: shape.c,
			attr_d: shape.d,
		};
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

	public writeLane ( xmlNode, lane: TvLane ): any {

		const laneNode = {
			attr_id: lane.id,
			attr_type: TvLane.typeToString( lane.type ),
			attr_level: lane.level === true ? 'true' : 'false',
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

		lane.roadMarks.forEach( roadMark => {
			this.writeLaneRoadMark( laneNode, roadMark );
		} )

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
			attr_material: laneRoadMark.materialName,
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

	public writeRoadObject ( roadObject: TvRoadObject, road?: TvRoad ): XmlElement {

		const xml = {
			attr_type: roadObject.attr_type,
			attr_name: roadObject.name,
			attr_id: roadObject.attr_id,
			attr_s: roadObject.s,
			attr_t: roadObject.t
		};

		if ( roadObject.zOffset ) xml[ 'attr_zOffset' ] = roadObject.zOffset;
		if ( roadObject.validLength ) xml[ 'attr_validLength' ] = roadObject.validLength;
		if ( roadObject.orientation ) xml[ 'attr_orientation' ] = roadObject.toOrientationString();
		if ( roadObject.length ) xml[ 'attr_length' ] = roadObject.length;
		if ( roadObject.width ) xml[ 'attr_width' ] = roadObject.width;
		if ( roadObject.radius ) xml[ 'attr_radius' ] = roadObject.radius;
		if ( roadObject.height ) xml[ 'attr_height' ] = roadObject.height;
		if ( roadObject.hdg ) xml[ 'attr_hdg' ] = roadObject.hdg;
		if ( roadObject.pitch ) xml[ 'attr_pitch' ] = roadObject.pitch;
		if ( roadObject.roll ) xml[ 'attr_roll' ] = roadObject.roll;

		this.writeObjectMaterial( xml, roadObject );

		this.writeObjectParkingSpace( xml, roadObject );

		if ( roadObject.repeats.length > 0 ) {
			xml[ 'repeat' ] = roadObject.repeats.map( repeat => this.writeObjectRepeat( repeat, road ) );
		}

		if ( roadObject.validity.length > 0 ) {
			xml[ 'validity' ] = roadObject.validity.map( validity => this.writeObjectValidity( validity ) );
		}

		if ( roadObject.userData.length > 0 ) {
			xml[ 'userData' ] = roadObject.userData.map( userData => this.writeUserData( userData ) );
		}

		if ( roadObject.markings.length > 0 ) {
			xml[ 'markings' ] = {
				marking: roadObject.markings.map( marking => this.writeObjectMarking( marking ) )
			};
		}

		if ( roadObject.outlines.length > 0 ) {
			xml[ 'outlines' ] = {
				outline: roadObject.outlines.map( outline => this.writeObjectOutlineV2( outline ) )
			};
		}

		if (
			roadObject.skeleton &&
			roadObject.skeleton.polylines.length > 0 &&
			roadObject.skeleton.polylines[ 0 ].vertices.length > 0
		) {
			xml[ 'skeleton' ] = {
				'polyline': roadObject.skeleton.polylines.map( polyline => this.writeObjectPolyline( polyline ) )
			};
		}

		return xml;

	}

	public writeObjectMarking ( marking: TvObjectMarking ): XmlElement {

		const cornerReference = marking.cornerReferences.map( reference => {
			return {
				attr_id: reference
			};
		} );

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
			cornerReference: cornerReference,
		};

	}

	writeObjectRepeat ( repeat: TvObjectRepeat, road?: TvRoad ): XmlElement {

		const xml = {
			attr_s: repeat.sStart,
			attr_length: repeat.computeLength( road?.length ),
			attr_distance: repeat.gap,
		}

		if ( repeat.tStart ) xml[ 'attr_tStart' ] = repeat.tStart;
		if ( repeat.tEnd ) xml[ 'attr_tEnd' ] = repeat.tEnd;
		if ( repeat.widthStart ) xml[ 'attr_widthStart' ] = repeat.widthStart;
		if ( repeat.widthEnd ) xml[ 'attr_widthEnd' ] = repeat.widthEnd;
		if ( repeat.heightStart ) xml[ 'attr_heightStart' ] = repeat.heightStart;
		if ( repeat.heightEnd ) xml[ 'attr_heightEnd' ] = repeat.heightEnd;
		if ( repeat.zOffsetStart ) xml[ 'attr_zOffsetStart' ] = repeat.zOffsetStart;
		if ( repeat.zOffsetEnd ) xml[ 'attr_zOffsetEnd' ] = repeat.zOffsetEnd;
		if ( repeat.lengthStart ) xml[ 'attr_lengthStart' ] = repeat.lengthStart;
		if ( repeat.lengthEnd ) xml[ 'attr_lengthEnd' ] = repeat.lengthEnd;

		return xml;
	}

	/**
	 *
	 * @param xmlNode
	 * @param objectOutline
	 * @deprecated
	 */
	public writeObjectOutline ( xmlNode, objectOutline: TvObjectOutline ): void {

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
					attr_id: cornerRoad.attr_id,
					attr_s: cornerRoad.s,
					attr_t: cornerRoad.t,
					attr_dz: cornerRoad.dz,
					attr_heigh: cornerRoad.height,
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

	public writeObjectOutlineV2 ( objectOutline: TvObjectOutline ): XmlElement {

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

	public writeObjectCornerLocal ( cornerLocal: TvCornerLocal ): XmlElement {

		return {
			attr_u: cornerLocal.attr_u,
			attr_v: cornerLocal.attr_v,
			attr_z: cornerLocal.attr_z,
			attr_height: cornerLocal.attr_height,
		};

	}

	public writeObjectCornerRoad ( cornerRoad: TvCornerRoad ): XmlElement {

		return {
			attr_id: cornerRoad.attr_id,
			// attr_roadId: cornerRoad.roadId, // roadId is not part of the OpenDRIVE standard
			attr_s: cornerRoad.s,
			attr_t: cornerRoad.t,
			attr_dz: cornerRoad.dz,
			attr_height: cornerRoad.height,
		};

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

	writeObjectPolyline ( polyline: TvObjectPolyline ): XmlElement {

		if ( polyline.vertices[ 0 ] instanceof TvObjectVertexRoad ) {

			return {
				attr_id: polyline.id,
				vertexRoad: polyline.vertices.map( vertex => this.writePolylineVertex( vertex ) )
			}

		}

		if ( polyline.vertices[ 0 ] instanceof TvObjectVertexLocal ) {

			return {
				attr_id: polyline.id,
				vertexLocal: polyline.vertices.map( vertex => this.writePolylineVertex( vertex ) )
			}

		}

		TvConsole.error( 'Unknown vertex type' );
	}

	writePolylineVertex ( vertex: any ): XmlElement {

		if ( vertex instanceof TvObjectVertexRoad ) {

			return {
				attr_id: vertex.id,
				attr_s: vertex.s,
				attr_t: vertex.t,
				attr_dz: vertex.dz,
				attr_radius: vertex.radius,
				attr_intersectionPoint: vertex.intersectionPoint,
			}

		} else if ( vertex instanceof TvObjectVertexLocal ) {

			return {
				attr_id: vertex.id,
				attr_u: vertex.uvz.x,
				attr_v: vertex.uvz.y,
				attr_z: vertex.uvz.z,
				attr_radius: vertex.radius,
				attr_intersectionPoint: vertex.intersectionPoint,
			}
		}

	}

	public writeObjectValidity ( validity: TvLaneValidity ): XmlElement {

		return {
			attr_fromLane: validity.fromLane,
			attr_toLane: validity.toLane
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

	public writeSignals ( road: TvRoad ) {

		return {
			signal: road.getRoadSignals().map( signal => this.writeSignal( signal ) )
		};

	}

	public writeSignal ( signal: TvRoadSignal ) {

		const xml = {
			attr_s: signal.s,
			attr_t: signal.t,
			attr_id: signal.id,
			attr_name: signal.name,
			attr_dynamic: signal.dynamic,
			attr_orientation: signal.orientation,
			attr_zOffset: signal.zOffset,
			attr_country: signal.country,
			attr_type: signal.type,
			attr_subtype: signal.subtype,
		};

		if ( signal.value != null ) xml[ 'attr_value' ] = signal.value;
		if ( signal.unit != null ) xml[ 'attr_unit' ] = signal.unit;
		if ( signal.height != null ) xml[ 'attr_height' ] = signal.height;
		if ( signal.width != null ) xml[ 'attr_width' ] = signal.width;
		if ( signal.text != null ) xml[ 'attr_text' ] = signal.text;
		if ( signal.hOffset != null ) xml[ 'attr_hOffset' ] = signal.hOffset;
		if ( signal.pitch != null ) xml[ 'attr_pitch' ] = signal.pitch;
		if ( signal.roll != null ) xml[ 'attr_roll' ] = signal.roll;

		if ( signal.assetGuid ) {
			signal.userData.delete( 'assetGuid' );
			signal.userData.set( 'assetGuid', signal.assetGuid );
		}

		if ( signal.validities.length > 0 ) {
			xml[ 'validity' ] = signal.validities.map( validity => this.writeObjectValidity( validity ) );
		}

		if ( signal.userData.size > 0 ) {
			xml[ 'userData' ] = Array.from( signal.userData.keys() ).map( key => {
				return {
					attr_code: key,
					attr_value: signal.userData.get( key )
				}
			} );
		}

		if ( signal.references.length > 0 ) {
			xml[ 'reference' ] = signal.references.map( reference => this.writeReference( reference ) );
		}

		if ( signal.dependencies.length > 0 ) {
			xml[ 'dependency' ] = signal.dependencies.map( dependency => this.writeSignalDependency( dependency ) );
		}

		return xml;
	}

	writeSignalDependency ( dependency: TvSignalDependency ): any {
		return {
			attr_id: dependency.id,
			attr_type: dependency.type
		}
	}

	writeReference ( reference: TvReference ): any {

		return {
			attr_id: reference.elementId,
			attr_elementType: reference.elementType,
			attr_type: reference.type,
		}

	}

	public writeSurface ( xmlNode, road: TvRoad ) {
	}

	public writeSignalController ( controller: TvSignalController ) {

		return {
			attr_id: controller.id,
			attr_name: controller.name,
			attr_sequence: controller.sequence,
			control: controller.controls.map( control => this.writeSignalControl( control ) )
		}

	}

	public writeSignalControl ( control: TvControllerControl ): any {

		return {
			attr_signalId: control.signalId,
			attr_type: control.type
		}

	}

	public writeJunction ( junction: TvJunction ) {

		if ( junction.connections.size === 0 ) return;

		let nodeJunction: XmlElement = {
			attr_id: junction.id,
			attr_name: junction.name,
			connection: [],
		};

		if ( junction.type == TvJunctionType.VIRTUAL ) {

			nodeJunction = this.writeVirtualJunction( junction as TvVirtualJunction );

		} else if ( junction.type == TvJunctionType.DEFAULT ) {

			nodeJunction = this.writeDefaultJunction( junction );

		} else if ( junction.type == TvJunctionType.DIRECT ) {

			console.error( 'Unknown junction type: ' + junction.type );

		} else {

			console.error( 'Unknown junction type: ' + junction.type );

		}

		this.writeJunctionConnection( nodeJunction, junction );

		if ( junction.priorities.length > 1 ) {
			nodeJunction[ 'priority' ] = junction.priorities.map( priority => this.writeJunctionPriority( priority ) )
		}

		if ( junction.controllers.length > 0 ) {
			nodeJunction[ 'controller' ] = junction.controllers.map( controller => this.writeJunctionController( controller ) );
		}

		return nodeJunction;
	}

	private writeDefaultJunction ( junction: TvJunction ): XmlElement {
		return {
			attr_id: junction.id,
			attr_name: junction.name,
			connection: [],
			priority: [],
			controller: []
		};
	}

	private writeVirtualJunction ( junction: TvVirtualJunction ): XmlElement {
		// type="virtual" id="555" mainRoad="1" sStart="50" sEnd="70" orientation="+"
		return {
			attr_id: junction.id,
			attr_name: junction.name,
			attr_type: junction.type,
			attr_mainRoad: junction.mainRoad.id,
			attr_sStart: junction.sStart,
			attr_sEnd: junction.sEnd,
			attr_orientation: junction.orientation,
			connection: [],
			priority: [],
			controller: []
		};
	}

	public writeJunctionConnection ( xmlNode, junction: TvJunction ) {

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

	public writeJunctionConnectionLaneLink ( xmlNode, junctionConnection: TvJunctionConnection ) {

		for ( let i = 0; i < junctionConnection.getJunctionLaneLinkCount(); i++ ) {

			const laneLink = junctionConnection.getJunctionLaneLink( i );

			xmlNode.laneLink.push( {
				attr_from: laneLink.from,
				attr_to: laneLink.to,
			} );
		}
	}

	public writeJunctionPriority ( priority: TvJunctionPriority ) {

		return {
			attr_high: priority.high,
			attr_low: priority.low,
		}
	}

	public writeJunctionController ( controller: TvJunctionController ) {

		return {
			attr_id: controller.id,
			attr_type: controller.type,
			attr_sequence: controller.sequence,
		}

	}

	public writeUserDataFromArray ( xmlNode, userData: TvUserData[] ) {

		for ( let i = 0; i < userData.length; i++ ) {

			const data = userData[ i ];

			xmlNode.push( this.writeUserData( data ) );

		}
	}

	public writeUserData ( data: TvUserData ) {

		return {
			attr_code: data.code,
			attr_value: data.value
		}

	}

	public writeUserDataFromMap ( xmlNode, userData: Map<any, TvUserData> ) {

		userData.forEach( userData => {

			xmlNode.push( this.writeUserData( userData ) );

		} );

	}

}


