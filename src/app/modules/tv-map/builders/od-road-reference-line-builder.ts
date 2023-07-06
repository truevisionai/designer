/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { BufferGeometry, Line, Vector3 } from 'three';
import { COLOR } from '../../../shared/utils/colors.service';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';
import { SceneService } from 'app/core/services/scene.service';

export class OdRoadReferenceLineBuilder {

	// private points: OdPosTheta[] = [];

	line: any;
	private static material = new THREE.LineBasicMaterial( { color: COLOR.RED, linewidth: 2 } );
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

		let tmp = new TvPosTheta();
		const points: TvPosTheta[] = [];

		for ( let s = 0; s <= this.road.length; s++ ) {

			tmp = road.getRoadCoordAt( s );
			points.push( new TvPosTheta( tmp.x, tmp.y, tmp.hdg ) );

		}

		// last entry
		tmp = road.getRoadCoordAt( this.road.length - Maths.Epsilon );
		points.push( new TvPosTheta( tmp.x, tmp.y, tmp.hdg ) );

		OdRoadReferenceLineBuilder.drawLine( points );

	}

	public static showRoadReferenceLine ( road: TvRoad ) {

		let tmp = new TvPosTheta();
		const points: TvPosTheta[] = [];

		for ( let s = 0; s <= road.length; s++ ) {

			tmp = road.getRoadCoordAt( s );
			tmp.z += 0.1;
			points.push( tmp.clone() );

		}

		// last entry
		tmp = road.getRoadCoordAt( road.length - Maths.Epsilon );
		points.push( tmp.clone() );

		OdRoadReferenceLineBuilder.drawLine( points );

	}

	private static drawLine ( positions: TvPosTheta[] ) {

		const points = OdRoadReferenceLineBuilder.convertToVector3( positions );

		const geometry = new BufferGeometry();

		geometry.name = 'OdRoadReferenceLineGeometry';

		geometry.setFromPoints( points );

		const line = new Line( geometry, this.material );

		line.name = 'Line';

		line.userData.is_selectable = false;

		SceneService.addHelper( line );
	}

	private static convertToVector3 ( points: TvPosTheta[] ): Vector3[] {

		const tmp: Vector3[] = [];

		points.forEach( point => {

			tmp.push( new Vector3( point.x, point.y, point.z ) );

		} );

		return tmp;
	}
}
