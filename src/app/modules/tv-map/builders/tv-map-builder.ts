/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { BufferGeometry, MeshBasicMaterial, MeshStandardMaterial, Vector2, Vector3 } from 'three';
import { SceneService } from '../../../services/scene.service';
import { TvObjectType } from '../interfaces/i-tv-object';
import { MeshGeometryData } from '../models/mesh-geometry.data';
import { ObjectTypes, TvLaneSide, TvLaneType } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvMap } from '../models/tv-map.model';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';
import { Vertex } from '../models/vertex';
import { TvMapInstance } from '../services/tv-map-instance';
import { LaneRoadMarkFactory } from '../../../factories/lane-road-mark-factory';
import { OdBuilderConfig } from './od-builder-config';
import { RoadObjectService } from 'app/tools/marking-line/road-object.service';
import { RoadSignalService } from 'app/services/signal/road-signal.service';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { OdMaterials } from './od-materials.service';

export class TvMapBuilder {

	private static roadMarkBuilder = new LaneRoadMarkFactory();
	// private static roadMarkBuilder = new OdRoadMarkBuilderV1();

	private static JUNCTION_ELEVATION_SHIFT = 0.005;

	constructor () {

	}

	public static buildMap ( map?: TvMap ): GameObject {

		SceneService.removeFromMain( map.gameObject );

		map.gameObject = null;
		map.gameObject = new GameObject( 'OpenDrive' );

		map.roads.forEach( road => {

			this.buildRoad( map.gameObject, road );

		} );

		SceneService.addToMain( map.gameObject );

		return map.gameObject;

	}

	/**
	 *
	 * @param parent
	 * @param road
	 * @param buildJunctions
	 * @deprecated
	 */
	static buildRoad ( parent: GameObject, road: TvRoad, buildJunctions = true ): any {

		// if ( road.isJunction ) return;

		road.gameObject = null;
		road.gameObject = new GameObject( 'Road:' + road.id );
		road.gameObject.Tag = ObjectTypes.ROAD;
		road.gameObject.userData.road = road;

		road.computeLaneSectionCoordinates();

		const laneSections = road.lanes.getLaneSections();

		for ( let i = 0; i < laneSections.length; i++ ) {

			this.buildLaneSection( road, laneSections[ i ] );

		}

		this.roadMarkBuilder.buildRoad( road );

		this.buildRoadObjects( road );

		this.buildRoadSignals( road );

		parent.add( road.gameObject );

	}

	static buildRoadSignals ( road: TvRoad ) {

		RoadSignalService.instance.buildSignals( road );

	}

	static buildRoadObjects ( road: TvRoad ) {

		RoadObjectService.instance.buildRoadObjects( road );

	}

