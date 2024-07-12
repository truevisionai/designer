/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { AbstractReader } from 'app/importers/abstract-reader';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { readXmlArray, readXmlElement } from 'app/utils/xml-utils';
import { ScenarioEnvironment } from 'app/scenario/models/actions/scenario-environment';
import { ThreeService } from 'app/renderer/three.service';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { TvTransform } from 'app/map/models/tv-transform';
import {
	EnumHelper,
	TvColors,
	TvContactPoint,
	TvLaneSide,
	TvRoadMarkTypes,
	TvRoadMarkWeights,
	TvRoadType,
	TvUnit
} from 'app/map/models/tv-common';
import { TvUserData } from 'app/map/models/tv-user-data';
import { TvControllerControl } from 'app/map/signal-controller/tv-signal-controller';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionController } from 'app/map/models/junctions/tv-junction-controller';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { TvJunctionPriority } from 'app/map/models/junctions/tv-junction-priority';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvObjectMarking } from 'app/map/models/tv-object-marking';
import { TvRoadLinkType } from 'app/map/models/tv-road-link';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoadTypeClass } from 'app/map/models/tv-road-type.class';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Surface } from 'app/map/surface/surface.model';
import { XMLParser } from 'fast-xml-parser';
import { Euler, Object3D, Vector2, Vector3 } from 'three';
import { AssetDatabase } from '../../core/asset/asset-database';
import { TvConsole } from '../../core/utils/console';
import { SnackBar } from '../../services/snack-bar.service';
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { TvCornerRoad } from "../models/objects/tv-corner-road";
import { TvObjectOutline } from "../models/objects/tv-object-outline";
import { XmlElement } from "../../importers/xml.element";
import { TvObjectRepeat } from 'app/map/models/objects/tv-object-repeat';
import { TvRoadObjectSkeleton } from "../models/objects/tv-road-object-skeleton";
import { TvObjectPolyline } from "../models/objects/tv-object-polyline";
import { TvObjectVertexRoad } from "../models/objects/tv-object-vertex-road";
import { TvObjectVertexLocal } from "../models/objects/tv-object-vertex-local";
import { SplineSegment, SplineSegmentType } from "../../core/shapes/spline-segment";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { StorageService } from "../../io/storage.service";
import { AssetLoader } from "../../core/interfaces/asset.loader";
import { Asset } from 'app/core/asset/asset.model';
import { SplineControlPoint } from "../../objects/spline-control-point";
import { ControlPointFactory } from "../../factories/control-point.factory";
import { TvLineGeometry } from '../models/geometries/tv-line-geometry';
import { TvArcGeometry } from '../models/geometries/tv-arc-geometry';
import { TvSpiralGeometry } from '../models/geometries/tv-spiral-geometry';
import { TvPoly3Geometry } from '../models/geometries/tv-poly3-geometry';
import { TvParamPoly3Geometry } from '../models/geometries/tv-param-poly3-geometry';
import { SplineFactory } from 'app/services/spline/spline.factory';

@Injectable( {
	providedIn: 'root'
} )
export class SceneLoader extends AbstractReader implements AssetLoader {

	private map: TvMap;

	constructor (
		private threeService: ThreeService,
		private snackBar: SnackBar,
		private storage: StorageService,
	) {
		super();
	}

	load ( asset: Asset ) {

		const contents = this.storage.readSync( asset.path );

		return this.loadContents( contents );

	}

	loadContents ( contents: string ): TvMap {

		this.importFromString( contents );

		return this.map;

	}

	private importFromString ( contents: string ): boolean {

		this.map = new TvMap();

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			textNodeName: 'value',
			ignoreAttributes: false,
			supressEmptyNode: false,
			format: true,
			allowBooleanAttributes: true
		};

		const parser = new XMLParser( defaultOptions );

		const scene: any = parser.parse( contents );

		// check for main elements first before parsing
		const version = scene.version;
		const guid = scene.guid;

		if ( !version ) this.snackBar.error( 'Cannot read scene version. Please check scene file before importing', 'OK', 5000 );
		if ( !version ) console.error( 'Cannot read scene version', scene );
		if ( !version ) return;

		this.importScene( scene );

