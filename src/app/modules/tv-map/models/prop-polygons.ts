/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { SceneService } from 'app/core/services/scene.service';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { AssetDatabase } from 'app/services/asset-database';
import { Maths } from 'app/utils/maths';

import earcut from 'earcut';
import { Group, InstancedMesh, Material, Matrix4, Mesh, MeshBasicMaterial, Object3D, Shape, ShapeGeometry, Triangle, Vector2 } from 'three';

interface IChildAndMesh {
	mesh: Mesh;
	material: Material;
	worldMatrix?: Matrix4;
}

export class PropPolygon implements ISelectable {

	public static index = 0;

	public static tag: string = 'prop-polygon';

	public id: number;

	private instanceMeshArray: InstancedMesh[] = [];
	private propObjectArray: Object3D[] = [];

	public mesh: Mesh;

	public isSelected: boolean;

	constructor ( public propGuid: string, public spline?: CatmullRomSpline, public density = 0.5 ) {

		this.spline = spline || new CatmullRomSpline( true, 'catmullrom', 0.001 );

		this.id = PropPolygon.index++;

		// make a blank shape to avoid any errors
		this.mesh = this.makeMesh( new Shape() );
	}


	select (): void {

		this.isSelected = true;

		this.showControlPoints();

		this.showCurve();

	}

	unselect (): void {

		this.isSelected = false;

		this.hideControlPoints();

		this.showCurve();

	}

	makeMesh ( shape: Shape ): Mesh {

		const geometry = new ShapeGeometry( shape );

		const groundMaterial = new MeshBasicMaterial( {} );

		const mesh = new GameObject( PropPolygon.tag, geometry, groundMaterial );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = PropPolygon.tag;

		mesh.userData.polygon = mesh.userData.propPolygon = this;

		return mesh;
	}

	update (): void {

		this.spline.update();

		this.updateMeshGeometry();
	}

	// Function to update the mesh geometry
	private updateMeshGeometry (): void {

		if ( this.spline.controlPoints.length < 3 ) {

			this.updateProps();

		} else {

			const points: Vector2[] = this.generatePoints();

			const shape: Shape = this.createShape( points );

			this.updateGeometry( shape );

			this.updateProps();

		}
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

		this.mesh.geometry = new ShapeGeometry( shape );

		this.mesh.geometry.computeBoundingBox();
	}


	updateProps () {

		this.removeAndClearProps();

		const propObject = this.getPropInstance();

		const propChildren: IChildAndMesh[] = this.getChildMeshesAndMaterials( propObject );

		const faces = this.computeFaces();

		this.createInstancedMeshes( faces, propObject, propChildren );
	}

	createInstancedMeshes ( faces: number[][], propObject: Object3D, propChildren: IChildAndMesh[] ): void {

		// a unique instance is created for each child of prop
		const instancedMeshArray = this.createInstancedMeshArray( propChildren );

		let instanceCounter = 0;

		for ( let i = 0; i < faces.length; i++ ) {

			const face = faces[ i ];

			const spawnCount = this.computeSpawnCountByArea( face );

			for ( let j = 0; j < spawnCount; j++ ) {

				const position = Maths.randomPositionInTriangle(
					this.spline.controlPointPositions[ face[ 0 ] ],
					this.spline.controlPointPositions[ face[ 1 ] ],
					this.spline.controlPointPositions[ face[ 2 ] ]
				);

				for ( let k = 0; k < instancedMeshArray.length; k++ ) {

					const instancedMesh = instancedMeshArray[ k ];

					const instanceMatrix = new Matrix4();

					instanceMatrix.setPosition( position );

					instanceMatrix.multiply( instancedMesh.userData.worldMatrix );

					instancedMesh.setMatrixAt( instanceCounter, instanceMatrix );

					instancedMesh.instanceMatrix.needsUpdate = true;

				}

				// used in exporting the object
				const cloned = propObject.clone()
				cloned.position.copy( position );
				this.propObjectArray.push( cloned );

				instanceCounter++;
			}

			instanceCounter += spawnCount;

		}

		instancedMeshArray.forEach( instancedMesh => {

			// just adding the instance mesh in scene will add all 100s or 1000s of instances
			SceneService.add( instancedMesh );

			// usefull for maintain
			this.instanceMeshArray.push( instancedMesh );

		} );
	}

