/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { ISnappable } from './snapping';

export interface ISnapStrategy {
	execute ( snappable: ISnappable, position: Vector3 ): void;
}
