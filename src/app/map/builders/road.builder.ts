/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { GameObject } from 'app/objects/game-object';
import * as THREE from 'three';
import { BufferGeometry, Group, Material, MeshBasicMaterial, Vector2, Vector3 } from 'three';
import { TvRoad } from '../models/tv-road.model';
import { LaneBufferGeometry } from './LaneBufferGeometry';
import { TvLaneSide, TvLaneType } from '../models/tv-common';
import { LaneRoadMarkBuilder } from './lane-road-mark.builder';
import { Maths } from 'app/utils/maths';
import { TvObjectType } from '../interfaces/i-tv-object';
import { MeshGeometryData } from '../models/mesh-geometry.data';
import { TvLane } from '../models/tv-lane';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvPosTheta } from '../models/tv-pos-theta';
import { Vertex } from '../models/vertex';
import { OdBuilderConfig } from './od-builder-config';
import { OdMaterials } from './od-materials.service';
import { TvMap } from '../models/tv-map.model';
import { TvMaterialService } from 'app/graphics/material/tv-material.service';
import { TvRoadObjectType } from "../models/objects/tv-road-object";
import { RoadSignalBuilder } from "../road-signal/road-signal.builder";
import { RoadObjectBuilder } from "../road-object/road-object.builder";

@Injectable( {
	providedIn: 'root'
} )
export class RoadBuilder {

	constructor (
		private roadMarkBuilder: LaneRoadMarkBuilder,
		private materialService: TvMaterialService,
		private signalBuilder: RoadSignalBuilder,
		private objectBuilder: RoadObjectBuilder,
	) {
	}

	rebuildRoad ( road: TvRoad, map: TvMap ): GameObject {

		if ( road.gameObject ) map.gameObject.remove( road.gameObject );

		road.gameObject = this.buildRoad( road, map.gameObject );

		map.gameObject.add( road.gameObject );

		return road.gameObject;

	}

	buildRoad ( road: TvRoad, parent?: GameObject ): GameObject {

		const gameObject = new GameObject( 'Road:' + road.id );

		gameObject.Tag = TvRoadObjectType.ROAD;

		road.computeLaneSectionCoordinates();

		const laneSections = road.getLaneSections();

		for ( let i = 0; i < laneSections.length; i++ ) {

			const laneSection = laneSections[ i ];

			laneSection.gameObject = this.buildLaneSection( road, laneSection );

			gameObject.add( laneSection.gameObject );

		}

		road.gameObject = gameObject;

		this.roadMarkBuilder.buildRoad( road );

		gameObject.add( this.buildRoadObjects( road ) );

		gameObject.add( this.buildSignals( road ) );

		return gameObject;

	}

	buildLaneSection ( road: TvRoad, laneSection: TvLaneSection ) {

		const laneSectionMesh = new GameObject( 'LaneSection' );

		const leftLanes = laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < leftLanes.length; i++ ) {

			const lane = leftLanes[ i ];

			lane.gameObject = this.buildLane( leftLanes[ i ], laneSection, road );

			laneSectionMesh.add( lane.gameObject );

		}

		const centerLanes = laneSection.getCenterLanes();

		for ( let i = 0; i < centerLanes.length; i++ ) {

			const lane = centerLanes[ i ];

			lane.gameObject = this.createCenterLane( centerLanes[ i ], laneSection, road );

			laneSectionMesh.add( lane.gameObject );

		}

		const rightLanes = laneSection.getRightLanes();

		for ( let i = 0; i < rightLanes.length; i++ ) {

			const lane = rightLanes[ i ];

			lane.gameObject = this.buildLane( rightLanes[ i ], laneSection, road );

			laneSectionMesh.add( lane.gameObject );

		}

