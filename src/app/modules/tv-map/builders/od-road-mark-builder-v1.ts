/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { GameObject } from '../../../core/game-object';
import { COLOR } from '../../../shared/utils/colors.service';
import { MeshGeometryData } from '../models/mesh-geometry.data';
import { ObjectTypes, TvLaneSide, TvRoadMarkTypes } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvLaneRoadMark } from '../models/tv-lane-road-mark';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvRoad } from '../models/tv-road.model';
import { Vertex } from '../models/vertex';
import { OdBuilderConfig } from './od-builder-config';

export class OdRoadMarkBuilderV1 {

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


	public buildRoad ( road: TvRoad ): void {

		for ( let i = 0; i < road.getLaneSections().length; i++ ) {

			const laneSection = road.getLaneSections()[ i ];

			const lanes = laneSection.getLaneArray();

			for ( let j = 0; j < lanes.length; j++ ) {

				this.processLane( laneSection, lanes[ j ] );

			}

		}
	}

	public buildLane ( road: TvRoad, lane: TvLane ): void {

		const laneSection = road.getLaneSectionById( lane.laneSectionId );

		this.processLane( laneSection, lane );

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


	private processLane ( laneSection: TvLaneSection, lane: TvLane ) {

		const roadMarks = lane.getRoadMarks();

		roadMarks.forEach( mark => mark.clearMesh() );

		roadMarks.forEach( ( roadMark, index ) => {

			const mesh = new MeshGeometryData();

			const start = laneSection.s + roadMark.s;

			// setting the next coordinate
			// if the next road mark is not available,
			// then the next coordinate is the end of the lane section
			roadMark.lastSCoordinate = ( index < roadMarks.length - 1 )
				? roadMarks[ index + 1 ].sOffset
				: laneSection.length;

			for ( let step = 0; step < roadMark.length; step += OdBuilderConfig.ROAD_STEP ) {

				// TODO: need to clamp these values
				const s = start + step;

				const laneSectionS = roadMark.s + step;

				this.createVertex( s, roadMark, laneSection, lane, mesh, laneSectionS );

			}

			// one last entry to nearest to the end
			if ( roadMark.length > 1 ) {

				const lastS = ( start + roadMark.length ) - Maths.Epsilon;

				const laneSectionS = ( roadMark.s + roadMark.length ) - Maths.Epsilon;

				this.createVertex( lastS, roadMark, laneSection, lane, mesh, laneSectionS );

			}

			// atleast 1 vertex is required to create a mesh
			if ( mesh.vertices.length < 1 ) return;

			this.drawRoadMark( roadMark, mesh, lane );

		} );

	}

	private createVertex ( s, roadMark: TvLaneRoadMark, laneSection: TvLaneSection, lane: TvLane, mesh: MeshGeometryData, laneSectionS: number ) {

		const cumulativeWidth = this.getCumulativeWidth( laneSectionS, lane, laneSection );

		const roadCoord = lane.laneSection.road.getRoadCoordAt( s );

		const height = lane.getHeightValue( laneSectionS );

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, roadCoord.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, roadCoord.hdg );

		const laneBorderX = roadCoord.x + ( cosHdgPlusPiO2 * cumulativeWidth );
		const laneBorderY = roadCoord.y + ( sinHdgPlusPiO2 * cumulativeWidth );

		const roadMarkWidth = roadMark.getWidth();

		const x1 = laneBorderX + ( cosHdgPlusPiO2 * roadMarkWidth * 0.5 );
		const y1 = laneBorderY + ( sinHdgPlusPiO2 * roadMarkWidth * 0.5 );

		const x2 = laneBorderX - ( cosHdgPlusPiO2 * roadMarkWidth * 0.5 );
		const y2 = laneBorderY - ( sinHdgPlusPiO2 * roadMarkWidth * 0.5 );

		//////////////////////////////////////////////////////////////

		let roadMarkColor, type;

		const roadMarkTexWidth = 0.5;
		let roadMarkTexModifierMin1 = 0;
		let roadMarkTexModifierMax1 = 0;

		let roadMarkTexModifierMin2 = 0;
		let roadMarkTexModifierMax2 = 0;

		// // Define the color of the current road mark:
		// if ( roadMark.getColor() === ( 'standard' ) || roadMark.getColor() === ( 'white' ) ) {
		// 	roadMarkColor = [ 255, 255, 255 ];
		// } else if ( roadMark.getColor() === 'yellow' ) {
		// 	roadMarkColor = [ 255, 255, 0 ];
		// } else {
		// 	roadMarkColor = [ 255, 255, 255 ];
		// }

		// Set the tex coords modifiers based on the type of the road mark
		if ( roadMark.getType() === TvRoadMarkTypes.NONE ) {
			type = -1;      // debug only
			return false;
		}

		if ( roadMark.getType() === TvRoadMarkTypes.SOLID ) {

			type = 0;
			roadMarkTexModifierMax1 = roadMarkTexWidth;

		} else if ( roadMark.getType() === TvRoadMarkTypes.BROKEN ) {

			type = 0;
			roadMarkTexModifierMin1 = roadMarkTexWidth;
			roadMarkTexModifierMax1 = 1;

		} else if ( roadMark.getType() === TvRoadMarkTypes.SOLID_SOLID ) {

			type = 1;
			roadMarkTexModifierMax1 = roadMarkTexWidth;
			roadMarkTexModifierMax2 = roadMarkTexWidth;

		} else if ( roadMark.getType() === TvRoadMarkTypes.SOLID_BROKEN ) {

			type = 2;
			roadMarkTexModifierMin1 = 0;
			roadMarkTexModifierMax1 = roadMarkTexWidth;
			roadMarkTexModifierMin2 = roadMarkTexWidth;
			roadMarkTexModifierMax2 = 1;

		} else if ( roadMark.getType() === TvRoadMarkTypes.BROKEN_SOLID ) {

			type = 3;
			roadMarkTexModifierMin1 = roadMarkTexWidth;
			roadMarkTexModifierMax1 = 1;
			roadMarkTexModifierMin2 = 0;
			roadMarkTexModifierMax2 = roadMarkTexWidth;

		}

		// ===============================
		// Add Vertices
		// ===============================
		let texX;
		const texY = s / TvLaneRoadMark.ROADMARK_BROKEN_TILING;

		// // shift the x,y in case it is a 2 line mark
		// if ( type > 0 ) {
		//
		//     x1 = laneBorderX + cosHdgPlusPiO2 * 1.5 * width;
		//     y1 = laneBorderY + sinHdgPlusPiO2 * 1.5 * width;
		//
		//     x2 = laneBorderX + cosHdgPlusPiO2 * 0.25 * width;
		//     y2 = laneBorderY + sinHdgPlusPiO2 * 0.25 * width;
		//
		//     x3 = laneBorderX - cosHdgPlusPiO2 * 0.25 * width;
		//     y3 = laneBorderY - sinHdgPlusPiO2 * 0.25 * width;
		//
		//     x4 = laneBorderX - cosHdgPlusPiO2 * 1.5 * width;
		//     y4 = laneBorderY - sinHdgPlusPiO2 * 1.5 * width;
		// }


		///////////////////////////////////////////////////////////////

		// First vertex
		texX = roadMarkTexModifierMin1;

		const v1 = new Vertex(
			new Vector3( x1, y1, roadCoord.z ),
			new Vector2( texX, texY )
		);

		// Second vertex
		texX = roadMarkTexModifierMax1;

		const v2 = new Vertex(
			new Vector3( x2, y2, roadCoord.z + height.getOuter() ),
			new Vector2( texX, texY )
		);

		if ( lane.side == TvLaneSide.LEFT ) {
			this.addVertex( mesh, v1 );
			this.addVertex( mesh, v2 );
		} else {
			this.addVertex( mesh, v2 );
			this.addVertex( mesh, v1 );
		}

		// if ( type > 0 ) {
		//
		//     // First vertex of the second line
		//     texX = roadMarkTexModifierMin2;
		//
		//     roadMarksGeometry.vertices.push( y3, z, x3 );
		//     roadMarksGeometry.normals.push( 0, 0, 1 );
		//     roadMarksGeometry.colors.push( roadMarkColor );
		//     roadMarksGeometry.texCoords.push( texX, texY );
		//     roadMarksGeometry.currentIndex++;
		//
		//     // Second vertex of the second line
		//     texX = roadMarkTexModifierMax2;
		//
		//     roadMarksGeometry.vertices.push( y4, z, x4 );
		//     roadMarksGeometry.normals.push( 0, 0, 1 );
		//     roadMarksGeometry.colors.push( roadMarkColor );
		//     roadMarksGeometry.texCoords.push( texX, texY );
		//     roadMarksGeometry.currentIndex++;
		//
		// }
	}

