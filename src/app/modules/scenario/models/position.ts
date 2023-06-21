import { Euler, Vector3 } from 'three';
import { PositionType } from './tv-enums';
import { Orientation } from './tv-orientation';

export abstract class Position {

	abstract readonly type: PositionType;

	abstract readonly label: string = 'Position';

	public vector3: THREE.Vector3 = new Vector3( 0, 0, 0 );

	abstract toVector3 (): Vector3;

	// abstract toXML (): XmlElement;

	setPosition ( point: Vector3 ) {
		throw new Error( 'Method not implemented.' );
	}

	toEuler (): Euler {
		return new Euler( 0, 0, 0 );
	}

	toOrientation (): Orientation {
		return new Orientation();
	}
}
