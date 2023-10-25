/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { GameObject } from '../core/game-object';
import { MeshGeometryData } from '../modules/tv-map/models/mesh-geometry.data';
import { ObjectTypes, TvLaneSide, TvRoadMarkTypes } from '../modules/tv-map/models/tv-common';
import { TvLane } from '../modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../modules/tv-map/models/tv-lane-road-mark';
import { TvLaneSection } from '../modules/tv-map/models/tv-lane-section';
import { TvPosTheta } from '../modules/tv-map/models/tv-pos-theta';
import { TvRoad } from '../modules/tv-map/models/tv-road.model';
import { Vertex } from '../modules/tv-map/models/vertex';
import { OdBuilderConfig } from '../modules/tv-map/builders/od-builder-config';

export class LaneRoadMarkFactory {

	public buildRoad ( road: TvRoad ): void {

		// this.road = road;

		for ( let i = 0; i < road.getLaneSections().length; i++ ) {

			const laneSection = road.getLaneSections()[ i ];

			const lanes = laneSection.getLaneArray();

			for ( let j = 0; j < lanes.length; j++ ) {

				LaneRoadMarkFactory.processLane( lanes[ j ] );

			}

		}
	}

	public buildLane ( road: TvRoad, lane: TvLane ): void {

		LaneRoadMarkFactory.processLane( lane );

	}

	// private createMeshIndices ( geom: MeshGeometryData ): void {
	//
	// 	let index = 0;
	//
	// 	for ( let i = 0; i < ( geom.indices.length / 2 ) - 1; i++ ) {
	//
	// 		geom.triangles.push( index );
	// 		geom.triangles.push( index + 1 );
	// 		geom.triangles.push( index + 2 );
	//
	// 		geom.triangles.push( index + 1 );
	// 		geom.triangles.push( index + 3 );
	// 		geom.triangles.push( index + 2 );
	//
	// 		index += 2;
	// 	}
	// }

	private static processLane ( lane: TvLane ) {

		const roadMarks = lane.getRoadMarks();

		for ( const roadMark of roadMarks ) {

			this.createRoadMark( roadMark );

		}

	}

	// private updateLastCoordinate ( roadMarks: TvLaneRoadMark[], laneSection: TvLaneSection ) {
	//
	// 	// setting the last coordinate
	// 	roadMarks.forEach( ( mark, index ) => {
	//
	// 		if ( index < roadMarks.length - 1 ) {
	//
	// 			mark.lastSCoordinate = roadMarks[ index + 1 ].sOffset;
	//
	// 		} else {
	//
	// 			mark.lastSCoordinate = laneSection.length;
	//
	// 		}
	//
	// 	} );
	//
	// }

	private static createVertex ( start: TvPosTheta, roadMark: TvLaneRoadMark, mesh: MeshGeometryData, laneSectionS: number ) {

		const endS = Math.min( start.s + roadMark.length, roadMark.lane.laneSection.endS );
		const end = roadMark.lane.laneSection.road.getRoadCoordAt( endS );

		const lane = roadMark.lane;

		const width = roadMark.width;

		const height = lane.getHeightValue( laneSectionS );

		const elevationStart = lane.laneSection.road.getElevationValue( laneSectionS );
		const elevationEnd = lane.laneSection.road.getElevationValue( laneSectionS + roadMark.length );

		const startBorder = LaneRoadMarkFactory.getLaneBorder( lane, laneSectionS, lane.laneSection, start );
		const endBorder = LaneRoadMarkFactory.getLaneBorder( lane, laneSectionS + roadMark.length, lane.laneSection, end );

		const cosFactor = Maths.cosHdgPlusPiO2( lane.side, start.hdg );
		const sinFactor = Maths.sinHdgPlusPiO2( lane.side, start.hdg );

		let x1 = startBorder.x + ( cosFactor * width * 0.5 );
		let y1 = startBorder.y + ( sinFactor * width * 0.5 );
		let x2 = startBorder.x - ( cosFactor * width * 0.5 );
		let y2 = startBorder.y - ( sinFactor * width * 0.5 );

		let x3 = endBorder.x + ( cosFactor * width * 0.5 );
		let y3 = endBorder.y + ( sinFactor * width * 0.5 );
		let x4 = endBorder.x - ( cosFactor * width * 0.5 );
		let y4 = endBorder.y - ( sinFactor * width * 0.5 );

		const frontLeft = new Vertex(
			new Vector3( x1, y1, elevationStart ),
			new Vector2( 0, 0 )
		);

		const frontRight = new Vertex(
			new Vector3( x2, y2, elevationStart + height.getOuter() ),
			new Vector2( 0, roadMark.width )
		);

		const backLeft = new Vertex(
			new Vector3( x3, y3, elevationEnd ),
			new Vector2( roadMark.length, 0 )
		);

		const backRight = new Vertex(
			new Vector3( x4, y4, elevationEnd + height.getOuter() ),
			new Vector2( roadMark.length, roadMark.width )
		);

		if ( lane.side == TvLaneSide.LEFT ) {

			LaneRoadMarkFactory.addVertex( mesh, frontLeft );
			LaneRoadMarkFactory.addVertex( mesh, frontRight );
			LaneRoadMarkFactory.addVertex( mesh, backLeft );
			LaneRoadMarkFactory.addVertex( mesh, backRight );

		} else {

			LaneRoadMarkFactory.addVertex( mesh, frontRight );
			LaneRoadMarkFactory.addVertex( mesh, frontLeft );
			LaneRoadMarkFactory.addVertex( mesh, backRight );
			LaneRoadMarkFactory.addVertex( mesh, backLeft );
		}

		mesh.triangles.push( mesh.currentIndex + 0, mesh.currentIndex + 3, mesh.currentIndex + 2 );
		mesh.triangles.push( mesh.currentIndex + 0, mesh.currentIndex + 1, mesh.currentIndex + 3 );

		mesh.currentIndex = mesh.currentIndex + 4;

		mesh.indices.push( mesh.currentIndex );
	}

