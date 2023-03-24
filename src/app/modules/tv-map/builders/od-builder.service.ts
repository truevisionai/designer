/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { AssetDatabase } from 'app/services/asset-database';
import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { BufferGeometry, Material, MeshBasicMaterial, Vector2, Vector3 } from 'three';
import { SceneService } from '../../../core/services/scene.service';
import { TvObjectType } from '../interfaces/i-tv-object';
import { MeshGeometryData } from '../models/mesh-geometry.data';
import { ObjectTypes, TvLaneSide, TvLaneType } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvMap } from '../models/tv-map.model';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoadObject } from '../models/tv-road-object';
import { TvRoadSignal } from '../models/tv-road-signal.model';
import { TvRoad } from '../models/tv-road.model';
import { Vertex } from '../models/vertex';
import { TvMapInstance } from '../services/tv-map-source-file';
import { TvSignalHelper } from '../services/tv-signal-helper';
import { OdBuilderConfig } from './od-builder-config';
import { OdMaterials } from './od-materials.service';
import { OdRoadMarkBuilder } from './od-road-mark-builder';
import { OdSignalBuilder } from './od-signal-builder';

export class TvMapBuilder {

	private static signalFactory = new OdSignalBuilder;
	private static roadMarkBuilder = new OdRoadMarkBuilder( null );

	private static JUNCTION_ELEVATION_SHIFT = 0.005;

	constructor ( public map?: TvMap ) {

	}

	public static buildMap ( map?: TvMap ): GameObject {

		TvMapInstance.clearOpenDrive();

		SceneService.remove( map.gameObject );

		map.gameObject = null;
		map.gameObject = new GameObject( 'OpenDrive' );

		map.roads.forEach( road => {

			this.buildRoad( map.gameObject, road );

		} );

		SceneService.add( map.gameObject );

		return map.gameObject;

	}

	static buildRoad ( parent: GameObject, road: TvRoad ): any {

		road.gameObject = null;
		road.gameObject = new GameObject( 'Road:' + road.id );
		road.gameObject.Tag = ObjectTypes.ROAD;
		road.gameObject.userData.road = road;

		road.lanes.computeLaneSectionEnd( road );

		// ( new OdRoadReferenceLineHelper( road ) ).create();
		// ( new OdLaneReferenceLineHelper( road ) ).create();

		// OdBuilder.makeRoadReferenceLine( road );

		// const offset = road.lanes.getLaneOffset();
		const laneSections = road.lanes.getLaneSections();

		for ( let i = 0; i < laneSections.length; i++ ) {

			TvMapBuilder.buildLaneSection( road, laneSections[ i ] );

		}

		this.roadMarkBuilder.buildRoad( road );

		( new TvSignalHelper( road ) ).create();

		parent.add( road.gameObject );

	}

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

