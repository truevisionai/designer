import { Vector3 } from 'three';
import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { PositionType } from './tv-enums';

export abstract class Position {

	abstract readonly type: PositionType;

	abstract readonly label: string = 'Position';

	public vector3: THREE.Vector3 = new Vector3( 0, 0, 0 );

	abstract toVector3 (): Vector3;

	// abstract toXML (): XmlElement;

	setPosition ( point: Vector3 ) {
		throw new Error( 'Method not implemented.' );
	}

}
