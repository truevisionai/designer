/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { BufferGeometry } from 'three';
import { TvLaneSide } from '../../../map/models/tv-common';
import { TvLane } from '../../../map/models/tv-lane';
import { TvLaneSection } from '../../../map/models/tv-lane-section';
import { TvPosTheta } from '../../../map/models/tv-pos-theta';
import { TvRoad } from '../../../map/models/tv-road.model';
import { OdBuilderConfig } from './od-builder-config';


export class LaneBufferGeometry extends BufferGeometry {

	constructor ( private lane: TvLane, private laneSection: TvLaneSection, private road: TvRoad ) {

		super();

		this.build();

	}

	build (): void {
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

			refLine = this.road.getPosThetaAt( s );

			const width = lane.getWidthValue( s );
			const height = lane.getHeightValue( s );

			const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, refLine.hdg );
			const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, refLine.hdg );

			const x1 = refLine.x + cosHdgPlusPiO2 * cumulativeWidth;
			const y1 = refLine.y + sinHdgPlusPiO2 * cumulativeWidth;

			const x2 = refLine.x + cosHdgPlusPiO2 * ( cumulativeWidth + width );
			const y2 = refLine.y + sinHdgPlusPiO2 * ( cumulativeWidth + width );

			if ( lane.isRight ) {

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

		cumulativeWidth = laneSection.getWidthUptoStart( lane, laneSection.getLength() );

		refLine = this.road.getPosThetaAt( step );

		const width = lane.getWidthValue( step );
		const height = lane.getHeightValue( step );

		const cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, refLine.hdg );
		const sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, refLine.hdg );

		const x1 = refLine.x + cosHdgPlusPiO2 * cumulativeWidth;
		const y1 = refLine.y + sinHdgPlusPiO2 * cumulativeWidth;

		const x2 = refLine.x + cosHdgPlusPiO2 * ( cumulativeWidth + width );
		const y2 = refLine.y + sinHdgPlusPiO2 * ( cumulativeWidth + width );

		if ( lane.isRight ) {

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
