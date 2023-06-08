/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { GameObject } from '../../../core/game-object';
import { TvConsole } from '../../../core/utils/console';
import { COLOR } from '../../../shared/utils/colors.service';
import { MeshGeometryData } from '../models/mesh-geometry.data';
import { ObjectTypes, TvLaneSide, TvRoadMarkTypes } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvLaneRoadMark } from '../models/tv-lane-road-mark';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';
import { Vertex } from '../models/vertex';
import { OdBuilderConfig } from './od-builder-config';

export class TvRoadMarkBuilderV2 {

	constructor ( private road: TvRoad = null ) {

	}

	private _texture: any;

	private get texture () {

		if ( this._texture ) return this._texture;

		const texture = new THREE.TextureLoader().load( 'assets/flat-roadmarks.png' );

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.mapping = THREE.UVMapping;
		texture.repeat.set( 1, 1 );

		texture.anisotropy = 5;

		this._texture = texture;

		return this._texture;
	}

	public create (): void {

		this.buildRoad( this.road );

	}


	public buildRoad ( road: TvRoad ): void {

		this.road = road;

		for ( let i = 0; i < road.getLaneSections().length; i++ ) {

			const laneSection = road.getLaneSections()[ i ];

			const lanes = laneSection.getLaneArray();

			for ( let j = 0; j < lanes.length; j++ ) {

				this.processLane( lanes[ j ] );

			}

		}
	}

	public buildLane ( road: TvRoad, lane: TvLane ): void {

		this.processLane( lane );

	}