	/**
	 *
	 * @param road
	 * @param buildJunctions
	 * @deprecated
	 */
	static rebuildRoad ( road: TvRoad, buildJunctions = true ): any {

		TvMapInstance.map.gameObject.remove( road.gameObject );

		this.buildRoad( TvMapInstance.map.gameObject, road, buildJunctions );

	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @deprecated
	 */
	static buildLaneSection ( road: TvRoad, laneSection: TvLaneSection ): void {

		laneSection.gameObject = null;
		laneSection.gameObject = new GameObject( 'LaneSection' );

		road.gameObject.add( laneSection.gameObject );

		TvMapBuilder.buildLanes( laneSection.getLeftLanes().reverse(), road, laneSection );

		TvMapBuilder.createCenterLane( laneSection.getLastCenterLane(), laneSection, road );

		TvMapBuilder.buildLanes( laneSection.getRightLanes(), road, laneSection );

		// console.timeEnd( 'lane-build-time' );
	}

	static createCenterLane ( lane: TvLane, laneSection: TvLaneSection, road: TvRoad ) {

		const geometry = new BufferGeometry();

		geometry.name = 'center-lane';

		this.createLaneGameObject( lane, geometry, new MeshBasicMaterial(), laneSection );

	}

	static buildLanes ( lanes: TvLane[], road: TvRoad, laneSection: TvLaneSection ): any {

		// console.time( 'lane-build-time' );

		for ( let i = 0; i < lanes.length; i++ ) {

			this.buildLane( lanes[ i ], laneSection, road );

		}

	}

	static buildLane ( lane: TvLane, laneSection: TvLaneSection, road: TvRoad ): any {

		let roadStep = road.isJunction ? OdBuilderConfig.JUNCTION_STEP : OdBuilderConfig.ROAD_STEP;
		let posTheta = new TvPosTheta;

		let cumulativeWidth = 0;

		lane.meshData = null;
		lane.meshData = new MeshGeometryData;

		lane.markMeshData = null;
		lane.markMeshData = new MeshGeometryData;

		const laneSectionLength = laneSection.endS - laneSection.s;

		let step = 0;

		for ( let s = laneSection.s; s < laneSection.endS; s += roadStep ) {

			step += roadStep;

			cumulativeWidth = laneSection.getWidthUptoStart( lane, step );

			s = Maths.clamp( s, laneSection.s, laneSection.endS );

			posTheta = road.getRoadCoordAt( s );

			this.makeLaneVertices( s, posTheta, lane, road, cumulativeWidth, step );

		}

		// add last s geometry to close any gaps
		let lastSCoordinate = Maths.clamp( laneSection.endS - Maths.Epsilon, laneSection.s, laneSection.endS );

		cumulativeWidth = laneSection.getWidthUptoStart( lane, laneSectionLength );

		posTheta = road.getRoadCoordAt( lastSCoordinate );

		this.makeLaneVertices( lastSCoordinate, posTheta, lane, road, cumulativeWidth, laneSectionLength );

		this.createLaneMeshFromGeometry( road, lane, laneSection );

	}

	static buildLaneV2 ( lane: TvLane, laneSection: TvLaneSection, road: TvRoad ) {

		const geometry = new LaneBufferGeometry( lane, laneSection, road );

		this.createLaneGameObject( lane, geometry, this.getLaneMaterial( lane ), laneSection );

	}

	static getLaneMaterial ( lane: TvLane ) {

		// if guid is set use the material from the asset database
		if ( lane.threeMaterialGuid ) return AssetDatabase.getInstance<MeshStandardMaterial>( lane.threeMaterialGuid );

		let material: MeshStandardMaterial;
		let guid: string;

		const drivingMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';
		const sidewalkMaterialGuid: string = '87B8CB52-7E11-4F22-9CF6-285EC8FE9218';
		const borderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';
		const shoulderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

		switch ( lane.type ) {

			case TvLaneType.driving:
				guid = lane.laneSection?.road?.drivingMaterialGuid || drivingMaterialGuid;
				break;

			case TvLaneType.border:
				guid = lane.laneSection?.road?.borderMaterialGuid || borderMaterialGuid;
				break;

			case TvLaneType.sidewalk:
				guid = lane.laneSection?.road?.sidewalkMaterialGuid || sidewalkMaterialGuid;
				break;

			case TvLaneType.shoulder:
				guid = lane.laneSection?.road?.shoulderMaterialGuid || shoulderMaterialGuid;
				break;

			case TvLaneType.stop:
				guid = lane.laneSection?.road?.shoulderMaterialGuid || shoulderMaterialGuid;
				break;

			case TvLaneType.stop:
				guid = lane.laneSection?.road?.shoulderMaterialGuid || shoulderMaterialGuid;
				break;

			case TvLaneType.parking:
				guid = lane.laneSection?.road?.drivingMaterialGuid || drivingMaterialGuid;
				break;

			default:
				guid = drivingMaterialGuid;
				break;

		}

		// find by guid
		if ( guid ) material = AssetDatabase.getInstance( guid );

		// if no material found then use in built
		if ( !material ) material = OdMaterials.getLaneMaterial( lane );

		return material;

	}

	static makeLaneVertices ( sCoordinate: number, pos: TvPosTheta, lane: TvLane, road: TvRoad, cumulativeWidth: number, laneSectionS: number ) {

		let vv1: Vertex;
		let vv2: Vertex;

		const width = lane.getWidthValue( laneSectionS );
		const height = lane.getHeightValue( laneSectionS );

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, pos.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, pos.hdg );

		const v1 = new Vertex();
		const p1X = cosHdgPlusPiO2 * cumulativeWidth;
		const p1Y = sinHdgPlusPiO2 * cumulativeWidth;
		v1.position = new Vector3( pos.x + p1X, pos.y + p1Y, pos.z );
		v1.uvs = new Vector2( 0, sCoordinate );

		if ( height.getInner() > 0 ) {
			vv1 = new Vertex();
			const p1X = cosHdgPlusPiO2 * cumulativeWidth;
			const p1Y = sinHdgPlusPiO2 * cumulativeWidth;
			vv1.position = new Vector3( pos.x + p1X, pos.y + p1Y, pos.z + height.getInner() );
			vv1.uvs = new Vector2( height.getInner(), sCoordinate );
		}

		const v2 = new Vertex();
		const p2X = cosHdgPlusPiO2 * ( cumulativeWidth + width );
		const p2Y = sinHdgPlusPiO2 * ( cumulativeWidth + width );
		v2.position = new Vector3( pos.x + p2X, pos.y + p2Y, pos.z );
		v2.uvs = new Vector2( height.getInner() + width, sCoordinate );

		if ( height.getOuter() > 0 ) {
			vv2 = new Vertex();
			const p2X = cosHdgPlusPiO2 * ( cumulativeWidth + width );
			const p2Y = sinHdgPlusPiO2 * ( cumulativeWidth + width );
			vv2.position = new Vector3( pos.x + p2X, pos.y + p2Y, pos.z + height.getOuter() );
			vv2.uvs = new Vector2( height.getInner() + width + height.getOuter(), sCoordinate );
		}

		if ( lane.side == TvLaneSide.RIGHT ) {

			this.addVertex( lane.meshData, v1 );
			if ( vv1 ) this.addVertex( lane.meshData, vv1 );
			if ( vv2 ) this.addVertex( lane.meshData, vv2 );
			this.addVertex( lane.meshData, v2 );

		} else {

			this.addVertex( lane.meshData, v2 );
			if ( vv2 ) this.addVertex( lane.meshData, vv2 );
			if ( vv1 ) this.addVertex( lane.meshData, vv1 );
			this.addVertex( lane.meshData, v1 );

		}

	}

