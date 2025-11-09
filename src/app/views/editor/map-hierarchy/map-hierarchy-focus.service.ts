/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MathUtils, Object3D, OrthographicCamera, PerspectiveCamera, Vector3, Box3 } from 'three';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoad } from 'app/map/models/tv-road.model';
import { CameraService } from 'app/renderer/camera.service';
import { ViewControllerService } from '../viewport/view-controller.service';
import { MapHierarchyNodeData } from './map-hierarchy.models';

const CAMERA_PADDING = 1.35;
const MIN_DISTANCE = 5;
const MAX_ORTHO_ZOOM = 50;
const MIN_ORTHO_ZOOM = 0.05;

@Injectable( {
	providedIn: 'root'
} )
export class MapHierarchyFocusService {

	constructor (
		private readonly viewController: ViewControllerService,
		private readonly cameraService: CameraService,
	) {
	}

	focus ( data: MapHierarchyNodeData | MapHierarchyNodeData[] ): void {

		if ( Array.isArray( data ) ) {
			const boxes = data
				.map( item => this.buildBoundingBox( item ) )
				.filter( ( box ): box is Box3 => !!box );

			if ( boxes.length === 0 ) return;

			const merged = boxes.reduce( ( acc, box ) => acc.union( box ), boxes[ 0 ].clone() );
			this.frameBox( merged );
			return;
		}

		const box = this.buildBoundingBox( data );

		if ( !box ) return;

		this.frameBox( box );
	}

	private buildBoundingBox ( data: MapHierarchyNodeData ): Box3 | null {

		if ( data instanceof TvRoad ) {
			return this.buildRoadBox( data );
		}

		if ( data instanceof TvLaneSection ) {
			return this.buildLaneSectionBox( data );
		}

		if ( data instanceof TvLane ) {
			return this.buildLaneBox( data );
		}

		return null;
	}

	private buildRoadBox ( road: TvRoad ): Box3 | null {

		const sectionBoxes = road.laneSections
			?.map( section => this.buildLaneSectionBox( section ) )
			?.filter( ( box ): box is Box3 => !!box ) ?? [];

		if ( sectionBoxes.length === 0 ) {
			return this.computeBoxFromObject( road.gameObject );
		}

		return sectionBoxes.reduce( ( acc, box ) => acc.union( box ), sectionBoxes[ 0 ].clone() );
	}

	private buildLaneSectionBox ( laneSection: TvLaneSection ): Box3 | null {

		const laneBoxes = laneSection.getLanes()
			.map( lane => this.buildLaneBox( lane ) )
			.filter( ( box ): box is Box3 => !!box );

		if ( laneBoxes.length === 0 ) {
			return this.computeBoxFromObject( laneSection.gameObject );
		}

		return laneBoxes.reduce( ( acc, box ) => acc.union( box ), laneBoxes[ 0 ].clone() );
	}

	private buildLaneBox ( lane: TvLane ): Box3 | null {
		return this.computeBoxFromObject( lane.gameObject );
	}

	private computeBoxFromObject ( object?: Object3D | null ): Box3 | null {

		if ( !object ) return null;

		object.updateWorldMatrix( true, true );

		const box = new Box3().setFromObject( object );

		return box.isEmpty() ? null : box;
	}

	private frameBox ( box: Box3 ): void {

		if ( !box || box.isEmpty() ) return;

		const camera = this.cameraService.camera;
		const center = box.getCenter( new Vector3() );

		if ( camera instanceof OrthographicCamera ) {
			this.frameOrthographic( camera, box, center );
		} else if ( camera instanceof PerspectiveCamera ) {
			this.framePerspective( camera, box, center );
		} else {
			camera.position.set( center.x, center.y, camera.position.z );
			camera.lookAt( center );
		}

		this.viewController.setFocusTarget( center.clone() );
		camera.updateMatrixWorld();
		this.viewController.update( 0 );
	}

	private frameOrthographic ( camera: OrthographicCamera, box: Box3, center: Vector3 ): void {

		const size = box.getSize( new Vector3() );
		const paddedWidth = Math.max( size.x, 1 ) * CAMERA_PADDING;
		const paddedHeight = Math.max( size.y, 1 ) * CAMERA_PADDING;

		const viewWidth = camera.right - camera.left;
		const viewHeight = camera.top - camera.bottom;

		const zoomX = viewWidth / paddedWidth;
		const zoomY = viewHeight / paddedHeight;
		const nextZoom = this.clamp( Math.min( zoomX, zoomY ), MIN_ORTHO_ZOOM, MAX_ORTHO_ZOOM );

		camera.zoom = nextZoom;
		camera.position.set( center.x, center.y, camera.position.z );
		camera.lookAt( center );
		camera.updateProjectionMatrix();
	}

	private framePerspective ( camera: PerspectiveCamera, box: Box3, center: Vector3 ): void {

		const size = box.getSize( new Vector3() );
		const halfHeight = ( Math.max( size.y, 1 ) * CAMERA_PADDING ) / 2;
		const halfWidth = ( Math.max( size.x, 1 ) * CAMERA_PADDING ) / 2;

		const verticalFov = MathUtils.degToRad( camera.fov );
		const horizontalFov = 2 * Math.atan( Math.tan( verticalFov / 2 ) * camera.aspect );

		const distanceForHeight = halfHeight / Math.tan( verticalFov / 2 );
		const distanceForWidth = halfWidth / Math.tan( horizontalFov / 2 );

		const distance = Math.max( distanceForHeight, distanceForWidth, MIN_DISTANCE );

		const currentTarget = this.viewController.getTarget();
		let direction = camera.position.clone().sub( currentTarget );

		if ( !isFinite( direction.lengthSq() ) || direction.lengthSq() === 0 ) {
			direction = new Vector3( 0, 0, 1 );
		}

		direction.normalize();

		const newPosition = center.clone().add( direction.multiplyScalar( distance ) );

		camera.position.copy( newPosition );
		camera.lookAt( center );
		camera.updateProjectionMatrix();
	}

	private clamp ( value: number, min: number, max: number ): number {
		return Math.min( Math.max( value, min ), max );
	}
}
