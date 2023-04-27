/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { GameObject } from '../../../core/game-object';
import { SceneService } from '../../../core/services/scene.service';
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

export class OdRoadMarkBuilder {

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

		for ( let i = 0; i < road.lanes.laneSections.length; i++ ) {

			const laneSection = road.lanes.laneSections[ i ];

			laneSection.getLaneVector().forEach( lane => {

				this.processLane( laneSection, lane );

			} );

		}
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

		// this.updateLastCoordinate( roadMarks, laneSection );

		roadMarks.forEach( ( mark, index ) => {

			const mesh = new MeshGeometryData();

			const start = laneSection.s + mark.s;

			// setting the next coordinate
			// if the next road mark is not available,
			// then the next coordinate is the end of the lane section
			mark.lastSCoordinate = ( index < roadMarks.length - 1 )
				? roadMarks[ index + 1 ].sOffset
				: laneSection.length;

			for ( let step = 0; step < mark.length; step += OdBuilderConfig.ROAD_STEP ) {

				this.createVertex( start + step, mark, laneSection, lane, mesh, mark.s + step );

			}

			// one last entry to nearest to the end
			if ( mark.length > 1 ) {

				const lastS = ( start + mark.length ) - Maths.Epsilon;

				const laneSectionS = ( mark.s + mark.length ) - Maths.Epsilon;

				this.createVertex( lastS, mark, laneSection, lane, mesh, laneSectionS );

			}

			// atleast 1 vertex is required to create a mesh
			if ( mesh.vertices.length > 0 ) this.drawRoadMark( mark, mesh, lane );

		} )

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

	private createVertex ( s, roadMark: TvLaneRoadMark, laneSection: TvLaneSection, lane: TvLane, mesh: MeshGeometryData, laneSectionS: number ) {

		const posTheta = new TvPosTheta();

		const cumulativeWidth = this.getCumulativeWidth( laneSectionS, lane, laneSection );

		// if ( cumulativeWidth > 100 ) console.log( laneSectionS, this.road.id, laneSection.s, lane.id, cumulativeWidth );

		this.road.getGeometryCoords( s, posTheta );

		// const laneOffset = this.road.lanes.getLaneOffsetAt( s );
		// posTheta.addLateralOffset( laneOffset );
		// let laneWidth = laneSection.getWidthUptoEnd( lane, s );

		const height = lane.getHeightValue( laneSectionS );
		const elevation = this.road.getElevationValue( laneSectionS );

		// console.log( roadMark.getHeight() );

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, posTheta.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, posTheta.hdg );

		const laneBorderX = posTheta.x + ( cosHdgPlusPiO2 * cumulativeWidth );
		const laneBorderY = posTheta.y + ( sinHdgPlusPiO2 * cumulativeWidth );

		// console.log( `LaneSection: ${laneSection.id} Lane: ${lane.id} Width: ${cumulativeWidth} S: ${s} LS: ${laneSectionS}` );

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

		// Define the color of the current road mark:
		if ( roadMark.getColor() === ( 'standard' ) || roadMark.getColor() === ( 'white' ) ) {
			roadMarkColor = [ 255, 255, 255 ];
		} else if ( roadMark.getColor() === 'yellow' ) {
			roadMarkColor = [ 255, 255, 0 ];
		} else {
			roadMarkColor = [ 255, 255, 255 ];
		}

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

		const v1 = new Vertex();
		v1.Position = new Vector3( x1, y1, elevation );
		v1.TexCoord = new Vector2( texX, texY );


		// Second vertex
		texX = roadMarkTexModifierMax1;

		const v2 = new Vertex();
		v2.Position = new Vector3( x2, y2, elevation + height.getOuter() );
		v2.TexCoord = new Vector2( texX, texY );

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
		meshData.vertices.push( v1.Position.x, v1.Position.y, v1.Position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT );
		meshData.normals.push( v1.Normal.x, v1.Normal.y, v1.Normal.z );
		meshData.texCoords.push( v1.TexCoord.x, v1.TexCoord.y );
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

	private getGeometry ( mesh: MeshGeometryData ) {

		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array( mesh.vertices );
		const colors = new Float32Array( mesh.colors );
		const normals = new Float32Array( mesh.normals );
		const faces = new Float32Array( mesh.texCoords );

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

	private processRoadMark ( roadmark: TvLaneRoadMark, road: TvRoad, laneSection: TvLaneSection, lane: TvLane, mesh: MeshGeometryData ) {


	}
}
