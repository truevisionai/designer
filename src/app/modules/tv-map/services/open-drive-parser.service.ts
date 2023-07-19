/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { XMLParser } from 'fast-xml-parser';
import { AbstractReader } from '../../../core/services/abstract-reader';
import { readXmlArray } from '../../../core/tools/xml-utils';
import { TvAbstractRoadGeometry } from '../models/geometries/tv-abstract-road-geometry';
import { EnumHelper, TvContactPoint, TvElementType, TvGeometryType, TvLaneSide, TvRoadType, TvUnit, TvUserData } from '../models/tv-common';
import { TvController, TvControllerControl } from '../models/tv-controller';
import { TvJunction } from '../models/tv-junction';
import { TvJunctionConnection } from '../models/tv-junction-connection';
import { TvJunctionController } from '../models/tv-junction-controller';
import { TvJunctionLaneLink } from '../models/tv-junction-lane-link';
import { TvJunctionPriority } from '../models/tv-junction-priority';
import { TvLane } from '../models/tv-lane';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvMap } from '../models/tv-map.model';
import { TvPlaneView } from '../models/tv-plane-view';
import { TvRoadObject } from '../models/tv-road-object';
import { TvRoadSignal } from '../models/tv-road-signal.model';
import { TvRoadTypeClass } from '../models/tv-road-type.class';
import { TvRoad } from '../models/tv-road.model';
import { SignShapeType } from './tv-sign.service';
import { TvConsole } from 'app/core/utils/console';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvRoadLinkChildType } from '../models/tv-road-link-child';

declare const fxp;

export interface XmlElement {
	[ key: string ]: any;
}

@Injectable( {
	providedIn: 'root'
} )
export class OpenDriverParser extends AbstractReader {

	public map: TvMap = new TvMap();
	public xmlElement: string;

	constructor () {
		super();
	}

	get openDrive () {
		return this.map;
	}

	parse ( xmlElement: string ): TvMap {

		this.xmlElement = xmlElement;

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			textNodeName: 'value',
			ignoreAttributes: false,
			supressEmptyNode: false,
			format: true,
		};

		const parser = new XMLParser( defaultOptions );

		const data: any = parser.parse( this.xmlElement );

		const map = this.readFile( data );

