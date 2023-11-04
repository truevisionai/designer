/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/services/scene.service';
import * as THREE from 'three';
import { BufferGeometry, Line, Vector3 } from 'three';
import { COLOR } from '../../../views/shared/utils/colors.service';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';

export class OdRoadReferenceLineBuilder {

	// private points: OdPosTheta[] = [];

	private static material = new THREE.LineBasicMaterial( { color: COLOR.RED, linewidth: 2 } );
	line: any;
	private cache: Map<number, Line> = new Map<number, Line>();

	constructor ( private road: TvRoad ) {

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

		line.name = 'road-reference-line';

		line.userData.is_selectable = false;

		SceneService.addToolObject( line );
	}

	private static convertToVector3 ( points: TvPosTheta[] ): Vector3[] {

		return points.map( point => point.toVector3() );

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
}
