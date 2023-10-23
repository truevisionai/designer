/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { COLOR } from 'app/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, Vector3 } from 'three';
import { CURVE_Y, MAX_CTRL_POINTS } from './spline-config';

export class TangentLine {

	public radiuses: any[];

	public mesh: LineSegments;

	private hdgs: any[] = [];

	private geometry: BufferGeometry;

	private curveType: string = 'tangent';

	constructor ( public points: Vector3[] ) {

		this.geometry = new BufferGeometry();

		this.geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( MAX_CTRL_POINTS * 2 * 3 ), 3 ) );

		this.mesh = new LineSegments( this.geometry, new LineBasicMaterial( { color: COLOR.DARKBLUE, opacity: 0.35 } ) );

		this.mesh.name = 'tangent';

		this.mesh.castShadow = true;

		this.mesh.renderOrder = 3;

		this.mesh.frustumCulled = false;

	}

	update ( hdgs: any[], points?: any[] ) {

		this.hdgs = hdgs;

		const position = this.geometry.attributes.position as BufferAttribute;

		const pos = new Vector3();

		for ( let i = 0; i < points.length; i++ ) {

			pos.set( Math.cos( this.hdgs[ i ][ 0 ] ), Math.sin( this.hdgs[ i ][ 0 ] ), CURVE_Y )

				.multiplyScalar( this.hdgs[ i ][ 1 ] )

				.add( points[ i ] );

			position.setXYZ( i * 2 + 0, pos.x, pos.y, pos.z );

			pos.set( Math.cos( this.hdgs[ i ][ 0 ] ), Math.sin( this.hdgs[ i ][ 0 ] ), CURVE_Y )

				.multiplyScalar( -this.hdgs[ i ][ 2 ] )

				.add( points[ i ] );

			position.setXYZ( i * 2 + 1, pos.x, pos.y, pos.z );

		}

		for ( let i = points.length; i < MAX_CTRL_POINTS; i++ ) {

			position.setXYZ( i * 2 + 0, pos.x, pos.y, pos.z );

			position.setXYZ( i * 2 + 1, pos.x, pos.y, pos.z );

		}

		position.needsUpdate = true;

	}

	updateOneSegment ( idx, point ) {

		const position = this.geometry.attributes.position as BufferAttribute;

		const pos1 = new Vector3();

		const pos2 = new Vector3();

		pos1.set( Math.cos( this.hdgs[ idx ][ 0 ] ), Math.sin( this.hdgs[ idx ][ 0 ] ), CURVE_Y )

			.multiplyScalar( this.hdgs[ idx ][ 1 ] )

			.add( point );

		position.setXYZ( idx * 2 + 0, pos1.x, pos1.y, pos1.z );

		pos2.set( Math.cos( this.hdgs[ idx ][ 0 ] ), Math.sin( this.hdgs[ idx ][ 0 ] ), CURVE_Y )

			.multiplyScalar( -this.hdgs[ idx ][ 2 ] )

			.add( point );

		position.setXYZ( idx * 2 + 1, pos2.x, pos2.y, pos2.z );

		position.needsUpdate = true;

		return [ pos1, pos2 ];

	}

}


