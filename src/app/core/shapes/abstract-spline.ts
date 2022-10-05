/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';

import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { SceneService } from '../services/scene.service';

export abstract class AbstractSpline {

	abstract type: string;
	public controlPoints: BaseControlPoint[] = [];
	// tcboxgeometry = new THREE.BoxBufferGeometry( 0.7, 0.3, 0.7 );
	protected controlPointAdded = new EventEmitter<BaseControlPoint>();
	protected controlPointRemoved = new EventEmitter<BaseControlPoint>();
	protected meshAddedInScene: boolean;

	constructor ( public closed = true, public tension = 0.5 ) {

		this.init();

	}

	get scene () {
		return SceneService.scene;
	}

	get controlPointPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position );
	}

	abstract init (): void;

	abstract hide (): void;

	abstract show (): void;

	abstract update (): void;

	abstract exportGeometries (): TvAbstractRoadGeometry[];

	clear () {

		throw new Error( 'Method not implemented.' );

	}

	addControlPoint ( cp: BaseControlPoint ) {

		this.controlPoints.push( cp );

	}

	addControlPointAtNew ( position: Vector3 ): RoadControlPoint {

		throw new Error( 'method not implemented' );

	}

	getFirstPoint () {

		return this.controlPoints[ 0 ];

	}

	getSecondPoint () {

		try {

			return this.controlPoints[ 1 ];

		} catch ( error ) {

		}

	}

	getLastPoint () {

		return this.controlPoints[ this.controlPoints.length - 1 ];

	}

	getSecondLastPoint () {

		try {

			return this.controlPoints[ this.controlPoints.length - 2 ];

		} catch ( error ) {

		}

	}

	removeControlPoint ( cp: BaseControlPoint ) {

		const index = this.controlPoints.findIndex( p => p.id === cp.id );

		this.controlPoints.splice( index, 1 );
	}

	getArcParams ( p1: Vector2, p2: Vector2, dir1: Vector2, dir2: Vector2 ): number[] {

		const distance = p1.distanceTo( p2 );

		const normalisedDotProduct = new THREE.Vector2()
			.copy( dir1 )
			.normalize()
			.dot( new THREE.Vector2().copy( dir2 ).normalize() );

		const alpha = Math.acos( normalisedDotProduct );

		const r = distance / 2 / Math.sin( alpha / 2 );

		const length = r * alpha;

		const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

		const det = 1 / ( ma * md - mb * mc );

		const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

		const p2proj = new THREE.Vector2().subVectors( p2, p1 );

		p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

		return [ r, alpha, length, Math.sign( p2proj.y ) ];
	}

	updateControlPoint ( cp: BaseControlPoint, id: number, cpobjidx?: any ) {

		cp[ 'tag' ] = 'cp';
		cp[ 'tagindex' ] = id;

		cp.userData.is_button = true;
		cp.userData.is_control_point = true;
		cp.userData.is_selectable = true;

		if ( cpobjidx == undefined ) {
			this.controlPoints.push( cp );
		} else {
			this.controlPoints.splice( cpobjidx, 0, cp );
		}
	}

	/**
	 *
	 * @deprecated dont use this make another internal for any sub class
	 * @param tag
	 * @param id
	 * @param cpobjidx
	 */
	createControlPoint ( tag: 'cp' | 'tpf' | 'tpb', id: number, cpobjidx?: any ): BaseControlPoint {

		// let cptobj = new THREE.Mesh( this.tcboxgeometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
		let controlPointObject = new RoadControlPoint( null, new Vector3(), tag, id, cpobjidx );

		controlPointObject[ 'tag' ] = tag;
		controlPointObject[ 'tagindex' ] = id;

		controlPointObject.userData.is_button = true;
		controlPointObject.userData.is_control_point = true;
		controlPointObject.userData.is_selectable = true;

		this.scene.add( controlPointObject );

		if ( cpobjidx == undefined ) {
			this.controlPoints.push( controlPointObject );
		} else {
			this.controlPoints.splice( cpobjidx, 0, controlPointObject );
		}

		this.controlPointAdded.emit( controlPointObject );

		return controlPointObject;
	}

}


