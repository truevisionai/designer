/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import * as THREE from 'three';

export interface IEngine {

	add ( object: THREE.Object3D, raycasting?: boolean ): void;

	remove ( object: THREE.Object3D, raycasting?: boolean ): void;

	focus ( object: THREE.Object3D ): void;

	reset (): void;

	select ( object: THREE.Object3D ): void;

	deselect ( object: THREE.Object3D ): void;
}
