/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	Group,
	InstancedMesh,
	Material,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	Shape,
	ShapeGeometry,
	Vector2
} from "three";
import { PropPolygon } from "../../../map/prop-polygon/prop-polygon.model";
import { MeshBuilder } from "../../../core/builders/mesh.builder";
import { GameObject } from "../../../objects/game-object";
import { AbstractControlPoint } from "../../../objects/abstract-control-point";
import { AppConfig } from "../../../app.config";
import { AbstractSpline } from "../../../core/shapes/abstract-spline";
import { TvTransform } from '../../../map/models/tv-transform';
import { PropPoint } from "../../../map/prop-point/prop-point.model";

import earcut from 'earcut';
import { AssetType } from 'app/assets/asset.model';
import { AssetService } from 'app/assets/asset.service';

interface IChildAndMesh {
	mesh: Mesh;
	material: Material;
	worldMatrix?: Matrix4;
}

@Injectable()
export class PropPolygonBuilder extends MeshBuilder<PropPolygon> {

	constructor ( private assetService: AssetService ) {
		super();
	}

	public build ( polygon: PropPolygon ): Object3D {

		// const points: Vector2[] = this.generatePoints( polygon );

		// const shape: Shape = this.createShape( points );

		// const mesh = this.makeMesh( shape, polygon );

		const mesh = new Group();

		if ( polygon.spline.getControlPointCount() < 3 ) {

			this.updateProps( mesh, polygon );

		} else {

			// this.updateGeometry( mesh, shape );

			this.updateProps( mesh, polygon );

		}

		return mesh;
	}

	private makeMesh ( shape: Shape, polygon: PropPolygon ): Mesh {

		const geometry = new ShapeGeometry( shape );

		const groundMaterial = new MeshBasicMaterial( {} );

		const mesh = new GameObject( PropPolygon.tag, geometry, groundMaterial );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = PropPolygon.tag;

		mesh.userData.polygon = mesh.userData.propPolygon = polygon;

		return mesh;
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

	private generatePoints ( object: PropPolygon ): Vector2[] {

		return object.spline?.curve?.getPoints( 50 ).map(
			p => new Vector2( p.x, p.y )
		);

	}

	private updateGeometry ( mesh: Mesh, shape: Shape ): void {

		mesh.geometry.dispose();

		mesh.geometry = new ShapeGeometry( shape );

		mesh.geometry.computeBoundingBox();
	}

	private updateProps ( mesh: Object3D, polygon: PropPolygon ): void {

		// group props by guid
		const uniqueProps = new Map<string, PropPoint[]>();

		polygon.props.forEach( prop => {

			if ( !uniqueProps.has( prop.guid ) ) uniqueProps.set( prop.guid, [] );

			uniqueProps.get( prop.guid )?.push( prop );

		} );

		uniqueProps.forEach( ( props, guid ) => {

			const propObject = this.getPropInstance( guid );

			const propChildren: IChildAndMesh[] = this.getChildMeshesAndMaterials( propObject );

			const transforms = props.map( prop => prop.transform );

			this.createInstancedMeshesV2( mesh, transforms, polygon.spline.controlPoints, propObject, propChildren );

		} );

	}

	private createInstancedMeshArray ( propChildren: IChildAndMesh[], totalInstancesNeeded: number ): InstancedMesh[] {

		return propChildren.map( ( { mesh, material, worldMatrix } ) => {

			const instancedMesh = new InstancedMesh( mesh.geometry, mesh.material, totalInstancesNeeded );

			instancedMesh.userData.worldMatrix = worldMatrix;

			return instancedMesh;

		} );

	}

	private createInstancedMeshesV2 (
		group: Object3D,
		transforms: TvTransform[],
		controlPoints: AbstractControlPoint[],
		propObject: Object3D,
		propChildren: IChildAndMesh[]
	): void {

		if ( controlPoints.length < 3 ) return;

		// a unique instance is created for each child of prop
		const instancedMeshArray = this.createInstancedMeshArray( propChildren, transforms.length );

		let instanceCounter = 0;

		for ( let i = 0; i < transforms.length; i++ ) {

			const position = transforms[ i ].position

			for ( let k = 0; k < instancedMeshArray.length; k++ ) {

				const instancedMesh = instancedMeshArray[ k ];

				const instanceMatrix = new Matrix4();

				instanceMatrix.setPosition( position );

				instanceMatrix.multiply( instancedMesh.userData.worldMatrix );

				instancedMesh.setMatrixAt( instanceCounter, instanceMatrix );

				instancedMesh.instanceMatrix.needsUpdate = true;

				// used in exporting the object
				const cloned = propObject.clone();

				cloned.position.copy( position );

			}

			instanceCounter++;

		}

		instancedMeshArray.forEach( instancedMesh => {

			// usefull for maintain
			group.add( instancedMesh );

		} );

	}

	private getPropInstance ( assetGuid: string ): Object3D {

		if ( !assetGuid ) return;

		const asset = this.assetService.getAsset( assetGuid );

		if ( !asset ) return;

		let propInstance: Object3D;

		if ( asset.type == AssetType.OBJECT ) {

			propInstance = this.assetService.getObjectAsset( asset.guid )?.instance;

		} else if ( asset.type == AssetType.MODEL ) {

			propInstance = this.assetService.getModelAsset( asset.guid );

		}

		propInstance.up.copy( AppConfig.DEFAULT_UP );

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

	private computeFaces ( spline: AbstractSpline ): number[][] {

		const vertices = [];

		spline.controlPointPositions.forEach( p => {
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

	private extractMeshesAndMaterials ( group: Group ): IChildAndMesh[] {

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
}