		this.createLaneGameObject( lane, new BufferGeometry(), new MeshBasicMaterial(), laneSection );

	}

	static buildLanes ( lanes: TvLane[], road: TvRoad, laneSection: TvLaneSection ): any {

		// console.time( 'lane-build-time' );

		for ( let i = 0; i < lanes.length; i++ ) {

			const lane = lanes[ i ];

			TvMapBuilder.buildLane( lane, laneSection, road );

		}

	}

	static buildLane ( lane: TvLane, laneSection: TvLaneSection, road: TvRoad ): any {

		let roadStep = OdBuilderConfig.ROAD_STEP;
		let posTheta = new TvPosTheta;

		let cumulativeWidth = 0;

		lane.meshData = null;
		lane.meshData = new MeshGeometryData;

		lane.markMeshData = null;
		lane.markMeshData = new MeshGeometryData;

		const laneSectionLength = laneSection.lastSCoordinate - laneSection.s;

		let step = 0;

		for ( let sCoordinate = laneSection.s; sCoordinate < laneSection.lastSCoordinate; sCoordinate += roadStep ) {

			step += roadStep;

			cumulativeWidth = laneSection.getWidthUptoStart( lane, step );

			road.getGeometryCoords( sCoordinate, posTheta );

			this.makeLaneVertices( sCoordinate, posTheta, lane, road, cumulativeWidth, step );

		}

		// add last s geometry to close any gaps
		let lastSCoordinate = laneSection.lastSCoordinate - Maths.Epsilon;

		cumulativeWidth = laneSection.getWidthUptoStart( lane, laneSectionLength );

		road.getGeometryCoords( lastSCoordinate, posTheta );

		this.makeLaneVertices( lastSCoordinate, posTheta, lane, road, cumulativeWidth, laneSectionLength );

		this.createLaneMeshFromGeometry( road, lane, laneSection );

	}

	static makeLaneVertices ( sCoordinate: number, pos: TvPosTheta, lane: TvLane, road: TvRoad, cumulativeWidth: number, laneSectionS: number ) {

		const width = lane.getWidthValue( laneSectionS );
		const height = lane.getHeightValue( laneSectionS );
		const elevation = road.getElevationValue( laneSectionS );

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, pos.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, pos.hdg );

		const v1 = new Vertex();
		const p1X = cosHdgPlusPiO2 * cumulativeWidth;
		const p1Y = sinHdgPlusPiO2 * cumulativeWidth;
		v1.Position = new Vector3( pos.x + p1X, pos.y + p1Y, elevation );
		v1.TexCoord = new Vector2( 0, sCoordinate );

		const v2 = new Vertex();
		const p2X = cosHdgPlusPiO2 * ( cumulativeWidth + width );
		const p2Y = sinHdgPlusPiO2 * ( cumulativeWidth + width );
		v2.Position = new Vector3( pos.x + p2X, pos.y + p2Y, elevation + height.getOuter() );
		v2.TexCoord = new Vector2( width + height.getOuter(), sCoordinate );

		if ( lane.side == TvLaneSide.RIGHT ) {

			this.addVertex( lane.meshData, v1 );
			this.addVertex( lane.meshData, v2 );

		} else {

			this.addVertex( lane.meshData, v2 );
			this.addVertex( lane.meshData, v1 );

		}

	}

	static addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

		meshData.vertices.push( v1.Position.x, v1.Position.y, v1.Position.z );
		meshData.normals.push( v1.Normal.x, v1.Normal.y, v1.Normal.z );
		meshData.texCoords.push( v1.TexCoord.x, v1.TexCoord.y );
		meshData.indices.push( meshData.currentIndex++ );

	}


	static createMeshIndices ( geom: MeshGeometryData ): void {

		let index = 0;

		for ( let i = 0; i < ( geom.indices.length / 2 ) - 1; i++ ) {

			geom.triangles.push( index );
			geom.triangles.push( index + 1 );
			geom.triangles.push( index + 2 );

			geom.triangles.push( index + 1 );
			geom.triangles.push( index + 3 );
			geom.triangles.push( index + 2 );

			index += 2;
		}
	}

	static makeRoadSignal ( road: TvRoad, signal: TvRoadSignal ): any {

		TvMapBuilder.signalFactory.createSignalGameObject( road, signal );

	}

	static makeObject ( road: TvRoad, object: TvRoadObject ): any {

		var gameObject = new GameObject( 'Object:' + object.attr_id );

		road.gameObject.add( gameObject );

	}

	public static getLaneMaterial ( road: TvRoad, lane: TvLane ): Material {

		let material: Material;
		let guid: string;

		if ( lane.type == TvLaneType.driving ) {

			guid = road.drivingMaterialGuid;

		} else if ( lane.type == TvLaneType.border ) {

			guid = road.borderMaterialGuid;

		} else if ( lane.type == TvLaneType.sidewalk ) {

			guid = road.sidewalkMaterialGuid;

		} else if ( lane.type == TvLaneType.shoulder ) {

			guid = road.shoulderMaterialGuid;

		}

		// find by guid
		if ( guid ) material = AssetDatabase.getInstance( guid );

		// if no material found then use in built
		if ( !material ) material = OdMaterials.getLaneMaterial( lane ) as Material;

		return material;
	}

	private static createLaneMeshFromGeometry ( road: TvRoad, lane: TvLane, laneSection: TvLaneSection ) {

		this.createMeshIndices( lane.meshData );

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( lane.meshData.vertices );
		const normals = new Float32Array( lane.meshData.normals );
		const faces = new Float32Array( lane.meshData.texCoords );

		geometry.setIndex( lane.meshData.triangles );
		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( faces, 2 ) );

		geometry.computeBoundingBox();
		geometry.computeVertexNormals();

		// const material = OdMaterials.getLaneMaterial( lane );
		const material = this.getLaneMaterial( road, lane );

		TvMapBuilder.createLaneGameObject( lane, geometry, material, laneSection );

	}

	private static createLaneGameObject (
		lane: TvLane,
		geometry: THREE.BufferGeometry,
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
