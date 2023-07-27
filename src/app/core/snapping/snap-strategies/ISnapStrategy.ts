import { Vector3 } from 'three';
import { ISnappable } from './snapping';

export interface ISnapStrategy {
	execute ( snappable: ISnappable, position: Vector3 ): void;
}