	private computeSpawnCountByArea ( face: number[] ): number {

		const v0 = this.spline.controlPointPositions[ face[ 0 ] ];
		const v1 = this.spline.controlPointPositions[ face[ 1 ] ];
		const v2 = this.spline.controlPointPositions[ face[ 2 ] ];

		const t = new Triangle( v0, v1, v2 );
		const area = t.getArea();

		let count = area * this.density * this.density * this.density * 0.5;

		return Maths.clamp( count, 0, 100 );
	}


	private createInstancedMeshArray ( propChildren: IChildAndMesh[] ): InstancedMesh[] {

		return propChildren.map( ( { mesh, material, worldMatrix } ) => {

			const instancedMesh = new InstancedMesh( mesh.geometry, mesh.material, 1000 );

			instancedMesh.userData.worldMatrix = worldMatrix;

			return instancedMesh;

		} );

	}

	private removeAndClearProps (): void {

		this.propObjectArray.forEach( p => SceneService.remove( p ) );
		this.propObjectArray.splice( 0, this.propObjectArray.length );

		this.instanceMeshArray.forEach( p => SceneService.remove( p ) );
		this.instanceMeshArray.splice( 0, this.instanceMeshArray.length );

	}

	private getPropInstance (): Object3D {

		const propInstance: Object3D = AssetDatabase.getInstance( this.propGuid ) as Object3D;

		propInstance.up.set( 0, 0, 1 );

		propInstance.updateMatrixWorld( true );

		return propInstance;

	}


	private getChildMeshesAndMaterials ( propInstance: Object3D ): IChildAndMesh[] {

		let childMeshesAndMaterials: IChildAndMesh[];

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

		const meshesAndMaterials: IChildAndMesh[] = [];

		group.traverse( ( object ) => {

			if ( object instanceof Mesh ) {

				const worldMatrix = new Matrix4();

				worldMatrix.copy( object.matrixWorld );

				meshesAndMaterials.push( { mesh: object, material: object.material, worldMatrix } );

			}

		} );

		return meshesAndMaterials;
	}

	addControlPoint ( cp: DynamicControlPoint<PropPolygon> ) {

		( this.spline as CatmullRomSpline ).add( cp );

		this.update();
	}

	removeControlPoint ( point: DynamicControlPoint<PropPolygon> ) {

		this.spline.controlPoints.splice( this.spline.controlPoints.indexOf( point ), 1 );

		this.update();

	}

	delete () {

		this.hideControlPoints();

		this.hideCurve();

		this.mesh?.parent?.remove( this.spline.mesh );

		this.removeAndClearProps();

	}

	hideControlPoints () {

		this.spline.hidecontrolPoints();

	}

	hideCurve () {

		this.spline.hide();

	}

	showCurve () {

		if ( this.spline.controlPoints.length < 2 ) return;

		this.spline.show();

	}

	showControlPoints () {

		this.spline.showcontrolPoints();

	}

	getExportJson () {

		// const isInstanced = this.instanceMeshArray.find( i => i instanceof InstancedMesh );

		// TODO: can be improved in futur
		// instead of maintaing propObjectArray, we can loop over instanceMeshArray and return
		// below code can help
		//
		// const position = new Vector3();
		// const quaternion = new Quaternion();
		// const scale = new Vector3();
		//
		// for ( let i = 0; i < instancedMesh.count; i++ ) {
		// 	const matrix = new Matrix4();
		// 	instancedMesh.getMatrixAt( i, matrix );
		// 	matrix.decompose( position, quaternion, scale );
		// 	const rotation = new Euler();
		// 	rotation.setFromQuaternion( quaternion );
		// 	// Now you can use the position, rotation (as a quaternion), and scale for this instance
		// }
		return this.propObjectArray.map( prop => ( {
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

	addPropObject ( propObject: Object3D ) {

		this.propObjectArray.push( propObject );

	}
}