	static addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

		meshData.vertices.push( v1.position.x, v1.position.y, v1.position.z );
		meshData.normals.push( v1.normal.x, v1.normal.y, v1.normal.z );
		meshData.uvs.push( v1.uvs.x, v1.uvs.y );
		meshData.indices.push( meshData.currentIndex++ );

	}


	static createMeshIndices ( geom: MeshGeometryData, verticesPerStep = 2 ): void {

		if ( verticesPerStep < 2 ) {
			throw new Error( "verticesPerStep should be at least 2" );
		}

		for ( let i = 0; i < geom.indices.length / verticesPerStep - 1; i++ ) {

			// This loop creates triangles for every consecutive pair of vertices
			// within a step and between two consecutive steps.
			for ( let j = 0; j < verticesPerStep - 1; j++ ) {

				let index1 = i * verticesPerStep + j;
				let index2 = i * verticesPerStep + j + 1;
				let index3 = ( i + 1 ) * verticesPerStep + j;
				let index4 = ( i + 1 ) * verticesPerStep + j + 1;

				geom.triangles.push( index1, index2, index3 );
				geom.triangles.push( index2, index4, index3 );
			}
		}

	}


	// Note: Experimental
	// // for single mesh
	// static createMeshIndicesMultiple ( geom: MeshGeometryData, rows: number, cols: number ): void {
	// 	// Note that rows and cols are the number of vertices in each direction
	// 	// So for a 4x4 grid, rows=4 and cols=4

	// 	for ( let i = 0; i < rows - 1; i++ ) {         // iterate through rows
	// 		for ( let j = 0; j < cols - 1; j++ ) {     // iterate through columns

	// 			// Calculate base index for the current quad
	// 			let index = i * cols + j;

	// 			// Create two triangles for the current quad

	// 			// Triangle 1
	// 			geom.triangles.push( index );          // bottom-left
	// 			geom.triangles.push( index + 1 );      // bottom-right
	// 			geom.triangles.push( index + cols );   // top-left

	// 			// Triangle 2
	// 			geom.triangles.push( index + 1 );      // bottom-right
	// 			geom.triangles.push( index + cols + 1 ); // top-right
	// 			geom.triangles.push( index + cols );   // top-left
	// 		}
	// 	}
	// }

	private static createLaneMeshFromGeometry ( road: TvRoad, lane: TvLane, laneSection: TvLaneSection ) {

		let perStep = 2;

		if ( lane.height.length > 0 ) {
			if ( lane.height[ 0 ].inner > 0 ) perStep++;
			if ( lane.height[ 0 ].outer > 0 ) perStep++;
		}

		this.createMeshIndices( lane.meshData, perStep );

		const geometry = new BufferGeometry();

		geometry.name = 'createLaneMeshFromGeometry lane-id : ' + lane.id;

		const vertices = new Float32Array( lane.meshData.vertices );
		const normals = new Float32Array( lane.meshData.normals );
		const faces = new Float32Array( lane.meshData.uvs );

		geometry.setIndex( lane.meshData.triangles );
		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( faces, 2 ) );

		geometry.computeBoundingBox();
		geometry.computeVertexNormals();

		TvMapBuilder.createLaneGameObject( lane, geometry, this.getLaneMaterial( lane ), laneSection );

	}

	private static createLaneGameObject (
		lane: TvLane,
		geometry: BufferGeometry,
		material: THREE.Material | THREE.Material[],
		laneSection: TvLaneSection
	) {

		lane.gameObject = new GameObject( 'Lane:' + lane.id, geometry, material );
		lane.gameObject.Tag = TvObjectType[ TvObjectType.LANE ];
		lane.gameObject.OpenDriveType = TvObjectType.LANE;
		lane.gameObject.userData.data = lane;
		lane.gameObject.userData.lane = lane;

		laneSection.gameObject.add( lane.gameObject );
	}
}