	private addVertex ( meshData: MeshGeometryData, v1: Vertex ) {
		meshData.vertices.push( v1.position.x, v1.position.y, v1.position.z + 0.11 );
		meshData.normals.push( v1.normal.x, v1.normal.y, v1.normal.z );
		meshData.uvs.push( v1.uvs.x, v1.uvs.y );
		meshData.indices.push( meshData.currentIndex++ );
	}

	private drawRoadMark ( roadMark: TvLaneRoadMark, mesh: MeshGeometryData, lane: TvLane ) {

		this.createMeshIndices( mesh );

		const material = this.getMaterial( roadMark );

		const geometry = this.getGeometry( mesh );

		roadMark.gameObject = new GameObject( 'RoadMark:', geometry, material );

		roadMark.gameObject.Tag = ObjectTypes.LANE_MARKING;

		roadMark.gameObject.userData.data = lane;

		roadMark.gameObject.userData.lane = lane;

		roadMark.gameObject.userData.roadMark = roadMark;

		lane.gameObject.add( roadMark.gameObject );
	}

	private getMaterial ( roadMark: TvLaneRoadMark ) {

		let color: number;

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

	private getGeometry ( mesh: MeshGeometryData ) {

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

		return geometry;
	}

	private getCumulativeWidth ( s, lane: TvLane, laneSection: TvLaneSection ) {

		let width = 0;

		switch ( lane.side ) {

			case TvLaneSide.LEFT:
				width = laneSection.getWidthUptoEnd( lane, s );
				break;

			case TvLaneSide.CENTER:
				width = 0;
				break;

			case TvLaneSide.RIGHT:
				width = laneSection.getWidthUptoEnd( lane, s );
				break;

		}

		return width;
	}

}
