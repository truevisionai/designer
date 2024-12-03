/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Camera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapControls } from 'three/examples/jsm/controls/MapControls';

import { IViewportController } from './i-viewport-controller';

export class TvOrbitControls extends OrbitControls implements IViewportController {

	static getNew ( camera, canvas ): TvOrbitControls {

		const controls = new TvOrbitControls( camera, canvas );

		controls.screenSpacePanning = true;
		controls.enableRotate = false;
		// controls.enableKeys = false;

		return controls;
	}

	setTarget ( position: Vector3 ): void {
		this.target = position;
	}

	getTarget (): Vector3 {
		return this.target;
	}

	setCamera ( camera: Camera ): void {
		this.object = camera;
	}

	setEnabled ( enabled: boolean ): void {
		this.enabled = enabled;
	}

	setPanEnabled ( enabled: boolean ): void {
		this.enablePan = enabled;
	}

	setZoomEnabled ( enabled: boolean ): void {
		this.enableZoom = enabled;
	}

	setRotateEnabled ( enabled: boolean ): void {
		this.enableRotate = enabled;
	}

	setScreenSpaceEnabled ( enabled: boolean ): void {
		this.screenSpacePanning = enabled;
	}
}

export class TvMapControls extends MapControls implements IViewportController {

	static getNew ( camera: Camera, canvas: HTMLElement ): IViewportController {

		const controls = new TvMapControls( camera, canvas );

		controls.enableRotate = false;

		controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		controls.dampingFactor = 0.05;

		controls.screenSpacePanning = false;

		controls.minDistance = 5;
		controls.maxDistance = 500;

		controls.maxPolarAngle = Math.PI / 2;

		return controls;
	}

	setTarget ( position: Vector3 ): void {
		this.target = position;
	}

	getTarget (): Vector3 {
		return this.target;
	}

	setCamera ( camera: Camera ): void {
		this.object = camera;
	}

	setEnabled ( enabled: boolean ): void {
		this.enabled = enabled;
	}

	setPanEnabled ( enabled: boolean ): void {
		this.enablePan = enabled;
	}

	setZoomEnabled ( enabled: boolean ): void {
		this.enableZoom = enabled;
	}

	setRotateEnabled ( enabled: boolean ): void {
		this.enableRotate = enabled;
	}

	setScreenSpaceEnabled ( enabled: boolean ): void {
		this.screenSpacePanning = enabled;
	}

}