		return map;
	}

	/**
	 * Reads the data from the OpenDrive structure to a file
	 */
	readFile ( xmlString ) {

		const xmlElement = xmlString.OpenDRIVE;

		if ( !xmlElement ) TvConsole.error( 'No OpenDRIVE tag found. Import Failed' );
		if ( !xmlElement ) SnackBar.warn( 'No OpenDRIVE tag found. Import Failed' );
		if ( !xmlElement ) return;

		if ( !xmlElement.road ) TvConsole.error( 'No road tag found. Import Failed' );
		if ( !xmlElement.road ) SnackBar.warn( 'No road tag found' );
		if ( !xmlElement.road ) return;

		this.readHeader( xmlElement.header );

		this.readRoads( xmlElement );

		this.readAsOptionalArray( xmlElement.controller, xml => {

			this.map.addControllerInstance( this.readController( xml ) );

		} );

		this.readAsOptionalArray( xmlElement.junction, ( xml ) => {

			this.map.addJunctionInstance( this.readJunction( xml ) );

		} );

		return this.map;
	}

	/**
	 * The following methods are used to read the data from the XML file and fill in the the OpenDrive structure
	 * Methods follow the hierarchical structure and are called automatically when ReadFile is executed
	 */
	readHeader ( xmlElement: XmlElement ) {

		const revMajor = parseFloat( xmlElement.attr_revMajor );
		const revMinor = parseFloat( xmlElement.attr_revMinor );
		const name = xmlElement.attr_name;
		const version = parseFloat( xmlElement.attr_version );
		const date = xmlElement.attr_date;
		const north = parseFloat( xmlElement.attr_north );
		const south = parseFloat( xmlElement.attr_south );
		const east = parseFloat( xmlElement.attr_east );
		const west = parseFloat( xmlElement.attr_west );
		const vendor = xmlElement.attr_vendor;

		this.map.setHeader( revMajor, revMinor, name, version, date, north, south, east, west, vendor );
	}

	readRoad ( xml: XmlElement ) {

		const name = xml.attr_name;
		const length = parseFloat( xml.attr_length );
		const id = parseInt( xml.attr_id, 10 );
		const junction = parseFloat( xml.attr_junction );

		const road = this.map.addRoad( name, length, id, junction );

		if ( xml.link != null ) {

			this.readRoadLinks( road, xml.link );

		}

		// Get type
		this.readRoadTypes( road, xml );

		if ( xml.planView != null ) {

			this.readPlanView( road, xml.planView );

			road.spline = this.makeSplineFromGeometry( road, road.planView.geometries );

			road.length = 0;

			road.spline.update();

			road.clearGeometries();

			road.spline.exportGeometries( true ).forEach( geometry => {

				road.addGeometry( geometry );

			} );

			road.updated.emit( road );
		}

		if ( xml.elevationProfile != null ) this.readElevationProfile( road, xml.elevationProfile );

		if ( xml.lateralProfile != null ) this.readLateralProfile( road, xml.lateralProfile );

		if ( xml.lanes != null ) this.readLanes( road, xml.lanes );

		// if ( xml.objects != null && xml.objects !== '' ) this.readObjects( road, xml.objects );

		if ( xml.signals ) this.readSignals( road, xml.signals );

		if ( xml.surface != null && xml.surface !== '' ) this.readSurface( road, xml.surface );

		return road;
	}

	public makeSplineFromGeometry ( road: TvRoad, geometries: TvAbstractRoadGeometry[] ): ExplicitSpline {

		const spline = new ExplicitSpline( road );

		if ( geometries.length === 0 ) return spline;

		let lastGeometry: TvAbstractRoadGeometry;

		for ( let i = 0; i < geometries.length; i++ ) {

			lastGeometry = geometries[ i ];

			spline.addFromFile( i, lastGeometry.startV3, lastGeometry.hdg, lastGeometry.geometryType, lastGeometry );
		}

		const lastCoord = lastGeometry.endCoord();

		spline.addFromFile( geometries.length, lastCoord.toVector3(), lastCoord.hdg, lastGeometry.geometryType, lastGeometry );

		spline.hide();

		spline.controlPoints.forEach( cp => cp.userData.roadId = road.id );

		return spline;
	}

	public readRoads ( xmlElement: XmlElement ) {

		if ( xmlElement.road == null ) {

			throw new Error( 'no roads found' );

		}

		this.readAsOptionalArray( xmlElement.road, ( xml ) => {

			this.readRoad( xml );

		} );

	}

	public readRoadLinks ( road: TvRoad, xmlElement: XmlElement ) {

		if ( xmlElement.predecessor != null ) {

			this.readRoadLink( road, xmlElement.predecessor, 0 );

		}

		if ( xmlElement.successor != null ) {

			this.readRoadLink( road, xmlElement.successor, 1 );

		}

		if ( xmlElement.neighbor != null ) {

			if ( Array.isArray( xmlElement.neighbor ) ) {

				for ( let i = 0; i < xmlElement.neighbor.length; i++ ) {

					this.readRoadLink( road, xmlElement.neighbor[ i ], 2 );

				}

			} else {

				this.readRoadLink( road, xmlElement.neighbor, 2 );

			}
		}
	}

	public readRoadLink ( road: TvRoad, xmlElement: XmlElement, type: number ) {

		if ( type === 0 ) {

			const elementType = this.readElementType( xmlElement.attr_elementType );
			const elementId = parseFloat( xmlElement.attr_elementId );
			const contactPoint = this.readContactPoint( xmlElement.attr_contactPoint );


			road.setPredecessor( elementType, elementId, contactPoint );

		} else if ( type === 1 ) {

			const elementType = this.readElementType( xmlElement.attr_elementType );
			const elementId = parseFloat( xmlElement.attr_elementId );
			const contactPoint = this.readContactPoint( xmlElement.attr_contactPoint );

			road.setSuccessor( elementType, elementId, contactPoint );

		} else if ( type === 2 ) {

			console.error( 'neighbour not supported' );

			// const side = xmlElement.attr_side;
			// const elementId = xmlElement.attr_elementId;
			// const direction = xmlElement.attr_direction;
			//
			// road.setNeighbor( side, elementId, direction );

		}

	}

	readElementType ( value: string ): TvRoadLinkChildType {

		if ( value === 'road' ) {

			return TvRoadLinkChildType.road;

		} else if ( value === 'junction' ) {

			return TvRoadLinkChildType.junction;

		} else {

			return null;

		}

	}

	public readContactPoint ( value: string ): TvContactPoint {

		if ( value === 'start' ) {

			return TvContactPoint.START;

		} else if ( value === 'end' ) {

			return TvContactPoint.END;

		} else {

			return null;

		}

	}

	public readRoadTypes ( road: TvRoad, xmlElement: XmlElement ) {

		if ( !xmlElement.type ) console.warn( 'no road type tag not present' );

		this.readAsOptionalArray( xmlElement.type, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );

			const roadType = TvRoadTypeClass.stringToTypes( xml.attr_type );

			let maxSpeed = 0;

			let unit = TvUnit.MILES_PER_HOUR;

			this.readAsOptionalElement( xml.speed, xml => {

				maxSpeed = parseFloat( xml.attr_max );

				unit = EnumHelper.stringToOdUnits( xml.attr_unit );

			} );

			road.type.push( new TvRoadTypeClass( s, roadType, maxSpeed, unit ) );

		} );

		// add default if no road type inserted
		if ( road.type.length === 0 ) {

			road.setType( TvRoadType.TOWN, 40, TvUnit.MILES_PER_HOUR );

		}

	}

	public readPlanView ( road: TvRoad, xmlElement: XmlElement ) {

		if ( xmlElement.geometry != null ) {

			if ( Array.isArray( xmlElement.geometry ) ) {

				for ( let i = 0; i < xmlElement.geometry.length; i++ ) {

					this.readGeometryType( road, xmlElement.geometry[ i ] );

				}

			} else {

				this.readGeometryType( road, xmlElement.geometry );

			}

		} else {

			TvConsole.error( 'No geometry found for road:' + road.id + '. Adding default line with length 1' );

			SnackBar.error( 'NoGeometryFound In OpenDRIVE Road. Adding default line with length 1' );

			road.addGeometryLine( 0, 0, 0, 0, Math.max( road.length, 1 ) );

		}
	}

	public readGeometryType ( road: TvRoad, xmlElement: XmlElement ) {

		if ( xmlElement.line != null ) {

			this.readGeometryBlock( road, xmlElement, TvGeometryType.LINE );

		} else if ( xmlElement.arc != null ) {

			this.readGeometryBlock( road, xmlElement, TvGeometryType.ARC );

		} else if ( xmlElement.spiral != null ) {

			this.readGeometryBlock( road, xmlElement, TvGeometryType.SPIRAL );

		} else if ( xmlElement.poly3 != null ) {

			this.readGeometryBlock( road, xmlElement, TvGeometryType.POLY3 );

		} else if ( xmlElement.paramPoly3 != null ) {

			this.readGeometryBlock( road, xmlElement, TvGeometryType.PARAMPOLY3 );

		} else {

			console.error( 'unknown geometry type', xmlElement );

		}
	}

	public readGeometryBlock ( road: TvRoad, xmlElement: XmlElement, geometryType: TvGeometryType ) {

		const s = parseFloat( xmlElement.attr_s );
		const x = parseFloat( xmlElement.attr_x );
		const y = parseFloat( xmlElement.attr_y );
		const hdg = parseFloat( xmlElement.attr_hdg );
		const length = parseFloat( xmlElement.attr_length );

		road.addPlanView();

		const planView = road.getPlanView();

		this.readGeometry( planView, xmlElement, geometryType );
	}

	public readGeometry ( planView: TvPlaneView, xmlElement: XmlElement, geometryType: TvGeometryType ) {

		const s = parseFloat( xmlElement.attr_s );
		const x = parseFloat( xmlElement.attr_x );
		const y = parseFloat( xmlElement.attr_y );
		let hdg = parseFloat( xmlElement.attr_hdg );
		const length = parseFloat( xmlElement.attr_length );

		// unsure of this, but works well so far
		// hdg += Maths.M_PI_2;

		// NO NEED FOR THIS
		// because of threejs co-ordinate system
		// x will become y and y will become x
		// const x = parsedX * -1;
		// const y = parsedY;

		switch ( geometryType ) {

			case TvGeometryType.LINE:

				planView.addGeometryLine( s, x, y, hdg, length );

				break;

			case TvGeometryType.SPIRAL:

				const curvStart = parseFloat( xmlElement.spiral.attr_curvStart );
				const curvEnd = parseFloat( xmlElement.spiral.attr_curvEnd );

				planView.addGeometrySpiral( s, x, y, hdg, length, curvStart, curvEnd );

				break;

			case TvGeometryType.ARC:

				const curvature = parseFloat( xmlElement.arc.attr_curvature );

				planView.addGeometryArc( s, x, y, hdg, length, curvature );

				break;

			case TvGeometryType.POLY3:

				const a = parseFloat( xmlElement.poly3.attr_a );
				const b = parseFloat( xmlElement.poly3.attr_b );
				const c = parseFloat( xmlElement.poly3.attr_c );
				const d = parseFloat( xmlElement.poly3.attr_d );

				planView.addGeometryPoly3( s, x, y, hdg, length, a, b, c, d );

				break;

			case TvGeometryType.PARAMPOLY3:

				const aU = parseFloat( xmlElement.paramPoly3.attr_aU );
				const bU = parseFloat( xmlElement.paramPoly3.attr_bU );
				const cU = parseFloat( xmlElement.paramPoly3.attr_cU );
				const dU = parseFloat( xmlElement.paramPoly3.attr_dU );

				const aV = parseFloat( xmlElement.paramPoly3.attr_aV );
				const bV = parseFloat( xmlElement.paramPoly3.attr_bV );
				const cV = parseFloat( xmlElement.paramPoly3.attr_cV );
				const dV = parseFloat( xmlElement.paramPoly3.attr_dV );

				planView.addGeometryParamPoly3( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV );

				break;

			default:
				console.error( 'unknown geometry type', geometryType );
				break;

		}

	}

	public readController ( xmlElement: XmlElement ): TvController {

		const id = parseFloat( xmlElement.attr_id );
		const name = xmlElement.attr_name;
		const sequence = xmlElement.attr_sequence ? parseFloat( xmlElement.attr_sequence ) : null;

		const controller = new TvController( id, name, sequence );

		this.readAsOptionalArray( xmlElement.control, xml => {

			controller.addControl( this.readControl( xml ) );

		} );

		return controller;
	}

	public readJunction ( xmlElement: XmlElement ): TvJunction {

		const name = xmlElement.attr_name;
		const id = parseInt( xmlElement.attr_id );

		const junction = new TvJunction( name, id );

		this.readAsOptionalArray( xmlElement.connection, xml => {

			junction.addConnection( this.readJunctionConnection( xml ) );

		} );

		this.readAsOptionalArray( xmlElement.priority, xml => {

			junction.addPriority( this.readJunctionPriority( xml ) );

		} );

		this.readAsOptionalArray( xmlElement.controller, xml => {

			junction.addController( this.readJunctionController( xml ) );

		} );

		return junction;
	}

	public readJunctionConnection ( xmlElement: XmlElement ) {

		const id = parseInt( xmlElement.attr_id );
		const incomingRoad = parseInt( xmlElement.attr_incomingRoad );
		const connectingRoad = parseInt( xmlElement.attr_connectingRoad );
		const contactPoint = this.readContactPoint( xmlElement.attr_contactPoint );

		const junctionConnection = new TvJunctionConnection( id, incomingRoad, connectingRoad, contactPoint );

		this.readAsOptionalArray( xmlElement.laneLink, xml => {

			junctionConnection.addLaneLink( this.readJunctionConnectionLaneLink( xml ) );

		} );

		return junctionConnection;
	}

	public readJunctionConnectionLaneLink ( xmlElement: XmlElement ): TvJunctionLaneLink {

		const from = parseInt( xmlElement.attr_from );
		const to = parseInt( xmlElement.attr_to );

		return new TvJunctionLaneLink( from, to );
	}

	public readJunctionPriority ( xmlElement: XmlElement ): TvJunctionPriority {

		const high = parseInt( xmlElement.attr_high );
		const low = parseInt( xmlElement.attr_low );

		return new TvJunctionPriority( high, low );
	}

	public readJunctionController ( xmlElement: XmlElement ): TvJunctionController {

		const id = parseInt( xmlElement.attr_id );
		const type = xmlElement.attr_type;
		const sequence = parseInt( xmlElement.attr_sequence );

		return new TvJunctionController( id, type, sequence );
	}

	public readElevationProfile ( road: TvRoad, xmlElement: XmlElement ) {

		road.addElevationProfile();

		this.readAsOptionalArray( xmlElement.elevation, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );
			const a = parseFloat( xml.attr_a );
			const b = parseFloat( xml.attr_b );
			const c = parseFloat( xml.attr_c );
			const d = parseFloat( xml.attr_d );

			road.addElevation( s, a, b, c, d );

		} );

	}

	public readLateralProfile ( road: TvRoad, xmlElement: XmlElement ) {

	}

	public readLanes ( road: TvRoad, xmlElement: XmlElement ) {

		this.readAsOptionalArray( xmlElement.laneSection, ( xml ) => {

			this.readLaneSection( road, xml );

		} );

		this.readAsOptionalArray( xmlElement.laneOffset, ( xml ) => {

			this.readLaneOffset( road, xml );

		} );


		// if ( xmlElement.laneSection != null ) {
		//
		//     if ( Array.isArray( xmlElement.laneSection ) ) {
		//
		//         for ( let i = 0; i < xmlElement.laneSection.length; i++ ) {
		//
		//             this.readLaneSections( road, xmlElement.laneSection[i] );
		//
		//         }
		//
		//     } else {
		//
		//         this.readLaneSections( road, xmlElement.laneSection );
		//
		//     }
		// }
	}

	public readObjects ( road: TvRoad, xmlElement: XmlElement ) {

		// @ts-ignore
		if ( xmlElement != null && xmlElement !== '' ) {

			if ( Array.isArray( xmlElement.object ) ) {

				for ( let i = 0; i < xmlElement.object.length; i++ ) {

					this.readObject( road, xmlElement.object[ i ] );

				}
			} else {

				this.readObject( road, xmlElement.object );

			}
		}
	}

	public readObject ( road: TvRoad, xmlElement: XmlElement ) {

		const type = xmlElement.attr_type;
		const name = xmlElement.attr_name;
		const id = parseFloat( xmlElement.attr_id );
		const s = parseFloat( xmlElement.attr_s );
		const t = parseFloat( xmlElement.attr_t );
		const zOffset = parseFloat( xmlElement.attr_zOffset );
		const validLength = parseFloat( xmlElement.attr_validLength );
		const orientation = xmlElement.attr_orientation;
		const length = parseFloat( xmlElement.attr_length );
		const width = parseFloat( xmlElement.attr_width );
		const radius = parseFloat( xmlElement.attr_radius );
		const height = parseFloat( xmlElement.attr_height );
		const hdg = parseFloat( xmlElement.attr_hdg );
		const pitch = parseFloat( xmlElement.attr_pitch );
		const roll = parseFloat( xmlElement.attr_roll );

		road.addRoadObject(
			type, name, id,
			s, t, zOffset,
			validLength,
			orientation,
			length, width, radius, height,
			hdg, pitch, roll
		);

		const roadObject = road.getLastAddedRoadObject();

		roadObject.userData = this.readUserData( xmlElement );

		this.readRoadObjectRepeatArray( roadObject, xmlElement );
	}

	public readRoadObjectRepeatArray ( roadObject: TvRoadObject, xmlElement: XmlElement ): void {

		if ( xmlElement.repeat != null && xmlElement.repeat !== '' ) {

			if ( Array.isArray( xmlElement.repeat ) ) {

				for ( let i = 0; i < xmlElement.repeat.length; i++ ) {

					this.readRoadObjectRepeat( roadObject, xmlElement.repeat[ i ] );

				}

			} else {

				this.readRoadObjectRepeat( roadObject, xmlElement );

			}

		}

	}

	public readRoadObjectRepeat ( roadObject: TvRoadObject, xmlElement: XmlElement ): void {

		const s = parseFloat( xmlElement.attr_s );
		const length = parseFloat( xmlElement.attr_length );
		const distance = parseFloat( xmlElement.attr_distance );
		const tStart = parseFloat( xmlElement.attr_tStart );
		const tEnd = parseFloat( xmlElement.attr_tEnd );
		const widthStart = parseFloat( xmlElement.attr_widthStart );
		const widthEnd = parseFloat( xmlElement.attr_widthEnd );
		const heightStart = parseFloat( xmlElement.attr_heightStart );
		const heightEnd = parseFloat( xmlElement.attr_heightEnd );
		const zOffsetStart = parseFloat( xmlElement.attr_zOffsetStart );
		const zOffsetEnd = parseFloat( xmlElement.attr_zOffsetEnd );

		roadObject.addRepeat( s, length, distance, tStart, tEnd, widthStart, widthEnd, heightStart, heightEnd, zOffsetStart, zOffsetEnd );

	}

	public readSignals ( road: TvRoad, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.signal, x => this.readSignal( road, x ) );

	}

	public readSignal ( road: TvRoad, xmlElement: XmlElement ) {

		const s = parseFloat( xmlElement.attr_s );
		const t = xmlElement.attr_t;
		const id = xmlElement.attr_id;
		const name = xmlElement.attr_name;
		const dynamic = xmlElement.attr_dynamic;
		const orientation = xmlElement.attr_orientation;
		const zOffset = xmlElement.attr_zOffset;
		const country = xmlElement.attr_country;
		const type = xmlElement.attr_type;
		const subtype = xmlElement.attr_subtype;
		const value = xmlElement.attr_value;
		const unit = xmlElement.attr_unit;
		const height = xmlElement.attr_height;
		const width = xmlElement.attr_width;
		const text = xmlElement.attr_text;
		const hOffset = xmlElement.attr_hOffset;
		const pitch = xmlElement.attr_pitch;
		const roll = xmlElement.attr_roll;

		const roadSignal = road.addRoadSignal( s,
			t,
			id,
			name,
			dynamic,
			orientation,
			zOffset,
			country,
			type,
			subtype,
			value,
			unit,
			height,
			width,
			text,
			hOffset,
			pitch,
			roll
		);

		this.readSignalValidity( roadSignal, xmlElement );

		this.readSignalDependency( roadSignal, xmlElement );

		roadSignal.userData = this.readUserData( xmlElement );

		if ( roadSignal.userDataMap.has( 'sign_shape' ) ) {

			const signShape = roadSignal.userDataMap.get( 'sign_shape' );

			roadSignal.signShape = SignShapeType[ signShape.attr_value ] as SignShapeType;

		}
	}

	public readSignalValidity ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

		if ( xmlElement.validity != null && xmlElement.validity !== '' ) {

			if ( Array.isArray( xmlElement.validity ) ) {

				for ( let i = 0; i < xmlElement.validity.length; i++ ) {

					const validity = xmlElement.validity[ i ];

					signal.addValidity( parseFloat( validity.attr_fromLane ), parseFloat( validity.attr_toLane ) );

				}

			} else {

				const validity = xmlElement.validity;

				signal.addValidity( parseFloat( validity.attr_fromLane ), parseFloat( validity.attr_toLane ) );

			}
		}
	}

	public readSignalDependency ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

		if ( xmlElement.dependency != null && xmlElement.dependency !== '' ) {

			if ( Array.isArray( xmlElement.dependency ) ) {

				for ( let i = 0; i < xmlElement.dependency.length; i++ ) {

					const dependency = xmlElement.dependency[ i ];

					signal.addDependency( parseFloat( dependency.attr_id ), dependency.attr_type );

				}

			} else {

				const dependency = xmlElement.dependency;

				signal.addDependency( parseFloat( dependency.attr_id ), dependency.attr_type );

			}
		}
	}

	public readSurface ( road: TvRoad, xmlElement: XmlElement ) {

	}

	public readLaneSection ( road: TvRoad, xmlElement: XmlElement ) {

		const s = parseFloat( xmlElement.attr_s );
		const singleSide = xmlElement.attr_singleSide == 'true';

		road.addLaneSection( s, singleSide );

		const laneSection = road.getLastAddedLaneSection();

		this.readAsOptionalElement( xmlElement.left, xml => {
			this.readAsOptionalArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.LEFT );
			} );
		} );

		this.readAsOptionalElement( xmlElement.center, xml => {
			this.readAsOptionalArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.CENTER );
			} );
		} );

		this.readAsOptionalElement( xmlElement.right, xml => {
			this.readAsOptionalArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.RIGHT );
			} );
		} );

	}

	public readLane ( laneSection: TvLaneSection, xmlElement: XmlElement, laneSide: TvLaneSide ) {

		const id = parseFloat( xmlElement.attr_id );
		const type = xmlElement.attr_type;
		const level = xmlElement.attr_level == 'true';

		laneSection.addLane( laneSide, id, type, level, false );

		const lane = laneSection.getLastAddedLane();

		if ( xmlElement.link != null ) {

			const predecessorXml = xmlElement.link.predecessor;
			const successorXml = xmlElement.link.successor;

			if ( predecessorXml != null ) {

				lane.setPredecessor( parseInt( predecessorXml.attr_id ) );

			}

			if ( successorXml != null ) {

				lane.setSuccessor( parseInt( successorXml.attr_id ) );

			}
		}

		//  Read Width
		this.readAsOptionalArray( xmlElement.width, xml => this.readLaneWidth( lane, xml ) );

		//  Read RoadMark
		this.readAsOptionalArray( xmlElement.roadMark, xml => this.readLaneRoadMark( lane, xml ) );

		//  Read material
		this.readAsOptionalArray( xmlElement.material, xml => this.readLaneMaterial( lane, xml ) );

		//  Read visibility
		this.readAsOptionalArray( xmlElement.visibility, xml => this.readLaneVisibility( lane, xml ) );

		//  Read speed
		this.readAsOptionalArray( xmlElement.speed, xml => this.readLaneSpeed( lane, xml ) );

		//  Read access
		this.readAsOptionalArray( xmlElement.access, xml => this.readLaneAccess( lane, xml ) );

		//  Read height
		this.readAsOptionalArray( xmlElement.height, xml => this.readLaneHeight( lane, xml ) );

	}

	public readLaneWidth ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );

		const a = parseFloat( xmlElement.attr_a );
		const b = parseFloat( xmlElement.attr_b );
		const c = parseFloat( xmlElement.attr_c );
		const d = parseFloat( xmlElement.attr_d );

		lane.addWidthRecord( sOffset, a, b, c, d );

	}

	public readLaneRoadMark ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const type = xmlElement.attr_type;
		const weight = xmlElement.attr_weight;
		const color = xmlElement.attr_color;
		const width = parseFloat( xmlElement.attr_width );
		const laneChange = xmlElement.attr_laneChange;
		const height = xmlElement.attr_height;

		lane.addRoadMarkRecord( sOffset, type, weight, color, width, laneChange, height );

	}

	public readLaneMaterial ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const surface = xmlElement.attr_surface;
		const friction = parseFloat( xmlElement.attr_friction );
		const roughness = parseFloat( xmlElement.attr_roughness );

		lane.addMaterialRecord( sOffset, surface, friction, roughness );

	}

	public readLaneVisibility ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const forward = parseFloat( xmlElement.attr_forward );
		const back = parseFloat( xmlElement.attr_back );
		const left = parseFloat( xmlElement.attr_left );
		const right = parseFloat( xmlElement.attr_right );

		lane.addVisibilityRecord( sOffset, forward, back, left, right );

	}

	public readLaneSpeed ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const max = parseFloat( xmlElement.attr_max );
		const unit = xmlElement.attr_unit;

		lane.addSpeedRecord( sOffset, max, unit );

	}

	public readLaneAccess ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const restriction = xmlElement.attr_restriction;

		lane.addAccessRecord( sOffset, restriction );

	}

	public readLaneHeight ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const inner = parseFloat( xmlElement.attr_inner );
		const outer = parseFloat( xmlElement.attr_outer );

		lane.addHeightRecord( sOffset, inner, outer );

	}

	public readUserData ( xmlElement: XmlElement ): TvUserData[] {

		const response: TvUserData[] = [];

		if ( xmlElement.userData != null ) {

			if ( Array.isArray( xmlElement.userData ) ) {

				for ( let i = 0; i < xmlElement.userData.length; i++ ) {

					const userData = xmlElement.userData[ i ];

					response.push( new TvUserData( userData.attr_code, userData.attr_value ) );

				}

			} else {

				response.push( new TvUserData( xmlElement.userData.attr_code, xmlElement.userData.attr_value ) );

			}

		}

		return response;

	}

	public readLaneOffset ( road: TvRoad, xml: XmlElement ) {

		const s = parseFloat( xml.attr_s );
		const a = parseFloat( xml.attr_a );
		const b = parseFloat( xml.attr_b );
		const c = parseFloat( xml.attr_c );
		const d = parseFloat( xml.attr_d );

		road.addLaneOffset( s, a, b, c, d );
	}

	public readControl ( xml: XmlElement ): TvControllerControl {

		const signalId = parseFloat( xml.attr_signalId );
		const type = xml.attr_type;

		return new TvControllerControl( signalId, type );
	}
}
