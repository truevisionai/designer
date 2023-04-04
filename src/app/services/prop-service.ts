/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicMeta } from 'app/core/models/metadata.model';
import { PropModel } from 'app/core/models/prop-model.model';
import { SceneService } from 'app/core/services/scene.service';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { Maths } from 'app/utils/maths';
import earcut from 'earcut';
import { Group, InstancedMesh, Matrix4, Mesh, Object3D, Triangle } from 'three';
import { AssetDatabase } from './asset-database';

export class PropService {

	private static prop?: DynamicMeta<PropModel>;

	static setProp ( prop: DynamicMeta<PropModel> ) {

		this.prop = prop;

	}

	static getProp (): DynamicMeta<PropModel> {

		return this.prop;

	}

	static updateCurveProps ( curve: PropCurve ) {

		if ( !curve ) return;

		if ( curve.spline.controlPoints.length < 2 ) return;

		const length = ( curve.spline as CatmullRomSpline ).getLength();

		if ( length <= 0 ) return;

		curve.props.forEach( prop => SceneService.remove( prop ) );

		curve.props.splice( 0, curve.props.length );

		const spline = curve.spline as CatmullRomSpline;

		const instance = AssetDatabase.getInstance( curve.propGuid ) as Object3D;

		for ( let i = 0; i < length; i += curve.spacing ) {

			const t = spline.curve.getUtoTmapping( 0, i );

			const position = spline.curve.getPoint( t );

			const prop = instance.clone();

			// apply random position variance
			position.setX( position.x + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ) );
			position.setY( position.y + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ) );

			// apply random rotation variance
			prop.rotateX( Maths.randomFloatBetween( -curve.rotation, curve.rotation ) );
			prop.rotateY( Maths.randomFloatBetween( -curve.rotation, curve.rotation ) );
			prop.rotateZ( Maths.randomFloatBetween( -curve.rotation, curve.rotation ) );

			prop.position.copy( position );

			curve.props.push( prop );

			SceneService.add( prop );

		}
	}

	static updateCurvePolygonProps ( polygon: PropPolygon ) {

		this.updateCurvePolygonPropsNewInstancedMesh( polygon );

	}

	private static updateCurvePolygonPropsNormal ( polygon: PropPolygon ) {

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

	private static updateCurvePolygonPropsNewInstancedMesh ( polygon: PropPolygon ) {

		polygon.props.forEach( p => SceneService.remove( p ) );

		polygon.props.splice( 0, polygon.props.length );

		const propInstance = AssetDatabase.getInstance( polygon.propGuid ) as Object3D;

		propInstance.up.set( 0, 0, 1 );

		propInstance.updateMatrixWorld( true );

		let childMeshesAndMaterials;

		if ( propInstance instanceof Group ) {

			childMeshesAndMaterials = this.extractMeshesAndMaterials( propInstance );

		} else if ( propInstance instanceof Mesh ) {

			childMeshesAndMaterials = [ { mesh: propInstance, material: propInstance.material } ];

		}

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

		const instancedMeshes = childMeshesAndMaterials.map( ( { mesh, material, worldMatrix } ) => {

			const instanceGeometry = mesh.geometry;

			const instanceMaterial = material;

			const maxInstances = 100; // Compute maxInstances based on your needs

			const instancedMesh = new InstancedMesh( instanceGeometry, instanceMaterial, maxInstances );

			instancedMesh.userData.worldMatrix = worldMatrix;

			return instancedMesh;

		} );

		let instanceCounter = 0;

		const rotationMatrix = new Matrix4();

		rotationMatrix.makeRotationX( Math.PI / 2 );

		faces.forEach( face => {

			const v0 = polygon.spline.controlPointPositions[ face[ 0 ] ];
			const v1 = polygon.spline.controlPointPositions[ face[ 1 ] ];
			const v2 = polygon.spline.controlPointPositions[ face[ 2 ] ];

			const t = new Triangle( v0, v1, v2 );

			const area = t.getArea();

			let count = area * polygon.density * polygon.density * polygon.density * 0.5;

			count = Maths.clamp( count, 0, 100 );

			for ( let i = 0; i < count; i++ ) {

				const position = randomInTriangle( v0, v1, v2 );

				instancedMeshes.forEach( ( instancedMesh ) => {

					const instanceMatrix = new Matrix4();

					instanceMatrix.setPosition( position );

					instanceMatrix.multiply( instancedMesh.userData.worldMatrix );

					instancedMesh.setMatrixAt( instanceCounter, instanceMatrix );

					instancedMesh.instanceMatrix.needsUpdate = true;

				} );

				instanceCounter++;
			}

		} );

		// Add the instancedMeshes to the scene
		instancedMeshes.forEach( instancedMesh => {

			SceneService.add( instancedMesh );

			// TODO: fix exporting for this
			polygon.props.push( instancedMesh );

		} );
	}

	private static extractMeshesAndMaterials ( group: Group ) {

		const meshesAndMaterials = [];

		group.traverse( ( object ) => {

			if ( object instanceof Mesh ) {

				const worldMatrix = new Matrix4();

				worldMatrix.copy( object.matrixWorld );

				meshesAndMaterials.push( { mesh: object, material: object.material, worldMatrix } );

			}

		} );

		return meshesAndMaterials;
	}
}
