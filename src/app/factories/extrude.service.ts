import { Injectable } from '@angular/core';
import { CatmullRomPath } from 'app/core/shapes/cubic-spline-curve';
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { BufferGeometry, CurvePath, ExtrudeGeometry, ExtrudeGeometryOptions, Mesh, MeshStandardMaterial, Shape, Vector3 } from 'three';
import { TvRoadObjectSkeleton } from "../modules/tv-map/models/objects/tv-road-object-skeleton";
import { TvObjectPolyline } from "../modules/tv-map/models/objects/tv-object-polyline";
import { TvObjectVertexRoad } from "../modules/tv-map/models/objects/tv-object-vertex-road";
import { TvObjectVertexLocal } from "../modules/tv-map/models/objects/tv-object-vertex-local";

@Injectable( {
	providedIn: 'root'
} )
export class ExtrudeService {

	constructor () { }

	// const sqLength = 1, sqWidth = 0.25;
	// const squareShape = new Shape()
	// 	.moveTo( 0, 0 )
	// 	.lineTo( 0, -sqWidth )
	// 	.lineTo( -sqLength, -sqWidth )
	// 	.lineTo( -sqLength, 0 )
	// 	.lineTo( 0, 0 );
	buildShape ( polyline: TvObjectPolyline ): Shape {

		const points: Vector3[] = [];

		polyline.vertices.forEach( vertex => {

			if ( vertex instanceof TvObjectVertexRoad ) {

				throw new Error( 'Not implemented' );

			} else if ( vertex instanceof TvObjectVertexLocal ) {

				points.push( vertex.uvz );

			}

		} )

		const shape = new Shape();

		shape.moveTo( 0, 0 );

		for ( let i = 0; i < points.length; i++ ) {

			shape.lineTo( -points[ i ].z, -points[ i ].y );

		}

		return shape;
	}

	buildRadiusObject ( points: Vector3[], radius: number ) {

		// const geometry = new THREE.BufferGeometry().setFromPoints( points );

		// const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

		// const curve = new THREE.CatmullRomCurve3( points );

		// const points2 = curve.getPoints( 50 );

		// const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );

		// const line = new THREE.Line( geometry2, material );

		// return line;

	}

	buildSkeletonGeometries ( roadObject: TvRoadObject, skeleton: TvRoadObjectSkeleton ): BufferGeometry[] {

		const geometies = [];

		skeleton.polylines.forEach( polyline => {

			geometies.push( this.buldPolylineGeometry( roadObject, polyline ) );

		} )

		return geometies;
	}

	buldPolylineGeometry ( roadObject: TvRoadObject, polyline: TvObjectPolyline ): BufferGeometry {

		const points: Vector3[] = [];

		const radii = [];

		polyline.vertices.forEach( vertex => {

			radii.push( vertex.radius );

			if ( vertex instanceof TvObjectVertexRoad ) {

				const point = roadObject.road.getPosThetaAt( vertex.s, vertex.t ).position;

				point.z += vertex.dz;

				points.push( point );

			} else if ( vertex instanceof TvObjectVertexLocal ) {

				points.push( vertex.uvz );

			}

		} )

		const circleRadius = radii[ 0 ];
		const circleShape = new Shape()
			.moveTo( 0, circleRadius )
			.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 )
			.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius )
			.quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 )
			.quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );

		// const sqLength = 1;
		// const squareShape = new Shape()
		// 	.moveTo( 0, 0 )
		// 	.lineTo( 0, -sqLength )
		// 	.lineTo( -sqLength, -sqLength )
		// 	.lineTo( -sqLength, 0 )
		// 	.lineTo( 0, 0 );

		const path = new CatmullRomPath( points, false );

		return this.buildExtrudeGeometry( path, circleShape );
	}

	buildExtrudeGeometry ( path: CurvePath<Vector3>, shape: Shape, config?: Partial<ExtrudeGeometryOptions> ): BufferGeometry {

		const options: ExtrudeGeometryOptions = {
			steps: Math.floor( path.getLength() * 2 ),
			depth: 4,
			bevelEnabled: config?.bevelEnabled || true,
			bevelThickness: config?.bevelThickness || 1,
			bevelSize: config?.bevelSize || 1,
			bevelOffset: config?.bevelOffset || 0,
			bevelSegments: config?.bevelSegments || 1,
			extrudePath: path,
		};

		return new ExtrudeGeometry( shape, options );

	}

}