export class LaneBufferGeometry extends BufferGeometry {

	constructor ( private lane: TvLane, private laneSection: TvLaneSection, private road: TvRoad ) {

		super();

		this.build();

	}

	build () {

		// if ( this.lane.side == TvLaneSide.LEFT ) return;

		const indices: number[] = [];
		const vertices: number[] = [];
		const normals: number[] = [];
		const uvs: number[] = [];

		const roadStep = this.road.isJunction ? OdBuilderConfig.JUNCTION_STEP : OdBuilderConfig.ROAD_STEP;

		let refLine = new TvPosTheta;
		let step = 0;
		let cumulativeWidth = 0;

		const laneSection = this.laneSection;
		const lane = this.lane;

		for ( let s = this.laneSection.s; s <= this.laneSection.endS; s += roadStep ) {

			step += roadStep;

			cumulativeWidth = laneSection.getWidthUptoStart( lane, step );

			s = Maths.clamp( s, laneSection.s, laneSection.endS );

			refLine = this.road.getRoadCoordAt( s, );

			const width = lane.getWidthValue( s );
			const height = lane.getHeightValue( s );

			const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, refLine.hdg );
			const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, refLine.hdg );

			const x1 = refLine.x + cosHdgPlusPiO2 * cumulativeWidth;
			const y1 = refLine.y + sinHdgPlusPiO2 * cumulativeWidth;

			const x2 = refLine.x + cosHdgPlusPiO2 * ( cumulativeWidth + width );
			const y2 = refLine.y + sinHdgPlusPiO2 * ( cumulativeWidth + width );

			if ( lane.side == TvLaneSide.RIGHT ) {

				vertices.push( x1, y1, 0 );
				vertices.push( x2, y2, 0 );

			} else {

				vertices.push( x2, y2, 0 );
				vertices.push( x1, y1, 0 );

			}

			uvs.push( 0, s );
			uvs.push( width, s );

			normals.push( 0, 0, 1 );
			normals.push( 0, 0, 1 );

		}

		// add last s geometry to close any gaps
		step = Maths.clamp( laneSection.endS - Maths.Epsilon, laneSection.s, laneSection.endS );

		cumulativeWidth = laneSection.getWidthUptoStart( lane, laneSection.length );

		refLine = this.road.getRoadCoordAt( step );

		const width = lane.getWidthValue( step );
		const height = lane.getHeightValue( step );

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, refLine.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, refLine.hdg );

		const x1 = refLine.x + cosHdgPlusPiO2 * cumulativeWidth;
		const y1 = refLine.y + sinHdgPlusPiO2 * cumulativeWidth;

		const x2 = refLine.x + cosHdgPlusPiO2 * ( cumulativeWidth + width );
		const y2 = refLine.y + sinHdgPlusPiO2 * ( cumulativeWidth + width );

		if ( lane.side == TvLaneSide.RIGHT ) {

			vertices.push( x1, y1, 0 );
			vertices.push( x2, y2, 0 );

		} else {

			vertices.push( x2, y2, 0 );
			vertices.push( x1, y1, 0 );

		}

		uvs.push( 0, step );
		uvs.push( width, step );

		normals.push( 0, 0, 1 );
		normals.push( 0, 0, 1 );

		for ( let i = 0; i < vertices.length / 2 - 1; i++ ) {

			indices.push( i * 2 + 0 );
			indices.push( i * 2 + 1 );
			indices.push( i * 2 + 2 );

			indices.push( i * 2 + 1 );
			indices.push( i * 2 + 3 );
			indices.push( i * 2 + 2 );
		}

		this.setIndex( indices );
		this.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );


		this.computeBoundingBox();
		// this.computeVertexNormals();

	}

}