	private createMeshIndices ( geom: MeshGeometryData ): void {

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


	private processLane ( lane: TvLane ) {

		const roadMarks = lane.getRoadMarks();

		roadMarks.forEach( mark => mark.clearMesh() );

		roadMarks.forEach( ( mark, index ) => {

			const mesh = new MeshGeometryData();

			const start = lane.laneSection.s + mark.s;

			// setting the next coordinate
			// if the next road mark is not available,
			// then the next coordinate is the end of the lane section
			mark.lastSCoordinate = ( index < roadMarks.length - 1 )
				? roadMarks[ index + 1 ].sOffset
				: lane.laneSection.length;

			const posTheta = new TvPosTheta();

			for ( let step = 0; step < mark.length; step += OdBuilderConfig.ROAD_STEP ) {

				posTheta.s = start + step;

				lane.laneSection.road.getGeometryCoords( start + step, posTheta );

				this.createVertex( posTheta, mark, mesh, mark.s + step );

			}


			if ( mark.length < 1 ) return;

			// one last entry is required to create a mesh
			const lastS = posTheta.s = ( start + mark.length ) - Maths.Epsilon;
			const laneSectionS = ( mark.s + mark.length ) - Maths.Epsilon;
			lane.laneSection.road.getGeometryCoords( lastS, posTheta );
			this.createVertex( posTheta, mark, mesh, laneSectionS );


			// at least 1 vertex is required to create a mesh
			if ( mesh.vertices.length > 0 ) {
				this.createRoadMarkObject( mark, mesh, lane );
			}

		} );

	}

	private updateLastCoordinate ( roadMarks: TvLaneRoadMark[], laneSection: TvLaneSection ) {

		// setting the last coordinate
		roadMarks.forEach( ( mark, index ) => {

			if ( index < roadMarks.length - 1 ) {

				mark.lastSCoordinate = roadMarks[ index + 1 ].sOffset;

			} else {

				mark.lastSCoordinate = laneSection.length;

			}

		} );

	}

	private createVertex ( roadCoord: TvPosTheta, roadMark: TvLaneRoadMark, mesh: MeshGeometryData, laneSectionS: number ) {

		let x3, x4, y3, y4;

		const lane = roadMark.lane;

		const width = roadMark.getWidth();

		const roadMarkColor = this.getRoadMarkColor( roadMark );

		const height = lane.getHeightValue( laneSectionS );

		const elevation = lane.laneSection.road.getElevationValue( laneSectionS );

		const laneBorder = this.getLaneBorder( lane, laneSectionS, lane.laneSection, roadCoord );

		const cosFactor = Maths.cosHdgPlusPiO2( lane.side, roadCoord.hdg );
		const sinFactor = Maths.sinHdgPlusPiO2( lane.side, roadCoord.hdg );

		const modifiers = this.getTextureMinMax( roadMark );

		let x1 = laneBorder.x + ( cosFactor * width * 0.5 );
		let y1 = laneBorder.y + ( sinFactor * width * 0.5 );
		let x2 = laneBorder.x - ( cosFactor * width * 0.5 );
		let y2 = laneBorder.y - ( sinFactor * width * 0.5 );

		let texX = modifiers.min1;
		let texY = roadCoord.s / TvLaneRoadMark.ROADMARK_BROKEN_TILING;

		// // shift the x,y in case it is a 2 line mark
		// if ( modifiers.type > 0 ) {
		//
		// 	x1 = laneBorder.x + cosFactor * 1.5 * width;
		// 	y1 = laneBorder.y + sinFactor * 1.5 * width;
		//
		// 	x2 = laneBorder.x + cosFactor * 0.25 * width;
		// 	y2 = laneBorder.y + sinFactor * 0.25 * width;
		//
		// 	x3 = laneBorder.x - cosFactor * 0.25 * width;
		// 	y3 = laneBorder.y - sinFactor * 0.25 * width;
		//
		// 	x4 = laneBorder.x - cosFactor * 1.5 * width;
		// 	y4 = laneBorder.y - sinFactor * 1.5 * width;
		//
		// }

		// First vertex
		const v1 = new Vertex(
			new Vector3( x1, y1, elevation ),
			new Vector2( texX, texY )
		);

		const v2 = new Vertex(
			new Vector3( x2, y2, elevation + height.getOuter() ),
			new Vector2( modifiers.max1, texY )
		);

		if ( lane.side == TvLaneSide.LEFT ) {

			this.addVertex( mesh, v1 );
			this.addVertex( mesh, v2 );

		} else {

			this.addVertex( mesh, v2 );
			this.addVertex( mesh, v1 );
		}

		// if ( modifiers.type > 0 ) {
		//
		// 	const v3 = new Vertex(
		// 		new Vector3( x3, y3, elevation ),
		// 		new Vector2( modifiers.min2, texY )
		// 	);
		//
		// 	const v4 = new Vertex(
		// 		new Vector3( x4, y4, elevation + height.getOuter() ),
		// 		new Vector2( modifiers.max2, texY )
		// 	);
		//
		// 	if ( lane.side == TvLaneSide.LEFT ) {
		//
		// 		this.addVertex( mesh, v3 );
		// 		this.addVertex( mesh, v4 );
		//
		// 	} else {
		//
		// 		this.addVertex( mesh, v4 );
		// 		this.addVertex( mesh, v3 );
		// 	}
		//
		// }
	}

	private getTextureMinMax ( roadMark: TvLaneRoadMark ): { min2: number; type: number; min1: number; max2: number; max1: number } {

		let type: number = 0;

		const roadMarkTexWidth = 0.5;

		let roadMarkTexModifierMin1 = 0;
		let roadMarkTexModifierMax1 = 0;

		let roadMarkTexModifierMin2 = 0;
		let roadMarkTexModifierMax2 = 0;

		const markingType: TvRoadMarkTypes = roadMark.getType();

		switch ( markingType ) {
			case TvRoadMarkTypes.NONE:
				break;
			case TvRoadMarkTypes.SOLID:
				type = 0;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				break;
			case TvRoadMarkTypes.BROKEN:
				type = 0;
				roadMarkTexModifierMin1 = roadMarkTexWidth;
				roadMarkTexModifierMax1 = 1;
				break;
			case TvRoadMarkTypes.SOLID_SOLID:
				TvConsole.warn('SOLID_SOLID lane marking not supported');
				type = 1;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				roadMarkTexModifierMax2 = roadMarkTexWidth;
				break;
			case TvRoadMarkTypes.SOLID_BROKEN:
				TvConsole.warn('SOLID_BROKEN lane marking not supported');
				type = 2;
				roadMarkTexModifierMin1 = 0;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				roadMarkTexModifierMin2 = roadMarkTexWidth;
				roadMarkTexModifierMax2 = 1;
				break;
			case TvRoadMarkTypes.BROKEN_SOLID:
				TvConsole.warn('BROKE_SOLID lane marking not supported');
				type = 3;
				roadMarkTexModifierMin1 = roadMarkTexWidth;
				roadMarkTexModifierMax1 = 1;
				roadMarkTexModifierMin2 = 0;
				roadMarkTexModifierMax2 = roadMarkTexWidth;
				break;
			case TvRoadMarkTypes.BROKEN_BROKEN:
				TvConsole.warn('BROKEN_BROKEN lane marking not supported');
				type = 0;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				break;
			case TvRoadMarkTypes.BOTTS_DOTS:
				TvConsole.warn('BOTTS_DOTS lane marking not supported');
				type = 0;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				break;
			case TvRoadMarkTypes.GRASS:
				TvConsole.warn('GRASS lane marking not supported');
				type = 0;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				break;
			case TvRoadMarkTypes.CURB:
				TvConsole.warn('CURB lane marking not supported');
				type = 0;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				break;
			default:
				type = 0;
				roadMarkTexModifierMax1 = roadMarkTexWidth;
				break;
		}

		return {
			type,
			min1: roadMarkTexModifierMin1,
			max1: roadMarkTexModifierMax1,
			min2: roadMarkTexModifierMin2,
			max2: roadMarkTexModifierMax2,
		};
	}

	private getRoadMarkColor ( roadMark: TvLaneRoadMark ) {

		// Define the color of the current road mark:
		if ( roadMark.getColor() === ( 'standard' ) || roadMark.getColor() === ( 'white' ) ) {
			return [ 255, 255, 255 ];
		} else if ( roadMark.getColor() === 'yellow' ) {
			return [ 255, 255, 0 ];
		} else {
			return [ 255, 255, 255 ];
		}
	}

	private addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

		meshData.vertices.push( v1.position.x, v1.position.y, v1.position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT );

		meshData.normals.push( v1.normal.x, v1.normal.y, v1.normal.z );

		meshData.uvs.push( v1.uvs.x, v1.uvs.y );

		meshData.indices.push( meshData.currentIndex++ );

	}