		return laneSectionMesh;
	}

	createCenterLane ( lane: TvLane, laneSection: TvLaneSection, road: TvRoad ) {

		const geometry = new BufferGeometry();

		geometry.name = 'center-lane';

		return this.createLaneGameObject( lane, geometry, new MeshBasicMaterial() );

	}

	buildLane ( lane: TvLane, laneSection: TvLaneSection, road: TvRoad ): any {

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

			posTheta = road.getPosThetaAt( s );

			this.makeLaneVertices( s, posTheta, lane, road, cumulativeWidth, step );

		}

		// add last s geometry to close any gaps
		let lastSCoordinate = Maths.clamp( laneSection.endS - Maths.Epsilon, laneSection.s, laneSection.endS );

		cumulativeWidth = laneSection.getWidthUptoStart( lane, laneSectionLength );

		posTheta = road.getPosThetaAt( lastSCoordinate );

		this.makeLaneVertices( lastSCoordinate, posTheta, lane, road, cumulativeWidth, laneSectionLength );

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

		return this.createLaneGameObject( lane, geometry, this.getLaneMaterial( road, lane ) );

	}

	buildLaneV2 ( lane: TvLane, laneSection: TvLaneSection, road: TvRoad ) {

		const geometry = new LaneBufferGeometry( lane, laneSection, road );

		return this.createLaneGameObject( lane, geometry, this.getLaneMaterial( road, lane ) );

	}

	getLaneMaterial ( road: TvRoad, lane: TvLane ): Material {

		// if guid is set use the material from the asset database
		if ( lane.threeMaterialGuid ) return this.materialService.getMaterial( lane.threeMaterialGuid )?.material;

		let material: Material;
		let guid: string;

		const drivingMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';
		const sidewalkMaterialGuid: string = '87B8CB52-7E11-4F22-9CF6-285EC8FE9218';
		const borderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';
		const shoulderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

		switch ( lane.type ) {

			case TvLaneType.driving:
				guid = road?.drivingMaterialGuid || drivingMaterialGuid;
				break;

			case TvLaneType.border:
				guid = road?.borderMaterialGuid || borderMaterialGuid;
				break;

			case TvLaneType.sidewalk:
				guid = road?.sidewalkMaterialGuid || sidewalkMaterialGuid;
				break;

			case TvLaneType.shoulder:
				guid = road?.shoulderMaterialGuid || shoulderMaterialGuid;
				break;

			case TvLaneType.stop:
				guid = road?.shoulderMaterialGuid || shoulderMaterialGuid;
				break;

			case TvLaneType.parking:
				guid = road?.drivingMaterialGuid || drivingMaterialGuid;
				break;

			default:
				guid = drivingMaterialGuid;
				break;

		}

		// find by guid
		if ( guid ) material = this.materialService.getMaterial( guid )?.material;

		// if no material found then use in built
		if ( !material ) material = OdMaterials.getLaneMaterial( lane );

		return material;

	}

	makeLaneVertices ( sCoordinate: number, pos: TvPosTheta, lane: TvLane, road: TvRoad, cumulativeWidth: number, laneSectionS: number ) {

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

		if ( height.inner > 0 ) {
			vv1 = new Vertex();
			const p1X = cosHdgPlusPiO2 * cumulativeWidth;
			const p1Y = sinHdgPlusPiO2 * cumulativeWidth;
			vv1.position = new Vector3( pos.x + p1X, pos.y + p1Y, pos.z + height.inner );
			vv1.uvs = new Vector2( height.inner, sCoordinate );
		}

		const v2 = new Vertex();
		const p2X = cosHdgPlusPiO2 * ( cumulativeWidth + width );
		const p2Y = sinHdgPlusPiO2 * ( cumulativeWidth + width );
		v2.position = new Vector3( pos.x + p2X, pos.y + p2Y, pos.z );
		v2.uvs = new Vector2( height.inner + width, sCoordinate );

		if ( height.outer > 0 ) {
			vv2 = new Vertex();
			const p2X = cosHdgPlusPiO2 * ( cumulativeWidth + width );
			const p2Y = sinHdgPlusPiO2 * ( cumulativeWidth + width );
			vv2.position = new Vector3( pos.x + p2X, pos.y + p2Y, pos.z + height.outer );
			vv2.uvs = new Vector2( height.inner + width + height.outer, sCoordinate );
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

	addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

		meshData.vertices.push( v1.position.x, v1.position.y, v1.position.z );
		meshData.normals.push( v1.normal.x, v1.normal.y, v1.normal.z );
		meshData.uvs.push( v1.uvs.x, v1.uvs.y );
		meshData.indices.push( meshData.currentIndex++ );

	}

	createMeshIndices ( geom: MeshGeometryData, verticesPerStep = 2 ): void {

		if ( verticesPerStep < 2 ) {
			console.error( "verticesPerStep should be at least 2" );
			return;
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
	// createMeshIndicesMultiple ( geom: MeshGeometryData, rows: number, cols: number ): void {
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

	private createLaneGameObject ( lane: TvLane, geometry: BufferGeometry, material: THREE.Material | THREE.Material[] ) {

		const gameObject = new GameObject( 'Lane:' + lane.id, geometry, material );

		gameObject.Tag = TvObjectType[ TvObjectType.LANE ];

		return gameObject;
	}

	private buildSignals ( road: TvRoad ) {

		road.signalGroup?.clear();

		for ( const signal of road.getRoadSignals() ) {

			signal.mesh = this.signalBuilder.buildSignal( road, signal )

			if ( !signal.mesh ) continue;

			road.signalGroup?.add( signal.mesh );

		}

		return road.signalGroup;
	}

	private buildRoadObjects ( road: TvRoad ) {

		road.objectGroup?.clear();

		for ( const roadObject of road.getRoadObjects() ) {

			roadObject.mesh = this.objectBuilder.buildRoadObject( road, roadObject )

			if ( !roadObject.mesh ) continue;

			road.objectGroup?.add( roadObject.mesh );

		}

		return road.objectGroup;

	}
}