		return true;
	}

	private importScene ( xml: XmlElement ): void {

		this.readAsOptionalArray( xml.junction, xml => {

			const junction = this.parseJunction( xml );

			if ( xml.position ) {

				junction.position = new Vector3(
					parseFloat( xml.position.attr_x ),
					parseFloat( xml.position.attr_y ),
					parseFloat( xml.position.attr_z ),
				);
			}

			this.map.addJunctionInstance( junction );

		} );

		this.readAsOptionalArray( xml.road, xml => {

			this.map.addRoad( this.importRoad( xml ) );

		} );

		readXmlArray( xml.road, xml => {

			const road = this.map.getRoadById( parseInt( xml.attr_id ) );

			if ( xml.link != null ) {

				if ( road ) {

					this.parseRoadLinks( road, xml.link );

				} else {

					console.error( 'road not found', xml );

				}

			}

		} )

		this.readAsOptionalArray( xml.junction, xml => {

			this.parseJunctionConnections( this.map.getJunctionById( parseInt( xml.attr_id ) ), xml );

			this.parseJunctionPriorities( this.map.getJunctionById( parseInt( xml.attr_id ) ), xml );

			this.parseJunctionControllers( this.map.getJunctionById( parseInt( xml.attr_id ) ), xml );

		} );

		this.readAsOptionalArray( xml.spline, xml => {

			const spline = this.importSpline( xml );

			if ( !spline ) return;

			this.map.addSpline( spline );

		} );

		this.readAsOptionalArray( xml.prop, xml => {

			this.importProp( xml );

		} );

		this.readAsOptionalArray( xml.propCurve, xml => {

			this.map.propCurves.push( this.importPropCurve( xml ) );

		} );

		this.readAsOptionalArray( xml.propPolygon, xml => {

			this.map.propPolygons.push( this.importPropPolygon( xml ) );

		} );

		this.readAsOptionalArray( xml.surface, xml => {

			this.map.surfaces.push( this.importSurface( xml ) );

		} );

		this.readEnvironment( xml.environment );

	}

	private importSpline ( xml: XmlElement ): AbstractSpline | undefined {

		if ( xml?.attr_type === 'autov2' ) {

			return this.importAutoSplineV2( xml );

		}

		if ( xml?.attr_type === 'auto' ) {

			return this.importAutoSpline( xml );

		}

		TvConsole.error( 'unknown spline type:' + xml?.attr_type );
	}

	private readEnvironment ( xml: XmlElement ) {

		let environment: ScenarioEnvironment;

		if ( !xml ) {

			environment = new ScenarioEnvironment( 'Default' );

		} else {

			environment = ScenarioEnvironment.import( xml );

		}

		this.threeService.setEnvironment( environment, true );

	}

	private importProp ( xml: XmlElement ) {

		const propObject = this.preparePropObject( xml );

		const propInstance = new PropInstance( xml.attr_guid, propObject );

		this.map.props.push( propInstance );

	}

	private importRoad ( xml: XmlElement ): TvRoad {

		// if ( !xml.spline ) throw new Error( 'Incorrect road' );

		const name = xml.attr_name || 'untitled';
		const length = parseFloat( xml.attr_length );
		const id = parseInt( xml.attr_id );

		const junctionId = parseInt( xml.attr_junction ) || -1;
		const junction = this.map.getJunctionById( junctionId );

		const road = new TvRoad( name, length, id, junction );

		road.trafficRule = TvRoad.stringToRule( xml.attr_trafficRule );

		road.sStart = parseFloat( xml.attr_sStart ) ?? 0;

		road.drivingMaterialGuid = xml.drivingMaterialGuid;
		road.sidewalkMaterialGuid = xml.sidewalkMaterialGuid;
		road.borderMaterialGuid = xml.borderMaterialGuid;
		road.shoulderMaterialGuid = xml.shoulderMaterialGuid;

		this.importRoadSpline( xml.spline, road );

		this.parseRoadTypes( road, xml );

		if ( xml.elevationProfile != null ) this.parseElevationProfile( road, xml.elevationProfile );

		if ( xml.lateralProfile != null ) this.parseLateralProfile( road, xml.lateralProfile );

		if ( xml.lanes != null ) this.parseLanes( road, xml.lanes );

		if ( xml.objects != null && xml.objects !== '' ) this.parseObjects( road, xml.objects );

		if ( xml.signals != null && xml.signals !== '' ) this.parseSignals( road, xml.signals );

		// if ( xml.surface != null && xml.surface !== '' ) this.readSurface( road, xml.surface );

		return road;
	}

	private importSurface ( xml: XmlElement ): Surface {

		const rotation = parseFloat( xml.attr_rotation ) || 0.0;

		const material = xml.material?.attr_guid || 'grass';

		const offset = new Vector2(
			parseFloat( xml.offset?.attr_x || 0 ),
			parseFloat( xml.offset?.attr_y || 0 ),
		);

		const scale = new Vector2(
			parseFloat( xml.scale?.attr_x || 1 ),
			parseFloat( xml.scale?.attr_y || 1 ),
		);

		const spline = this.importCatmullSpline( xml.spline );

		const surface = new Surface( material, spline, offset, scale, rotation );

		surface.textureGuid = xml.texture?.attr_guid;

		surface.transparent = xml.material?.attr_transparent === 'true' ? true : false;

		surface.opacity = parseFloat( xml.material?.attr_opacity ) || 1.0;

		spline.controlPoints.forEach( p => p.mainObject = surface );

		return surface;
	}

	private importRoadSpline ( xml: XmlElement, road: TvRoad ): void {

		if ( !xml ) return;

		const type = xml.attr_type;

		// support for old version
		// convert auto to autov2 and add to spline list
		if ( type === 'auto' ) {

			const spline = this.importAutoSpline( xml );

			spline.segmentMap.set( 0, road );

			road.spline = spline;

			this.map.addSpline( spline );

			return;
		}

		if ( type === 'explicit' ) {

			road.spline = this.importExplicitSpline( xml, road );

			return;

		}

		console.error( 'unknown spline type', type );
	}

	private importExplicitSpline ( xml: XmlElement, road?: TvRoad ): ExplicitSpline {

		const geometries = []

		this.readAsOptionalArray( xml.geometry, xml => {

			const geometry = this.parseGeometry( xml );

			if ( geometry ) geometries.push( geometry );

		} );

		const spline: ExplicitSpline = SplineFactory.createExplicitSpline( geometries, road );

		if ( xml.attr_uuid ) spline.uuid = xml.attr_uuid;

		return spline;
	}

	private importAutoSpline ( xml: XmlElement ): AbstractSpline {

		const spline = new AutoSplineV2();

		this.readAsOptionalArray( xml.point, xml => {

			const position = this.importVector3( xml );

			const point = ControlPointFactory.createSplineControlPoint( spline, position );

			point.tagindex = spline.controlPoints.length;

			spline.controlPoints.push( point );

		} );

		this.map.addSpline( spline );

		return spline;

	}

	private importAutoSplineV2 ( xml: XmlElement ): AutoSplineV2 {

		const spline = new AutoSplineV2();

		if ( xml.attr_uuid ) spline.uuid;

		this.readAsOptionalArray( xml.point, xml => {

			const position = this.importVector3( xml );

			const point = new SplineControlPoint( spline, position );

			point.tagindex = spline.controlPoints.length;

			spline.controlPoints.push( point );

		} );

		this.readAsOptionalArray( xml.roadSegment, xml => {

			const start = parseFloat( xml.attr_start );
			// roadId for old file
			const id = parseInt( xml.attr_id || xml.attr_roadId || xml.attr_road_id );
			const type = SplineSegment.stringToType( xml.attr_type );

			if ( type == SplineSegmentType.ROAD ) {

				const road = this.map.getRoadById( id );
				spline.segmentMap.set( start, road );

			} else if ( type == SplineSegmentType.JUNCTION ) {

				const junction = this.map.getJunctionById( id );
				spline.segmentMap.set( start, junction );

			} else {

				// to support old files
				if ( id != -1 ) {
					const road = this.map.getRoadById( id );
					if ( !road ) return;
					spline.segmentMap.set( start, road );
				}

			}

		} );

		return spline;
	}

	private importCatmullSpline ( xml: XmlElement, mainObject?: any ): CatmullRomSpline {

		const type = xml.attr_type || 'catmullrom';
		const closed = xml.attr_closed === 'true';
		const tension = 0.0; // we ignore this as we want straight lines, parseFloat( xml.attr_tension ) || 0.5;

		const spline = new CatmullRomSpline( closed, type, tension );

		this.readAsOptionalArray( xml.point, xml => {

			const position = this.importVector3( xml );

			const controlPoint = new SimpleControlPoint( mainObject, position );

			controlPoint.tagindex = spline.controlPoints.length;

			spline.controlPoints.push( controlPoint );

		} );

		return spline;
	}

	private importVector3 ( xml: XmlElement ): Vector3 {

		return new Vector3(
			parseFloat( xml.attr_x ),
			parseFloat( xml.attr_y ),
			parseFloat( xml.attr_z ),
		);

	}

	private importPropCurve ( xml: XmlElement ): PropCurve {

		const guid = xml.attr_guid;

		const meta = AssetDatabase.getMetadata( guid );

		if ( !meta ) return;

		const spline = this.importCatmullSpline( xml.spline );
		const reverse = xml.attr_reverse === 'true' ? true : false;
		const rotation = parseFloat( xml.attr_rotation ) || 0;
		const spacing = parseFloat( xml.attr_spacing ) || 5;
		const positionVariance = parseFloat( xml.attr_positionVariance ) || 0;

		const curve = new PropCurve( guid, spline, spacing, rotation, positionVariance, reverse );

		spline.controlPoints.forEach( p => p.mainObject = curve );

		this.readAsOptionalArray( xml.props, propXml => {

			const instance = AssetDatabase.getPropObject( propXml.attr_guid );

			const prop = instance.clone();

			const position = this.importVector3( propXml?.position );

			const rotation = this.importVector3( propXml?.rotation );

			const scale = this.importVector3( propXml?.scale );

			curve.addProp( prop, position, rotation, scale );

		} );

		return curve;
	}

	private importPropPolygon ( xml: XmlElement ): PropPolygon {

		const id = xml.attr_id;

		const polygonPropGuid = xml.attr_guid;

		const density = parseFloat( xml.attr_density ) || 0.5;

		const spline = this.importCatmullSpline( xml.spline );

		const polygon = new PropPolygon( polygonPropGuid, spline, density );

		if ( id ) polygon.id = id;

		spline.controlPoints.forEach( point => point.mainObject = polygon );

		this.readAsOptionalArray( xml.props || xml.prop, prop => {

			const guid = prop.attr_guid || polygonPropGuid;

			const transform = this.importTransform( prop.transform || prop );

			polygon.addTransform( guid, transform );

		} );

		return polygon;
	}

	private importTransform ( xml: XmlElement ): TvTransform {

		const position = new Vector3(
			parseFloat( xml.position.attr_x ) || 0,
			parseFloat( xml.position.attr_y ) || 0,
			parseFloat( xml.position.attr_z ) || 0,
		);

		const rotation = new Euler(
			parseFloat( xml.rotation.attr_x ) || 0,
			parseFloat( xml.rotation.attr_y ) || 0,
			parseFloat( xml.rotation.attr_z ) || 0,
		);

		const scale = new Vector3(
			parseFloat( xml.scale.attr_x ) || 1,
			parseFloat( xml.scale.attr_y ) || 1,
			parseFloat( xml.scale.attr_z ) || 1,
		);

		return new TvTransform( position, rotation, scale );

	}

	private preparePropObject ( xml: XmlElement ): Object3D {

		const instance = AssetDatabase.getPropObject( xml.attr_guid );

		if ( !instance ) TvConsole.error( `Object not found` );

		if ( !instance ) return;

		const prop = instance.clone();

		const position = new Vector3(
			parseFloat( xml.position.attr_x ) || 0,
			parseFloat( xml.position.attr_y ) || 0,
			parseFloat( xml.position.attr_z ) || 0,
		);

		const rotation = new Euler(
			parseFloat( xml.rotation.attr_x ) || 0,
			parseFloat( xml.rotation.attr_y ) || 0,
			parseFloat( xml.rotation.attr_z ) || 0,
		);

		const scale = new Vector3(
			parseFloat( xml.scale.attr_x ) || 1,
			parseFloat( xml.scale.attr_y ) || 1,
			parseFloat( xml.scale.attr_z ) || 1,
		);

		prop.position.copy( position );

		prop.rotation.copy( rotation );

		prop.scale.copy( scale );

		return prop;
	}

	private parseRoadLinks ( road: TvRoad, xmlElement: XmlElement ) {

		if ( xmlElement.predecessor != null ) {

			this.parseRoadLink( road, xmlElement.predecessor, 0 );

		}

		if ( xmlElement.successor != null ) {

			this.parseRoadLink( road, xmlElement.successor, 1 );

		}

		if ( xmlElement.neighbor != null ) {

			if ( Array.isArray( xmlElement.neighbor ) ) {

				for ( let i = 0; i < xmlElement.neighbor.length; i++ ) {

					this.parseRoadLink( road, xmlElement.neighbor[ i ], 2 );

				}

			} else {

				this.parseRoadLink( road, xmlElement.neighbor, 2 );

			}
		}
	}

	private parseRoadLink ( road: TvRoad, xml: XmlElement, type: number ) {

		const elementType = this.parseElementType( xml.attr_elementType );
		const elementId = parseFloat( xml.attr_elementId );
		const contactPoint = this.parseContactPoint( xml.attr_contactPoint );

		let element: TvRoad | TvJunction;

		if ( elementType == TvRoadLinkType.road ) {

			element = this.map.getRoadById( elementId );

		} else if ( elementType == TvRoadLinkType.junction ) {

			element = this.map.getJunctionById( elementId );

		} else {

			console.error( 'unknown element type', elementType );

			return;

		}

		if ( type === 0 ) {

			road.setPredecessor( elementType, element, contactPoint );

		} else if ( type === 1 ) {

			road.setSuccessor( elementType, element, contactPoint );

		} else if ( type === 2 ) {

			console.error( 'neighbour not supported' );

			// const side = xmlElement.attr_side;
			// const elementId = xmlElement.attr_elementId;
			// const direction = xmlElement.attr_direction;
			//
			// road.setNeighbor( side, elementId, direction );

		}

	}

	private parseElementType ( value: string ): TvRoadLinkType {

		if ( value === 'road' ) {

			return TvRoadLinkType.road;

		} else if ( value === 'junction' ) {

			return TvRoadLinkType.junction;

		} else {

			return null;

		}

	}

	private parseContactPoint ( value: string ): TvContactPoint {

		if ( value === 'start' ) {

			return TvContactPoint.START;

		} else if ( value === 'end' ) {

			return TvContactPoint.END;

		} else {

			return null;

		}

	}

	private parseRoadTypes ( road: TvRoad, xmlElement: XmlElement ) {

		// if ( !xmlElement.type ) console.warn( 'no road type tag not present' );

		readXmlArray( xmlElement.type, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );

			const roadType = TvRoadTypeClass.stringToTypes( xml.attr_type );

			let maxSpeed = 0;

			let unit = TvUnit.MILES_PER_HOUR;

			readXmlElement( xml.speed, xml => {

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

	private parseGeometry ( xml: XmlElement ) {

		const s = parseFloat( xml.attr_s );
		const x = parseFloat( xml.attr_x );
		const y = parseFloat( xml.attr_y );
		let hdg = parseFloat( xml.attr_hdg );
		const length = parseFloat( xml.attr_length );

		// unsure of this, but works well so far
		// hdg += Maths.M_PI_2;

		// NO NEED FOR THIS
		// because of threejs co-ordinate system
		// x will become y and y will become x
		// const x = parsedX * -1;
		// const y = parsedY;

		if ( xml.line != null ) {

			return new TvLineGeometry( s, x, y, hdg, length );

		} else if ( xml.arc != null ) {

			const curvature = parseFloat( xml.arc.attr_curvature );

			return new TvArcGeometry( s, x, y, hdg, length, curvature );

		} else if ( xml.spiral != null ) {

			const curvStart = parseFloat( xml.spiral.attr_curvStart );
			const curvEnd = parseFloat( xml.spiral.attr_curvEnd );

			return new TvSpiralGeometry( s, x, y, hdg, length, curvStart, curvEnd );

		} else if ( xml.poly3 != null ) {

			const a = parseFloat( xml.poly3.attr_a );
			const b = parseFloat( xml.poly3.attr_b );
			const c = parseFloat( xml.poly3.attr_c );
			const d = parseFloat( xml.poly3.attr_d );

			return new TvPoly3Geometry( s, x, y, hdg, length, a, b, c, d );

		} else if ( xml.paramPoly3 != null ) {

			const pRange = xml.paramPoly3.attr_pRange;

			const aU = parseFloat( xml.paramPoly3.attr_aU );
			const bU = parseFloat( xml.paramPoly3.attr_bU );
			const cU = parseFloat( xml.paramPoly3.attr_cU );
			const dU = parseFloat( xml.paramPoly3.attr_dU );

			const aV = parseFloat( xml.paramPoly3.attr_aV );
			const bV = parseFloat( xml.paramPoly3.attr_bV );
			const cV = parseFloat( xml.paramPoly3.attr_cV );
			const dV = parseFloat( xml.paramPoly3.attr_dV );

			return new TvParamPoly3Geometry( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV, pRange );

		} else {

			console.error( 'unknown geometry type', xml );

		}

	}

	private parseJunction ( xmlElement: XmlElement ): TvJunction {

		const name = xmlElement.attr_name;
		const id = parseInt( xmlElement.attr_id );

		return new TvJunction( name, id );

	}

	private parseJunctionConnections ( junction: TvJunction, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.connection, xml => {

			const connection = this.parseJunctionConnection( xml, junction );

			if ( !connection ) return;

			junction.addConnection( connection );

		} );

	}

	private parseJunctionPriorities ( junction: TvJunction, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.priority, xml => {

			junction.addPriority( this.parseJunctionPriority( xml ) );

		} );

	}

	private parseJunctionControllers ( junction: TvJunction, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.controller, xml => {

			junction.controllers.push( this.parseJunctionController( xml ) );

		} );

	}

	private parseJunctionConnection ( xmlElement: XmlElement, junction: TvJunction ) {

		const id = parseInt( xmlElement.attr_id );
		const incomingRoadId = parseInt( xmlElement.attr_incomingRoad );
		const connectingRoadId = parseInt( xmlElement.attr_connectingRoad );
		const contactPoint = this.parseContactPoint( xmlElement.attr_contactPoint );

		const incomingRoad = !isNaN( incomingRoadId ) ? this.map.getRoadById( incomingRoadId ) : null;
		const connectingRoad = !isNaN( connectingRoadId ) ? this.map.getRoadById( connectingRoadId ) : null;

		if ( !connectingRoad ) {
			TvConsole.error( 'connectingRoad not found with id:' + connectingRoadId );
			return;
		}

		const outgoingRoadId = contactPoint == TvContactPoint.START ?
			connectingRoad?.successor?.id :
			connectingRoad?.predecessor?.id;

		const outgoingRoad = !isNaN( outgoingRoadId ) ? this.map.getRoadById( outgoingRoadId ) : null;

		if ( !outgoingRoad ) {
			TvConsole.error( 'outgoingRoad not found with id:' + outgoingRoadId );
			return;
		}

		const connection = new TvJunctionConnection( id, incomingRoad, connectingRoad, contactPoint, outgoingRoad );

		connection.junction = junction;

		readXmlArray( xmlElement.laneLink, xml => {

			const laneLink = this.parseJunctionConnectionLaneLink( xml, junction, connection );

			if ( !laneLink ) return;

			connection.addLaneLink( laneLink );

		} );

		return connection;
	}

	private parseJunctionConnectionLaneLink ( xmlElement: XmlElement, junction: TvJunction, connection: TvJunctionConnection ): TvJunctionLaneLink {

		const fromLaneId = parseInt( xmlElement.attr_from );
		const toLaneId = parseInt( xmlElement.attr_to );

		function findContactPoint ( incomingRoad: TvRoad ) {

			if ( incomingRoad.successor?.id === junction.id ) {
				return TvContactPoint.END;
			}

			if ( incomingRoad.predecessor?.id === junction.id ) {
				return TvContactPoint.START;
			}

			return null;
		}

		if ( !connection.incomingRoad ) {
			return;
		}

		// contact point of the incoming road with junction
		const incomingContactPoint = findContactPoint( connection.incomingRoad );

		if ( !incomingContactPoint ) {
			TvConsole.error( 'contact point not found' );
			console.error( 'contact point not found', xmlElement );
			return;
		}

		const incomingLaneSection = connection.incomingRoad.getLaneSectionAtContact( incomingContactPoint );
		const connectionLaneSection = connection.connectingRoad.getLaneSectionAtContact( connection.contactPoint );

		if ( !incomingLaneSection ) {
			TvConsole.error( 'incoming lane section not found' );
			console.error( 'contact point not found', xmlElement );
			return;
		}

		if ( !connectionLaneSection ) {
			TvConsole.error( 'connection lane section not found' );
			console.error( 'contact point not found', xmlElement );
			return;
		}

		const fromLane = incomingLaneSection.getLaneById( fromLaneId );
		const toLane = connectionLaneSection.getLaneById( toLaneId );

		if ( !fromLane ) {
			TvConsole.error( 'from lane not found' );
			console.error( 'from lane not found', xmlElement );
			return;
		}

		if ( !toLane ) {
			TvConsole.error( 'to lane not found' );
			console.error( 'to lane not found', xmlElement );
			return;
		}

		const link = new TvJunctionLaneLink( fromLane, toLane );

		link.incomingRoad = connection.incomingRoad;
		link.incomingContactPoint = incomingContactPoint;

		link.connectingRoad = connection.connectingRoad;
		link.connectingContactPoint = connection.contactPoint;

		return link;

	}

	private parseJunctionPriority ( xmlElement: XmlElement ): TvJunctionPriority {

		const high = parseInt( xmlElement.attr_high );
		const low = parseInt( xmlElement.attr_low );

		return new TvJunctionPriority( high, low );
	}

	private parseJunctionController ( xmlElement: XmlElement ): TvJunctionController {

		const id = parseInt( xmlElement.attr_id );
		const type = xmlElement.attr_type;
		const sequence = parseInt( xmlElement.attr_sequence );

		return new TvJunctionController( id, type, sequence );
	}

	private parseElevationProfile ( road: TvRoad, xmlElement: XmlElement ) {

		road.addElevationProfile();

		readXmlArray( xmlElement.elevation, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );
			const a = parseFloat( xml.attr_a );
			const b = parseFloat( xml.attr_b );
			const c = parseFloat( xml.attr_c );
			const d = parseFloat( xml.attr_d );

			road.addElevation( s, a, b, c, d );

		} );

	}

	private parseLateralProfile ( road: TvRoad, xmlElement: XmlElement ) {

	}

	private parseLanes ( road: TvRoad, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.laneSection, ( xml ) => {

			this.parseLaneSection( road, xml );

		} );

		readXmlArray( xmlElement.laneOffset, ( xml ) => {

			this.parseLaneOffset( road, xml );

		} );

		// if ( xmlElement.laneSection != null ) {
		//
		//     if ( Array.isArray( xmlElement.laneSection ) ) {
		//
		//         for ( let i = 0; i < xmlElement.laneSection.length; i++ ) {
		//
		//             this.parseLaneSections( road, xmlElement.laneSection[i] );
		//
		//         }
		//
		//     } else {
		//
		//         this.parseLaneSections( road, xmlElement.laneSection );
		//
		//     }
		// }
	}

	private parseObjects ( road: TvRoad, xmlElement: XmlElement ) {

		// @ts-ignore
		if ( xmlElement != null && xmlElement !== '' ) {

			if ( Array.isArray( xmlElement.object ) ) {

				for ( let i = 0; i < xmlElement.object.length; i++ ) {

					road.addRoadObjectInstance( this.parseObject( road, xmlElement.object[ i ] ) );

				}
			} else {

				road.addRoadObjectInstance( this.parseObject( road, xmlElement.object ) );

			}
		}
	}

	private parseObject ( road: TvRoad, xmlElement: XmlElement ) {

		const type = xmlElement.attr_type;
		const name = xmlElement.attr_name;
		const id = parseFloat( xmlElement.attr_id ) || 0;
		const s = parseFloat( xmlElement.attr_s ) || 0;
		const t = parseFloat( xmlElement.attr_t ) || 0;
		const zOffset = parseFloat( xmlElement.attr_zOffset ) || 0.005;
		const validLength = parseFloat( xmlElement.attr_validLength ) || 0;

		const length = parseFloat( xmlElement.attr_length ) || 1;
		const width = parseFloat( xmlElement.attr_width ) || 1;
		const radius = parseFloat( xmlElement.attr_radius ) || 0;
		const height = parseFloat( xmlElement.attr_height ) || 0;
		const hdg = parseFloat( xmlElement.attr_hdg ) || 0;
		const pitch = parseFloat( xmlElement.attr_pitch ) || 0;
		const roll = parseFloat( xmlElement.attr_roll ) || 0;

		const orientation = TvRoadObject.orientationFromString( xmlElement.attr_orientation );

		const roadObject = new TvRoadObject( type, name, id, s, t, zOffset, validLength, orientation, length, width, radius, height, hdg, pitch, roll );

		roadObject.assetGuid = xmlElement.attr_assetGuid;

		readXmlArray( xmlElement.outlines?.outline, xml => {

			roadObject.outlines.push( this.parseObjectOutline( xml, road ) );

		} );

		readXmlArray( xmlElement.markings?.marking, xml => {

			roadObject.markings.push( this.parseObjectMarking( xml, road ) );

		} );

		roadObject.userData = this.parseUserData( xmlElement );

		readXmlArray( xmlElement.repeat, xml => {

			roadObject.addRepeatObject( this.parseRoadObjectRepeat( roadObject, xml ) );

		} )

		readXmlElement( xmlElement.skeleton, xml => {

			roadObject.skeleton = this.parseObjectSkeleton( xml );

		} );

		return roadObject;

	}

	parseObjectSkeleton ( xml: XmlElement ): TvRoadObjectSkeleton {

		const skeleton = new TvRoadObjectSkeleton();

		readXmlArray( xml.polyline, xml => {

			const polyline = this.parseObjectPolyline( xml );

			skeleton.polylines.push( polyline );

		} );

		return skeleton;

	}

	parseObjectPolyline ( xml: XmlElement ): TvObjectPolyline {

		const id = parseFloat( xml.attr_id ) || 0;

		const polyline = new TvObjectPolyline( id );

		readXmlArray( xml.vertexRoad, xml => {

			polyline.vertices.push( this.parserVertexRoad( xml ) );

		} );

		readXmlArray( xml.vertexLocal, xml => {

			polyline.vertices.push( this.parserVertexLocal( xml ) );

		} );

		return polyline;
	}

	parserVertexRoad ( xml: XmlElement ): TvObjectVertexRoad {

		const id = parseFloat( xml.attr_id ) || 0;
		const s = parseFloat( xml.attr_s ) || 0;
		const t = parseFloat( xml.attr_t ) || 0;
		const dz = parseFloat( xml.attr_dz ) || 0;
		const radius = parseFloat( xml.attr_radius ) || 0;
		const intersectionPoint = xml.attr_intersectionPoint === 'true' ? true : false;

		return new TvObjectVertexRoad( id, s, t, dz, null, radius, intersectionPoint );

	}

	parserVertexLocal ( xml: XmlElement ): TvObjectVertexLocal {

		const id = parseFloat( xml.attr_id ) || 0;
		const u = parseFloat( xml.attr_u ) || 0;
		const v = parseFloat( xml.attr_v ) || 0;
		const z = parseFloat( xml.attr_z ) || 0;
		const radius = parseFloat( xml.attr_radius ) || 0;
		const intersectionPoint = xml.attr_intersectionPoint === 'true' ? true : false;

		return new TvObjectVertexLocal( id, new Vector3( u, v, z ), null, radius, intersectionPoint );

	}

	private parseObjectMarking ( xml: XmlElement, road: TvRoad ): TvObjectMarking {

		const color = xml.attr_color;
		const spaceLength = parseFloat( xml.attr_spaceLength );
		const lineLength = parseFloat( xml.attr_lineLength );
		const side = xml.attr_side;
		const weight = xml.attr_weight;
		const startOffset = parseFloat( xml.attr_startOffset );
		const stopOffset = parseFloat( xml.attr_stopOffset );
		const zOffset = parseFloat( xml.attr_zOffset );
		const width = parseFloat( xml.attr_width );

		const marking = new TvObjectMarking( color, spaceLength, lineLength, side, weight, startOffset, stopOffset, zOffset, width );

		if ( xml.attr_materialGuid ) marking.materialGuid = xml.attr_materialGuid;

		readXmlArray( xml.cornerReference, xml => {
			marking.cornerReferences.push( parseFloat( xml.attr_id ) );
		} );

		return marking;
	}

	private parseObjectOutline ( xml: XmlElement, road: TvRoad ): TvObjectOutline {

		const outline = new TvObjectOutline();

		outline.id = parseFloat( xml.attr_id ) || 0;

		readXmlArray( xml.cornerRoad, xml =>
			outline.cornerRoad.push( this.parseCornerRoad( xml, road ) )
		);

		return outline;
	}

	private parseCornerRoad ( xml: XmlElement, road: TvRoad ): TvCornerRoad {

		const id = parseFloat( xml.attr_id );
		const s = parseFloat( xml.attr_s );
		const t = parseFloat( xml.attr_t );
		const dz = parseFloat( xml.attr_dz );
		const height = parseFloat( xml.attr_height );

		return new TvCornerRoad( id, road, s, t, dz, height );

	}

	private parseRoadObjectRepeat ( roadObject: TvRoadObject, xmlElement: XmlElement ): TvObjectRepeat {

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

		const repeat = new TvObjectRepeat( s, length, distance, tStart, tEnd, widthStart, widthEnd, heightStart, heightEnd, zOffsetStart, zOffsetEnd );

		repeat.lengthStart = parseFloat( xmlElement.attr_lengthStart );
		repeat.lengthEnd = parseFloat( xmlElement.attr_lengthEnd );

		return repeat;
	}

	private parseSignals ( road: TvRoad, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.signal, x => this.parseSignal( road, x ) );

	}

	private parseSignal ( road: TvRoad, xmlElement: XmlElement ) {

		function findAvailableId ( id: number, road: TvRoad ) {

			while ( road.signals.has( id ) ) {
				id++;
			}

			return id;

		}

		let id = parseFloat( xmlElement.attr_id ) || road.signals.size;

		const s = parseFloat( xmlElement.attr_s ) || 0;
		const t = parseFloat( xmlElement.attr_t ) || 0;
		const name = xmlElement.attr_name;
		const dynamic = xmlElement.attr_dynamic;
		const orientation = xmlElement.attr_orientation;
		const zOffset = parseFloat( xmlElement.attr_zOffset ) || 0;
		const country = xmlElement.attr_country;
		const type = xmlElement.attr_type;
		const subtype = xmlElement.attr_subtype;
		const value = xmlElement.attr_value;
		const unit = xmlElement.attr_unit;
		const height = parseFloat( xmlElement.attr_height ) || 1;
		const width = parseFloat( xmlElement.attr_width ) || 1;
		const text = xmlElement.attr_text;
		const hOffset = parseFloat( xmlElement.attr_hOffset ) || 0;
		const pitch = parseFloat( xmlElement.attr_pitch ) || 0;
		const roll = parseFloat( xmlElement.attr_roll ) || 0;

		if ( road.signals.has( id ) ) {
			// TEMP FIX
			TvConsole.warn( `Signal with id ${ id } already exists, incrementing id to add it ` + road.toString() );
			id = findAvailableId( id, road );
		}

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

		roadSignal.assetGuid = xmlElement.attr_assetGuid;

		this.parseSignalValidity( roadSignal, xmlElement );

		this.parseSignalDependency( roadSignal, xmlElement );

		this.parseUserData( xmlElement ).forEach( i => roadSignal.userData.set( i.code, i.value ) );

		if ( !roadSignal.assetGuid && roadSignal.userData.has( 'assetGuid' ) ) {

			roadSignal.assetGuid = roadSignal.userData.get( 'assetGuid' ) as string;

		}
	}

	private parseSignalValidity ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

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

	private parseSignalDependency ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

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

	private parseSurface ( road: TvRoad, xmlElement: XmlElement ) {

	}

	private parseLaneSection ( road: TvRoad, xmlElement: XmlElement ) {

		const id = road.laneSections.length + 1;
		const s = parseFloat( xmlElement.attr_s );
		const singleSide = xmlElement.attr_singleSide == 'true';

		const laneSection = new TvLaneSection( id, s, singleSide, road );

		readXmlElement( xmlElement.left, xml => {
			readXmlArray( xml.lane, xml => {
				this.parseLane( laneSection, xml, TvLaneSide.LEFT );
			} );
		} );

		readXmlElement( xmlElement.center, xml => {
			readXmlArray( xml.lane, xml => {
				this.parseLane( laneSection, xml, TvLaneSide.CENTER );
			} );
		} );

		readXmlElement( xmlElement.right, xml => {
			readXmlArray( xml.lane, xml => {
				this.parseLane( laneSection, xml, TvLaneSide.RIGHT );
			} );
		} );

		road.addLaneSectionInstance( laneSection );
	}

	private parseLane ( laneSection: TvLaneSection, xmlElement: XmlElement, laneSide: TvLaneSide ) {

		const id = parseFloat( xmlElement.attr_id );
		const type = TvLane.stringToType( xmlElement.attr_type );
		const level = xmlElement.attr_level == 'true';

		const lane = laneSection.addLane( laneSide, id, type, level, false );

		lane.threeMaterialGuid = xmlElement?.attr_materialGuid || null;

		if ( xmlElement?.attr_direction ) {
			lane.direction = xmlElement.attr_direction;
		}

		if ( xmlElement.link != null ) {

			const predecessorXml = xmlElement.link.predecessor;
			const successorXml = xmlElement.link.successor;

			if ( predecessorXml != null ) {

				lane.predecessorId = ( parseInt( predecessorXml.attr_id ) );

			}

			if ( successorXml != null ) {

				lane.successorId = ( parseInt( successorXml.attr_id ) );

			}
		}

		//  Read Width
		readXmlArray( xmlElement.width, xml => this.parseLaneWidth( lane, xml ) );

		//  Read RoadMark
		readXmlArray( xmlElement.roadMark, xml => lane.addRoadMarkInstance( this.parseLaneRoadMark( lane, xml ) ) );

		//  Read material
		readXmlArray( xmlElement.material, xml => this.parseLaneMaterial( lane, xml ) );

		//  Read visibility
		readXmlArray( xmlElement.visibility, xml => this.parseLaneVisibility( lane, xml ) );

		//  Read speed
		readXmlArray( xmlElement.speed, xml => this.parseLaneSpeed( lane, xml ) );

		//  Read access
		readXmlArray( xmlElement.access, xml => this.parseLaneAccess( lane, xml ) );

		//  Read height
		readXmlArray( xmlElement.height, xml => this.parseLaneHeight( lane, xml ) );

	}

	private parseLaneWidth ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );

		const a = parseFloat( xmlElement.attr_a );
		const b = parseFloat( xmlElement.attr_b );
		const c = parseFloat( xmlElement.attr_c );
		const d = parseFloat( xmlElement.attr_d );

		lane.addWidthRecord( sOffset, a, b, c, d );

	}

	private parseLaneRoadMark ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset ) || 0;
		const type = xmlElement.attr_type || TvRoadMarkTypes.SOLID;
		const weight = xmlElement.attr_weight || TvRoadMarkWeights.STANDARD;
		const color = xmlElement.attr_color || TvColors.STANDARD;
		const width = parseFloat( xmlElement.attr_width ) || 0.3;
		const laneChange = TvLaneRoadMark.laneChangeFromString( xmlElement.attr_laneChange );
		const height = parseFloat( xmlElement.attr_height ) || 0;
		const length = parseFloat( xmlElement.attr_length ) || 3.0;
		const space = parseFloat( xmlElement.attr_space ) || 0;
		const materialGuid = xmlElement.attr_materialGuid;

		return new TvLaneRoadMark( sOffset, type, weight, color, width, laneChange, height, lane, length, space, materialGuid )

	}

	private parseLaneMaterial ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const surface = xmlElement.attr_surface;
		const friction = parseFloat( xmlElement.attr_friction );
		const roughness = parseFloat( xmlElement.attr_roughness );

		lane.addMaterialRecord( sOffset, surface, friction, roughness );

	}

	private parseLaneVisibility ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const forward = parseFloat( xmlElement.attr_forward );
		const back = parseFloat( xmlElement.attr_back );
		const left = parseFloat( xmlElement.attr_left );
		const right = parseFloat( xmlElement.attr_right );

		lane.addVisibilityRecord( sOffset, forward, back, left, right );

	}

	private parseLaneSpeed ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const max = parseFloat( xmlElement.attr_max );
		const unit = xmlElement.attr_unit;

		lane.addSpeedRecord( sOffset, max, unit );

	}

	private parseLaneAccess ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const restriction = xmlElement.attr_restriction;

		lane.addAccessRecord( sOffset, restriction );

	}

	private parseLaneHeight ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const inner = parseFloat( xmlElement.attr_inner );
		const outer = parseFloat( xmlElement.attr_outer );

		lane.addHeightRecord( sOffset, inner, outer );

	}

	private parseUserData ( xmlElement: XmlElement ): TvUserData[] {

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

	private parseLaneOffset ( road: TvRoad, xml: XmlElement ) {

		const s = parseFloat( xml.attr_s );
		const a = parseFloat( xml.attr_a );
		const b = parseFloat( xml.attr_b );
		const c = parseFloat( xml.attr_c );
		const d = parseFloat( xml.attr_d );

		road.addLaneOffset( s, a, b, c, d );
	}

	private parseControl ( xml: XmlElement ): TvControllerControl {

		const signalId = parseFloat( xml.attr_signalId );
		const type = xml.attr_type;

		return new TvControllerControl( signalId, type );
	}
}
