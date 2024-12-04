/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { BufferAttribute, BufferGeometry, Mesh, Object3D, Vector2, Vector3 } from 'three';
import { TvLaneSide, TvRoadMarkTypes } from '../../../map/models/tv-common';
import { TvLane } from '../../../map/models/tv-lane';
import { DOUBLE_LINE_SPACE, TvLaneRoadMark } from '../../../map/models/tv-lane-road-mark';
import { TvLaneSection } from '../../../map/models/tv-lane-section';
import { TvPosTheta } from '../../../map/models/tv-pos-theta';
import { TvRoad } from '../../../map/models/tv-road.model';
import { OdBuilderConfig } from './od-builder-config';
import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/assets/asset-database';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { createRoadDistance, RoadDistance } from 'app/map/road/road-distance';

@Injectable()
export class LaneRoadMarkBuilder {

	constructor () { }

	public buildRoad ( road: TvRoad ): void {

		const laneSections = road.getLaneProfile().getLaneSections();

		for ( let i = 0; i < laneSections.length; i++ ) {

			const laneSection = laneSections[ i ];

			const lanes = laneSection.getLanes();

			for ( let j = 0; j < lanes.length; j++ ) {

				const lane = lanes[ j ];

				this.buildLane( road, laneSection, lane );

			}

		}
	}