	private static addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

		meshData.vertices.push( v1.position.x, v1.position.y, v1.position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT );

		meshData.normals.push( v1.normal.x, v1.normal.y, v1.normal.z );

		meshData.uvs.push( v1.uvs.x, v1.uvs.y );

	}

	private static createRoadMarkObject ( roadMark: TvLaneRoadMark, mesh: MeshGeometryData, lane: TvLane ) {

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( mesh.vertices );
		const faces = new Float32Array( mesh.uvs );

		geometry.setIndex( mesh.triangles );

		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( faces, 2 ) );

		geometry.computeBoundingBox();

		geometry.computeVertexNormals();

		roadMark.gameObject = new GameObject( 'RoadMark:', geometry, roadMark.material );

		roadMark.gameObject.Tag = ObjectTypes.LANE_MARKING;

		roadMark.gameObject.userData.data = lane;

		roadMark.gameObject.userData.lane = lane;

		roadMark.gameObject.userData.roadMark = roadMark;

		lane.gameObject.add( roadMark.gameObject );
	}

	private static getCumulativeWidth ( laneSectionS, lane: TvLane, laneSection: TvLaneSection ) {

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

	private static getLaneBorder ( lane, laneSectionS, laneSection, posTheta ) {

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, posTheta.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, posTheta.hdg );

		const cumulativeWidth = LaneRoadMarkFactory.getCumulativeWidth( laneSectionS, lane, laneSection );

		return new Vector2(
			posTheta.x + ( cosHdgPlusPiO2 * cumulativeWidth ),
			posTheta.y + ( sinHdgPlusPiO2 * cumulativeWidth )
		);
	}

	private static createRoadMark ( roadMark: TvLaneRoadMark ) {

		const roadMarks = roadMark.lane.getRoadMarks();

		roadMark.clearMesh();

		const index = roadMarks.indexOf( roadMark );

		const mesh = new MeshGeometryData();

		const start = roadMark.lane.laneSection.s + roadMark.s;

		// setting the next coordinate
		// if the next road mark is not available,
		// then the next coordinate is the end of the lane section
		roadMark.lastSCoordinate = ( index < roadMarks.length - 1 )
			? roadMarks[ index + 1 ].sOffset
			: roadMark.lane.laneSection.length;

		if ( roadMark.type == TvRoadMarkTypes.NONE ) return;

		let posTheta = new TvPosTheta();

		const step = roadMark.length + roadMark.space;

		for ( let s = 0; s < roadMark.s2; s += step ) {

			posTheta.s = start + s;

			posTheta = roadMark.lane.laneSection.road.getRoadCoordAt( start + s );

			LaneRoadMarkFactory.createVertex( posTheta, roadMark, mesh, roadMark.s + s );

		}

		if ( roadMark.s2 < 1 ) return;

		// // one last entry is required to create a mesh
		// const lastS = posTheta.s = ( start + mark.s2 ) - Maths.Epsilon;
		// const laneSectionS = ( mark.s + mark.s2 ) - Maths.Epsilon;
		// posTheta = lane.laneSection.road.getRoadCoordAt( lastS );
		// this.createVertex( posTheta, mark, mesh, laneSectionS );

		// at least 1 vertex is required to create a mesh
		if ( mesh.vertices.length > 0 ) {
			LaneRoadMarkFactory.createRoadMarkObject( roadMark, mesh, roadMark.lane );
		}

	}
}
