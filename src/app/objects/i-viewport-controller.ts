/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Camera, Vector3 } from "three";

export interface IViewportController {

	enabled: boolean;

	setTarget ( position: Vector3 ): void;

	getTarget (): Vector3;

	setCamera ( camera: Camera ): void;

	setEnabled ( enabled: boolean ): void;

	setPanEnabled ( enabled: boolean ): void;

	setZoomEnabled ( enabled: boolean ): void;

	setRotateEnabled ( enabled: boolean ): void;

	setScreenSpaceEnabled ( enabled: boolean ): void;

	update (): void;

	reset (): void;
}