	buildLane ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): THREE.Object3D<THREE.Object3DEventMap> {

		const roadMarkMesh = new Object3D();

		for ( const roadMark of lane.roadMarks.values() ) {

			roadMarkMesh.name = "RoadMark:" + roadMark.s;

			const subMeshes = [];

			if ( roadMark.type == TvRoadMarkTypes.SOLID_SOLID ) {

				const tOffset = roadMark.width + DOUBLE_LINE_SPACE;

				const mesh1 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.SOLID, -tOffset );
				const mesh2 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.SOLID );

				if ( mesh1 ) subMeshes.push( mesh1 );
				if ( mesh2 ) subMeshes.push( mesh2 );

			} else if ( roadMark.type == TvRoadMarkTypes.BROKEN_SOLID ) {

				const tOffset = roadMark.width + DOUBLE_LINE_SPACE;

				const mesh1 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.BROKEN, -tOffset );
				const mesh2 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.SOLID, );

				if ( mesh1 ) subMeshes.push( mesh1 );
				if ( mesh2 ) subMeshes.push( mesh2 );

			} else if ( roadMark.type == TvRoadMarkTypes.SOLID_BROKEN ) {

				const tOffset = roadMark.width + DOUBLE_LINE_SPACE;

				const mesh1 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.SOLID, -tOffset );
				const mesh2 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.BROKEN );

				if ( mesh1 ) subMeshes.push( mesh1 );
				if ( mesh2 ) subMeshes.push( mesh2 );

			} else if ( roadMark.type == TvRoadMarkTypes.BROKEN_BROKEN ) {

				const tOffset = roadMark.width + DOUBLE_LINE_SPACE;

				const mesh1 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.BROKEN, -tOffset );
				const mesh2 = this.buildRoadMark( road, laneSection, lane, roadMark, TvRoadMarkTypes.BROKEN );

				if ( mesh1 ) subMeshes.push( mesh1 );
				if ( mesh2 ) subMeshes.push( mesh2 );

			} else {

				const mesh1 = this.buildRoadMark( road, laneSection, lane, roadMark, roadMark.type );

				if ( mesh1 ) subMeshes.push( mesh1 );

			}

			subMeshes.forEach( mesh => roadMarkMesh.add( mesh ) );

			// lane.laneSection.road.gameObject.add( roadMarkMesh );

		}

		return roadMarkMesh;
	}

	// eslint-disable-next-line max-lines-per-function
	private buildRoadMark ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, roadMark: TvLaneRoadMark, type: TvRoadMarkTypes, tOffset: number = 0 ): THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material, THREE.Object3DEventMap> {

		if ( type == TvRoadMarkTypes.NONE ) return;

		const positions: number[] = [];
		const uvs: number[] = [];
		const normals: number[] = [];
		const indices: number[] = [];

		const nextRoadMark = lane.roadMarks.getNext( roadMark );
		const sEnd = nextRoadMark?.s || laneSection.getLength();

		// Determine step size and vertex count based on road mark type
		let step = type === TvRoadMarkTypes.SOLID ? 1 : roadMark.length + roadMark.space;

		let index = 0;
		let currentIndex = 0;

		const addVertex = ( index: number, position: Vector3, uvX: number, uvY: number ) => {

			positions.push( position.x, position.y, position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT );

			normals.push( 0, 0, 1 );

			uvs.push( uvX, uvY );

			return index + 1;

		}

		// eslint-disable-next-line max-lines-per-function
		const processStep = ( laneDistance: number ) => {

			const distance = laneSection.s + laneDistance as RoadDistance;
			const posTheta = road.getLaneEndPosition( lane, distance, tOffset );
			const leftStart = posTheta.clone().addLateralOffset( roadMark.width * 0.5 );
			const rightStart = posTheta.clone().addLateralOffset( roadMark.width * 0.5 * -1 );

			if ( type === TvRoadMarkTypes.SOLID ) {

				index = addVertex( index, leftStart.position, laneDistance, 0 );
				index = addVertex( index, rightStart.position, laneDistance, roadMark.width );

				if ( currentIndex > 0 ) {
					indices.push( currentIndex, currentIndex - 1, currentIndex + 1 );
					indices.push( currentIndex - 2, currentIndex - 1, currentIndex );
				}

				currentIndex += 2;

			} else if ( type == TvRoadMarkTypes.BROKEN ) {

				index = addVertex( index, leftStart.position, 0, 0 );
				index = addVertex( index, rightStart.position, 0, roadMark.width );

				const nextSOffset = Math.min( laneDistance + roadMark.length, sEnd );
				const nextDistance = createRoadDistance( road, nextSOffset );
				const nextPosTheta = road.getLaneEndPosition( lane, nextDistance, tOffset );

				const leftEnd = nextPosTheta.clone().addLateralOffset( roadMark.width * 0.5 );
				const rightEnd = nextPosTheta.clone().addLateralOffset( roadMark.width * 0.5 * -1 );

				index = addVertex( index, leftEnd.position, roadMark.length, 0 );
				index = addVertex( index, rightEnd.position, roadMark.length, roadMark.width );

				indices.push( currentIndex, currentIndex + 1, currentIndex + 2 );
				indices.push( currentIndex + 2, currentIndex + 1, currentIndex + 3 );

				currentIndex += 4;
			}

		}

		for ( let s = roadMark.s; s < sEnd; s += step ) {
			processStep( s );
		}

		processStep( sEnd - Maths.Epsilon );

		const geometry = new BufferGeometry();

		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.setAttribute( 'normal', new BufferAttribute( new Float32Array( normals ), 3 ) );
		geometry.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvs ), 2 ) );

		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		const material = this.getMaterial( roadMark );

		return new Mesh( geometry, material );

	}


	// private buildRoadMark ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, roadMark: TvLaneRoadMark ) {
	//
	// 	if ( roadMark.type == TvRoadMarkTypes.NONE ) return;
	//
	// 	function addVertex ( index, geometry, position, uvX, uvY ) {
	// 		const posArray = geometry.attributes.position.array;
	// 		const normArray = geometry.attributes.normal.array;
	// 		const uvArray = geometry.attributes.uv.array;
	//
	// 		posArray[ index * 3 ] = position.x;
	// 		posArray[ index * 3 + 1 ] = position.y;
	// 		posArray[ index * 3 + 2 ] = position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT;
	//
	// 		normArray[ index * 3 ] = 0;
	// 		normArray[ index * 3 + 1 ] = 0;
	// 		normArray[ index * 3 + 2 ] = 1;
	//
	// 		uvArray[ index * 2 ] = uvX;
	// 		uvArray[ index * 2 + 1 ] = uvY;
	//
	// 		return index + 1;
	// 	}
	//
	// 	const geometry = new BufferGeometry();
	// 	const nextRoadMark = lane.roadMarks.find( i => i.s > roadMark.s );
	// 	const sEnd = nextRoadMark?.s || laneSection.getLength();
	//
	// 	// Calculate the number of vertices
	// 	const vertexCount = Math.ceil( ( sEnd - roadMark.s ) / roadMark.length ) * 4; // Four vertices per step
	// 	const vertices = new Float32Array( vertexCount * 3 );
	// 	const normals = new Float32Array( vertexCount * 3 );
	// 	const uvs = new Float32Array( vertexCount * 2 );
	// 	const indices = [];
	//
	// 	geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
	// 	geometry.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );
	// 	geometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );
	//
	// 	let index = 0;
	// 	let currentIndex = 0;
	//
	// 	let step = roadMark.length + roadMark.space;
	//
	// 	for ( let s = roadMark.s; s < sEnd; s += step ) {
	//
	// 		const posTheta = road.getLaneEndPosition(  laneSection, lane, s );
	//
	// 		const nextSOffset = Math.min( s + roadMark.length, sEnd );
	// 		const nextPosTheta = road.getLaneEndPosition(  laneSection, lane, nextSOffset );
	//
	// 		const leftStart = posTheta.clone().addLateralOffset( roadMark.width * 0.5 );
	// 		const rightStart = posTheta.clone().addLateralOffset( roadMark.width * 0.5 * -1 );
	//
	// 		const leftEnd = nextPosTheta.clone().addLateralOffset( roadMark.width * 0.5 );
	// 		const rightEnd = nextPosTheta.clone().addLateralOffset( roadMark.width * 0.5 * -1 );
	//
	// 		index = addVertex( index, geometry, leftStart.position, 0, 0 );
	// 		index = addVertex( index, geometry, rightStart.position, 0, roadMark.width );
	// 		index = addVertex( index, geometry, leftEnd.position, roadMark.length, 0 );
	// 		index = addVertex( index, geometry, rightEnd.position, roadMark.length, roadMark.width );
	//
	// 		indices.push( currentIndex, currentIndex + 1, currentIndex + 2 );
	// 		indices.push( currentIndex + 2, currentIndex + 1, currentIndex + 3 );
	//
	// 		currentIndex += 4;
	// 	}
	//
	// 	geometry.setIndex( indices );
	//
	// 	geometry.computeBoundingBox();
	// 	geometry.computeBoundingSphere();
	//
	// 	const material = this.getMaterial( roadMark );
	// 	const mesh = new Mesh( geometry, material );
	//
	// 	lane.gameObject.add( mesh );
	//
	// }

	// // eslint-disable-next-line max-lines-per-function
	// private createRoadMark ( roadMark: TvLaneRoadMark, lane: TvLane, laneSection: TvLaneSection, road: TvRoad ) {

	// 	roadMark.clearMesh();

	// 	const nextRoadMark = lane.roadMarks.getNext( roadMark );

	// 	const mesh = new MeshGeometryData();

	// 	// setting the next coordinate
	// 	// if the next road mark is not available,
	// 	// then the next coordinate is the end of the lane section
	// 	let nextS: number;

	// 	if ( nextRoadMark ) {

	// 		nextS = nextRoadMark.s;

	// 	} else {

	// 		nextS = laneSection.getLength();

	// 	}

	// 	const s2 = nextS - roadMark.s;

	// 	if ( roadMark.type == TvRoadMarkTypes.NONE ) return;

	// 	let posTheta = new TvPosTheta();

	// 	const step = roadMark.length + roadMark.space;

	// 	const start = laneSection.s + roadMark.s;

	// 	for ( let s = 0; s < s2; s += step ) {

	// 		posTheta.s = start + s;

	// 		posTheta = road.getRoadPosition( start + s );

	// 		this.createVertex( posTheta, roadMark, mesh, roadMark.s + s );

	// 	}

	// 	if ( roadMark.s2 < 1 ) return;

	// 	// // one last entry is required to create a mesh
	// 	// const lastS = posTheta.s = ( start + mark.s2 ) - Maths.Epsilon;
	// 	// const laneSectionS = ( mark.s + mark.s2 ) - Maths.Epsilon;
	// 	// posTheta = lane.laneSection.road.getRoadCoordAt( lastS );
	// 	// this.createVertex( posTheta, mark, mesh, laneSectionS );

	// 	// at least 1 vertex is required to create a mesh
	// 	if ( mesh.vertices.length > 0 ) {
	// 		this.createRoadMarkObject( roadMark, mesh, roadMark.lane );
	// 	}

	// }

	// // eslint-disable-next-line max-lines-per-function
	// private createVertex ( start: TvPosTheta, roadMark: TvLaneRoadMark, mesh: MeshGeometryData, laneSectionS: number ) {

	// 	const endS = Math.min( start.s + roadMark.length, roadMark.lane.laneSection.endS );
	// 	const end = roadMark.lane.laneSection.road.getPosThetaAt( endS );

	// 	const lane = roadMark.lane;

	// 	const width = roadMark.width;

	// 	const height = lane.getHeightValue( laneSectionS );

	// 	const elevationStart = lane.laneSection.road.getElevationProfile().getElevationValue( laneSectionS );
	// 	const elevationEnd = lane.laneSection.road.getElevationProfile().getElevationValue( laneSectionS + roadMark.length );

	// 	const startBorder = this.getLaneBorder( lane, laneSectionS, lane.laneSection, start );
	// 	const endBorder = this.getLaneBorder( lane, laneSectionS + roadMark.length, lane.laneSection, end );

	// 	const cosFactor = Maths.cosHdgPlusPiO2( lane.side, start.hdg );
	// 	const sinFactor = Maths.sinHdgPlusPiO2( lane.side, start.hdg );

	// 	let x1 = startBorder.x + ( cosFactor * width * 0.5 );
	// 	let y1 = startBorder.y + ( sinFactor * width * 0.5 );
	// 	let x2 = startBorder.x - ( cosFactor * width * 0.5 );
	// 	let y2 = startBorder.y - ( sinFactor * width * 0.5 );

	// 	let x3 = endBorder.x + ( cosFactor * width * 0.5 );
	// 	let y3 = endBorder.y + ( sinFactor * width * 0.5 );
	// 	let x4 = endBorder.x - ( cosFactor * width * 0.5 );
	// 	let y4 = endBorder.y - ( sinFactor * width * 0.5 );

	// 	const frontLeft = new Vertex(
	// 		new Vector3( x1, y1, elevationStart ),
	// 		new Vector2( 0, 0 )
	// 	);

	// 	const frontRight = new Vertex(
	// 		new Vector3( x2, y2, elevationStart + height.outer ),
	// 		new Vector2( 0, roadMark.width )
	// 	);

	// 	const backLeft = new Vertex(
	// 		new Vector3( x3, y3, elevationEnd ),
	// 		new Vector2( roadMark.length, 0 )
	// 	);

	// 	const backRight = new Vertex(
	// 		new Vector3( x4, y4, elevationEnd + height.outer ),
	// 		new Vector2( roadMark.length, roadMark.width )
	// 	);

	// 	if ( lane.side == TvLaneSide.LEFT ) {

	// 		this.addVertex( mesh, frontLeft );
	// 		this.addVertex( mesh, frontRight );
	// 		this.addVertex( mesh, backLeft );
	// 		this.addVertex( mesh, backRight );

	// 	} else {

	// 		this.addVertex( mesh, frontRight );
	// 		this.addVertex( mesh, frontLeft );
	// 		this.addVertex( mesh, backRight );
	// 		this.addVertex( mesh, backLeft );
	// 	}

	// 	mesh.triangles.push( mesh.currentIndex + 0, mesh.currentIndex + 3, mesh.currentIndex + 2 );
	// 	mesh.triangles.push( mesh.currentIndex + 0, mesh.currentIndex + 1, mesh.currentIndex + 3 );

	// 	mesh.currentIndex = mesh.currentIndex + 4;

	// 	mesh.indices.push( mesh.currentIndex );
	// }

	// private addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

	// 	meshData.vertices.push( v1.position.x, v1.position.y, v1.position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT );

	// 	meshData.normals.push( v1.normal.x, v1.normal.y, v1.normal.z );

	// 	meshData.uvs.push( v1.uvs.x, v1.uvs.y );

	// }

	// private createRoadMarkObject ( roadMark: TvLaneRoadMark, mesh: MeshGeometryData, lane: TvLane ) {

	// 	const geometry = new THREE.BufferGeometry();
	// 	const vertices = new Float32Array( mesh.vertices );
	// 	const faces = new Float32Array( mesh.uvs );

	// 	geometry.setIndex( mesh.triangles );

	// 	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	// 	geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( faces, 2 ) );

	// 	geometry.computeBoundingBox();

	// 	geometry.computeVertexNormals();

	// 	roadMark.gameObject = new GameObject( 'RoadMark:', geometry, this.getMaterial( roadMark ) );

	// 	roadMark.gameObject.Tag = TvRoadObjectType.LANE_MARKING;

	// 	roadMark.gameObject.userData.data = lane;

	// 	roadMark.gameObject.userData.lane = lane;

	// 	roadMark.gameObject.userData.roadMark = roadMark;

	// 	lane.laneSection.road.gameObject.add( roadMark.gameObject );

	// }

	private getMaterial ( roadMark: TvLaneRoadMark ): THREE.Material {

		if ( roadMark.materialGuid ) {

			const material = AssetDatabase.getMaterial( roadMark.materialGuid )?.material;

			if ( material ) {

				return material;

			} else {

				console.error( 'Material not found for road mark' );
				roadMark.materialGuid = null;

			}

		}

		const color = COLOR.stringToColor( roadMark.color );

		return new THREE.MeshStandardMaterial( {
			color: color,
			roughness: 1.0,
			metalness: 0.0,
		} );

	}

	private getCumulativeWidth ( laneSectionS: any, lane: TvLane, laneSection: TvLaneSection ): number {

		let width = 0;

		switch ( lane.side ) {

			case TvLaneSide.LEFT:
				width = laneSection.getWidthUptoEnd( lane, laneSectionS );
				break;

			case TvLaneSide.CENTER:
				width = 0;
				break;

			case TvLaneSide.RIGHT:
				width = laneSection.getWidthUptoEnd( lane, laneSectionS );
				break;

		}

		return width;
	}

	private getLaneBorder ( lane: TvLane, laneSectionS: any, laneSection: TvLaneSection, posTheta: TvPosTheta ): THREE.Vector2 {

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, posTheta.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, posTheta.hdg );

		const cumulativeWidth = this.getCumulativeWidth( laneSectionS, lane, laneSection );

		return new Vector2(
			posTheta.x + ( cosHdgPlusPiO2 * cumulativeWidth ),
			posTheta.y + ( sinHdgPlusPiO2 * cumulativeWidth )
		);
	}


}
