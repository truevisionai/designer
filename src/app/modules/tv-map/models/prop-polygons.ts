/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { SceneService } from 'app/core/services/scene.service';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { AssetDatabase } from 'app/services/asset-database';
import { Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Object3D, Shape, ShapeGeometry, Triangle, Vector2 } from 'three';
import { Maths } from 'app/utils/maths';

import earcut from 'earcut';
import { PropManager } from 'app/services/prop-manager';

export class PropPolygon {

	public static index = 0;

	public static tag: string = 'prop-polygon';

	public id: number;

	public props: Object3D[] = [];

	public mesh: Mesh;

	constructor ( public propGuid: string, public spline?: CatmullRomSpline, public density = 0.5 ) {

		this.spline = spline || new CatmullRomSpline( true, 'catmullrom', 0.001 );

		this.id = PropPolygon.index++;

		// make a blank shape to avoid any errors
		this.mesh = this.makeMesh( new Shape() );
	}

	makeMesh ( shape: Shape ): Mesh {

		const geometry = new ShapeGeometry( shape );

		const groundMaterial = new MeshBasicMaterial( {} );

		const mesh = new GameObject( PropPolygon.tag, geometry, groundMaterial );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = PropPolygon.tag;

		mesh.userData.polygon = this;

		return mesh;
	}

	update (): void {

		this.spline.update();

		this.updateMeshGeometry();
	}

	// Function to update the mesh geometry
	private updateMeshGeometry (): void {

		if ( this.spline.controlPoints.length < 3 ) return;

		const points: Vector2[] = this.generatePoints();

		const shape: Shape = this.createShape( points );

		this.updateGeometry( shape );

		this.updateProps();
	}

	// Function to generate points from the spline curve
	private generatePoints (): Vector2[] {

		return this.spline.curve.getPoints( 50 ).map(
			p => new Vector2( p.x, p.y )
		);

	}

	// Function to create a shape from the points
	private createShape ( points: Vector2[] ): Shape {

		const shape = new Shape();

		const first: Vector2 | undefined = points.shift();

		if ( first ) {

			shape.moveTo( first.x, first.y );

			shape.splineThru( points );
		}

		return shape;
	}

	// Function to update the geometry
	private updateGeometry ( shape: Shape ): void {

		this.mesh.geometry.dispose();

		const geometry: ShapeGeometry = this.mesh.geometry = new ShapeGeometry( shape );

		geometry.computeBoundingBox();
	}


	updateProps () {

		this.removeAndClearProps();

		const propInstance = this.getPropInstance();

		const childMeshesAndMaterials = this.getChildMeshesAndMaterials( propInstance );

		const faces = this.computeFaces();

		this.createInstancedMeshes( faces, childMeshesAndMaterials );
	}

	createInstancedMeshes ( faces: number[][], childMeshesAndMaterials: any ): void {

		const instancedMeshes = this.createInstancedMeshArray( childMeshesAndMaterials );

		let instanceCounter = 0;

		faces.forEach( face => {

			const count = this.calculateInstanceCount( face );

			this.addInstancesToMeshes( count, face, instancedMeshes, instanceCounter );

			instanceCounter += count;

		} );

		this.addInstancedMeshesToScene( instancedMeshes );
	}

	addInstancedMeshesToScene ( instancedMeshes: InstancedMesh[] ) {

		instancedMeshes.forEach( instancedMesh => {

			SceneService.add( instancedMesh );

			// TODO: fix exporting for this
			this.props.push( instancedMesh );

		} );
	}

	addInstancesToMeshes ( count: number, face: number[], instancedMeshes: InstancedMesh[], instanceCounter: number ): void {

		function randomInTriangle ( v1, v2, v3 ) {

			const r1 = Math.random();

			const r2 = Math.sqrt( Math.random() );

			const a = 1 - r2;

			const b = r2 * ( 1 - r1 );

			const c = r1 * r2;

			return ( v1.clone().multiplyScalar( a ) ).add( v2.clone().multiplyScalar( b ) ).add( v3.clone().multiplyScalar( c ) );
		}

		for ( let i = 0; i < count; i++ ) {

			const position = randomInTriangle(
				this.spline.controlPointPositions[ face[ 0 ] ],
				this.spline.controlPointPositions[ face[ 1 ] ],
				this.spline.controlPointPositions[ face[ 2 ] ]
			);

			instancedMeshes.forEach( instancedMesh => {

				const instanceMatrix = new Matrix4();

				instanceMatrix.setPosition( position );

				instanceMatrix.multiply( instancedMesh.userData.worldMatrix );

				instancedMesh.setMatrixAt( instanceCounter, instanceMatrix );

				instancedMesh.instanceMatrix.needsUpdate = true;

			} );

			instanceCounter++;
		}
	}

