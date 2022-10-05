/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { BufferGeometry, Line, Vector3 } from 'three';
import { COLOR } from '../../../shared/utils/colors.service';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';

export class OdRoadReferenceLineBuilder {

	// private points: OdPosTheta[] = [];

	line: any;
	private material = new THREE.LineBasicMaterial( { color: COLOR.RED } );
	private cache: Map<number, Line> = new Map<number, Line>();

	constructor ( private road: TvRoad ) {

	}

	public clear ( road: TvRoad ) {

		// if ( this.cache.has( road.id ) ) {

		// road.GameObject.remove( this.cache.get( road.id ) );

		// this.cache.deconste( road.id );

		// }

	}

	public create () {

		this.buildRoad( this.road );

	}

	public buildRoad ( road: TvRoad ) {

		this.road = road;

		const tmp = new TvPosTheta();
		const points: TvPosTheta[] = [];

		for ( let s = 0; s <= this.road.length; s++ ) {

			road.getGeometryCoords( s, tmp );
			points.push( new TvPosTheta( tmp.x, tmp.y, tmp.hdg ) );

		}

		// last entry
		road.getGeometryCoords( this.road.length - Maths.Epsilon, tmp );
		points.push( new TvPosTheta( tmp.x, tmp.y, tmp.hdg ) );

		this.drawLine( road, points );

	}

	private drawLine ( road: TvRoad, positions: TvPosTheta[] ) {

		// this.curve = new THREE.CatmullRomCurve3( this.getVector3Points() );

		// const points = this.curve.getPoints( 50 );

		const points = this.convertToVector3( positions );

		const geometry = new BufferGeometry().setFromPoints( points );

		const object = new Line( geometry, this.material );

		object.name = 'Line';

		object.userData.is_selectable = false;

		if ( this.line ) road.gameObject.remove( this.line );

		this.line = object;

		road.gameObject.add( this.line );

		// this.cache.set( road.id, object );
	}

	private convertToVector3 ( points: TvPosTheta[] ): Vector3[] {

		const tmp: Vector3[] = [];

		points.forEach( point => {

			tmp.push( new Vector3( point.x, point.y, 0 ) );

		} );

		return tmp;
	}
}
