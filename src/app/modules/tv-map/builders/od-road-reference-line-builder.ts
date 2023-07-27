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

		const points: TvPosTheta[] = road.getReferenceLinePoints();

		OdRoadReferenceLineBuilder.drawLine( points );

	}

	public static showRoadReferenceLine ( road: TvRoad ) {

		let tmp = new TvPosTheta();

		const points: TvPosTheta[] = road.getReferenceLinePoints();

		points.forEach( point => point.z += 0.1 );

		this.drawLine( points );

	}

	private static drawLine ( positions: TvPosTheta[] ) {

		const points = this.convertToVector3( positions );

		const geometry = new BufferGeometry();

		geometry.name = 'OdRoadReferenceLineGeometry';

		geometry.setFromPoints( points );

		const line = new Line( geometry, this.material );

		line.name = 'Line';

		line.userData.is_selectable = false;

		SceneService.addHelper( line );
	}

	private static convertToVector3 ( points: TvPosTheta[] ): Vector3[] {

		return points.map( point => point.toVector3() );

	}
}
