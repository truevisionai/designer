/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { GameObject } from '../../objects/game-object';
import { MeshGeometryData } from '../models/mesh-geometry.data';
import { TvLaneSide, TvRoadMarkTypes } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvLaneRoadMark } from '../models/tv-lane-road-mark';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';
import { Vertex } from '../models/vertex';
import { OdBuilderConfig } from './od-builder-config';
import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvRoadObjectType } from "../models/objects/tv-road-object";

@Injectable( {
	providedIn: 'root'
} )
export class LaneRoadMarkBuilder {

	public buildRoad ( road: TvRoad ): void {

		const laneSections = road.getLaneSections();

		for ( let i = 0; i < laneSections.length; i++ ) {

			const laneSection = laneSections[ i ];

			const lanes = laneSection.getLaneArray();

			for ( let j = 0; j < lanes.length; j++ ) {

				const lane = lanes[ j ];

				for ( const roadMark of lane.roadMarks ) {

					this.createRoadMark( roadMark, lane, laneSection, road );

				}

			}

		}
	}

	private createRoadMark ( roadMark: TvLaneRoadMark, lane: TvLane, laneSection: TvLaneSection, road: TvRoad ) {

		const roadMarks = lane.roadMarks;

		roadMark.clearMesh();

		const nextRoadMark = roadMarks.find( i => i.s > roadMark.s );

		const mesh = new MeshGeometryData();

		// setting the next coordinate
		// if the next road mark is not available,
		// then the next coordinate is the end of the lane section
		let nextS: number;

		if ( nextRoadMark ) {

			nextS = nextRoadMark.s;

		} else {

			nextS = laneSection.length;

		}

		const s2 = nextS - roadMark.s;

		if ( roadMark.type == TvRoadMarkTypes.NONE ) return;

		let posTheta = new TvPosTheta();

		const step = roadMark.length + roadMark.space;

		const start = laneSection.s + roadMark.s;

		for ( let s = 0; s < s2; s += step ) {

			posTheta.s = start + s;

			posTheta = road.getPosThetaAt( start + s );

			this.createVertex( posTheta, roadMark, mesh, roadMark.s + s );

		}

		if ( roadMark.s2 < 1 ) return;

		// // one last entry is required to create a mesh
		// const lastS = posTheta.s = ( start + mark.s2 ) - Maths.Epsilon;
		// const laneSectionS = ( mark.s + mark.s2 ) - Maths.Epsilon;
		// posTheta = lane.laneSection.road.getRoadCoordAt( lastS );
		// this.createVertex( posTheta, mark, mesh, laneSectionS );

		// at least 1 vertex is required to create a mesh
		if ( mesh.vertices.length > 0 ) {
			this.createRoadMarkObject( roadMark, mesh, roadMark.lane );
		}

	}

	private createVertex ( start: TvPosTheta, roadMark: TvLaneRoadMark, mesh: MeshGeometryData, laneSectionS: number ) {

		const endS = Math.min( start.s + roadMark.length, roadMark.lane.laneSection.endS );
		const end = roadMark.lane.laneSection.road.getPosThetaAt( endS );

		const lane = roadMark.lane;

		const width = roadMark.width;

		const height = lane.getHeightValue( laneSectionS );

		const elevationStart = lane.laneSection.road.getElevationValue( laneSectionS );
		const elevationEnd = lane.laneSection.road.getElevationValue( laneSectionS + roadMark.length );

		const startBorder = this.getLaneBorder( lane, laneSectionS, lane.laneSection, start );
		const endBorder = this.getLaneBorder( lane, laneSectionS + roadMark.length, lane.laneSection, end );

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
			new Vector3( x2, y2, elevationStart + height.outer ),
			new Vector2( 0, roadMark.width )
		);

		const backLeft = new Vertex(
			new Vector3( x3, y3, elevationEnd ),
			new Vector2( roadMark.length, 0 )
		);

		const backRight = new Vertex(
			new Vector3( x4, y4, elevationEnd + height.outer ),
			new Vector2( roadMark.length, roadMark.width )
		);

		if ( lane.side == TvLaneSide.LEFT ) {

			this.addVertex( mesh, frontLeft );
			this.addVertex( mesh, frontRight );
			this.addVertex( mesh, backLeft );
			this.addVertex( mesh, backRight );

		} else {

			this.addVertex( mesh, frontRight );
			this.addVertex( mesh, frontLeft );
			this.addVertex( mesh, backRight );
			this.addVertex( mesh, backLeft );
		}

		mesh.triangles.push( mesh.currentIndex + 0, mesh.currentIndex + 3, mesh.currentIndex + 2 );
		mesh.triangles.push( mesh.currentIndex + 0, mesh.currentIndex + 1, mesh.currentIndex + 3 );

		mesh.currentIndex = mesh.currentIndex + 4;

		mesh.indices.push( mesh.currentIndex );
	}

	private addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

		meshData.vertices.push( v1.position.x, v1.position.y, v1.position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT );

		meshData.normals.push( v1.normal.x, v1.normal.y, v1.normal.z );

		meshData.uvs.push( v1.uvs.x, v1.uvs.y );

	}

	private createRoadMarkObject ( roadMark: TvLaneRoadMark, mesh: MeshGeometryData, lane: TvLane ) {

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( mesh.vertices );
		const faces = new Float32Array( mesh.uvs );

		geometry.setIndex( mesh.triangles );

		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( faces, 2 ) );

		geometry.computeBoundingBox();

		geometry.computeVertexNormals();

		roadMark.gameObject = new GameObject( 'RoadMark:', geometry, this.getMaterial( roadMark ) );

		roadMark.gameObject.Tag = TvRoadObjectType.LANE_MARKING;

		roadMark.gameObject.userData.data = lane;

		roadMark.gameObject.userData.lane = lane;

		roadMark.gameObject.userData.roadMark = roadMark;

		lane.gameObject.add( roadMark.gameObject );
	}

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

	private getCumulativeWidth ( laneSectionS, lane: TvLane, laneSection: TvLaneSection ) {

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

	private getLaneBorder ( lane: TvLane, laneSectionS, laneSection: TvLaneSection, posTheta: TvPosTheta ) {

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, posTheta.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, posTheta.hdg );

		const cumulativeWidth = this.getCumulativeWidth( laneSectionS, lane, laneSection );

		return new Vector2(
			posTheta.x + ( cosHdgPlusPiO2 * cumulativeWidth ),
			posTheta.y + ( sinHdgPlusPiO2 * cumulativeWidth )
		);
	}


}