	private calculateInstanceCount ( face: number[] ): number {

		const v0 = this.spline.controlPointPositions[ face[ 0 ] ];
		const v1 = this.spline.controlPointPositions[ face[ 1 ] ];
		const v2 = this.spline.controlPointPositions[ face[ 2 ] ];

		const t = new Triangle( v0, v1, v2 );
		const area = t.getArea();

		let count = area * this.density * this.density * this.density * 0.5;

		return Maths.clamp( count, 0, 100 );
	}


	private createInstancedMeshArray ( childMeshesAndMaterials: any ): InstancedMesh[] {

		return childMeshesAndMaterials.map( ( { mesh, material, worldMatrix } ) => {

			const instanceGeometry = mesh.geometry;

			const instanceMaterial = material;

			const maxInstances = 1000; // Compute maxInstances based on your needs

			const instancedMesh = new InstancedMesh( instanceGeometry, instanceMaterial, maxInstances );

			instancedMesh.userData.worldMatrix = worldMatrix;

			return instancedMesh;

		} );

	}

	private removeAndClearProps (): void {

		// Remove props from the scene
		this.props.forEach( p => SceneService.remove( p ) );

		// Clear the props array
		this.props.splice( 0, this.props.length );

	}

	private getPropInstance (): Object3D {

		const propInstance: Object3D = AssetDatabase.getInstance( this.propGuid ) as Object3D;

		propInstance.up.set( 0, 0, 1 );

		propInstance.updateMatrixWorld( true );

		return propInstance;

	}


	private getChildMeshesAndMaterials ( propInstance: Object3D ): any {

		let childMeshesAndMaterials;

		if ( propInstance instanceof Group ) {

			childMeshesAndMaterials = this.extractMeshesAndMaterials( propInstance );

		} else if ( propInstance instanceof Mesh ) {

			childMeshesAndMaterials = [ { mesh: propInstance, material: propInstance.material } ];

		}

		return childMeshesAndMaterials;
	}

	private computeFaces (): number[][] {

		const vertices = [];

		this.spline.controlPointPositions.forEach( p => {
			vertices.push( p.x );
			vertices.push( p.y );
		} );

		// triangulating a polygon with 2d coords0
		const triangles = earcut( vertices );

		const faces = [];

		for ( let i = 0; i < triangles.length; i += 3 ) {

			faces.push( triangles.slice( i, i + 3 ) );

		}

		return faces;
	}

	private extractMeshesAndMaterials ( group: Group ) {

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

	addControlPoint ( cp: AnyControlPoint ) {

		( this.spline as CatmullRomSpline ).add( cp );

		this.update();
	}

	delete () {

		this.hideControlPoints();

		this.hideCurve();

	}

	hideControlPoints () {

		this.spline.hidecontrolPoints();

	}

	hideCurve () {

		this.spline.hide();

	}

	showCurve () {

		this.spline.show();

	}

	showControlPoints () {

		this.spline.showcontrolPoints();

	}

	getExportJson () {

		// const isInstanced = this.props.find( i => i instanceof InstancedMesh );

		return this.props.map( prop => ( {
			attr_guid: this.propGuid,
			position: {
				attr_x: prop.position.x,
				attr_y: prop.position.y,
				attr_z: prop.position.z,
			},
			rotation: {
				attr_x: prop.rotation.x,
				attr_y: prop.rotation.y,
				attr_z: prop.rotation.z,
			},
			scale: {
				attr_x: prop.scale.x,
				attr_y: prop.scale.y,
				attr_z: prop.scale.z,
			}
		} ) );

	}
}