	private createRoadMarkObject ( roadMark: TvLaneRoadMark, mesh: MeshGeometryData, lane: TvLane ) {

		this.createMeshIndices( mesh );

		const material = this.getMaterial( roadMark );

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( mesh.vertices );
		const colors = new Float32Array( mesh.colors );
		const normals = new Float32Array( mesh.normals );
		const faces = new Float32Array( mesh.uvs );

		geometry.setIndex( mesh.triangles );

		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( faces, 2 ) );

		geometry.computeBoundingBox();

		geometry.computeVertexNormals();

		roadMark.gameObject = new GameObject( 'RoadMark:', geometry, material );

		roadMark.gameObject.Tag = ObjectTypes.LANE_MARKING;

		roadMark.gameObject.userData.data = lane;

		roadMark.gameObject.userData.lane = lane;

		roadMark.gameObject.userData.roadMark = roadMark;

		lane.gameObject.add( roadMark.gameObject );
	}

	private getMaterial ( roadMark: TvLaneRoadMark ) {

		let color = COLOR.WHITE;

		switch ( roadMark.color ) {

			case 'standard':
				color = COLOR.WHITE;
				break;

			case 'white':
				color = COLOR.WHITE;
				break;

			case 'yellow':
				color = COLOR.YELLOW;
				break;

			case 'red':
				color = COLOR.RED;
				break;

			default:
				color = COLOR.WHITE;
				break;

		}

		return new THREE.MeshBasicMaterial( {
			color: color,
			map: this.texture,
			transparent: true,
			alphaTest: 0.1,
			wireframe: false,
			side: THREE.FrontSide
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

	private getLaneBorder ( lane, laneSectionS, laneSection, posTheta ) {

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, posTheta.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, posTheta.hdg );

		const cumulativeWidth = this.getCumulativeWidth( laneSectionS, lane, laneSection );

		return new Vector2(
			posTheta.x + ( cosHdgPlusPiO2 * cumulativeWidth ),
			posTheta.y + ( sinHdgPlusPiO2 * cumulativeWidth )
		);
	}
}
