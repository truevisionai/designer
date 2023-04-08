/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicMeta } from 'app/core/models/metadata.model';
import { PropModel } from 'app/core/models/prop-model.model';
import { SceneService } from 'app/core/services/scene.service';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { Maths } from 'app/utils/maths';
import earcut from 'earcut';
import { Object3D, Triangle } from 'three';
import { AssetDatabase } from './asset-database';

export class PropManager {

	private static prop?: DynamicMeta<PropModel>;

	static setProp ( prop: DynamicMeta<PropModel> ) {

		this.prop = prop;

	}

	static getProp (): DynamicMeta<PropModel> {

		return this.prop;

	}

	static updateCurvePolygonProps ( polygon: PropPolygon ) {

		polygon.props.forEach( p => SceneService.remove( p ) );

		polygon.props.splice( 0, polygon.props.length );

		const instance = AssetDatabase.getInstance( polygon.propGuid ) as Object3D;

		instance.up.set( 0, 0, 1 );

		instance.updateMatrixWorld( true );

		const vertices = [];

		polygon.spline.controlPointPositions.forEach( p => {
			vertices.push( p.x );
			vertices.push( p.y );
		} );

		// triangulating a polygon with 2d coords0
		const triangles = earcut( vertices );

		const faces = [];

		for ( let i = 0; i < triangles.length; i += 3 ) {

			faces.push( triangles.slice( i, i + 3 ) );

		}

		function randomInTriangle ( v1, v2, v3 ) {

			const r1 = Math.random();

			const r2 = Math.sqrt( Math.random() );

			const a = 1 - r2;

			const b = r2 * ( 1 - r1 );

			const c = r1 * r2;

			return ( v1.clone().multiplyScalar( a ) ).add( v2.clone().multiplyScalar( b ) ).add( v3.clone().multiplyScalar( c ) );
		}

		faces.forEach( face => {

			const v0 = polygon.spline.controlPointPositions[ face[ 0 ] ];
			const v1 = polygon.spline.controlPointPositions[ face[ 1 ] ];
			const v2 = polygon.spline.controlPointPositions[ face[ 2 ] ];

			const t = new Triangle( v0, v1, v2 );

			const area = t.getArea();

			let count = area * polygon.density * polygon.density * polygon.density * 0.5;

			count = Maths.clamp( count, 0, 1000 );

			for ( let i = 0; i < count; i++ ) {

				const position = randomInTriangle( v0, v1, v2 );

				const prop = instance.clone();

				prop.position.copy( position );

				polygon.props.push( prop );

				SceneService.add( prop );

			}

		} );
	}
}
