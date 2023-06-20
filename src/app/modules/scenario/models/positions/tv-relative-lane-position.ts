/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeLanePosition extends Position {

	public readonly label: string = 'Relative Lane Position';
	public readonly type = PositionType.RelativeLane;

	public object: string;
	public dLane: number;
	public ds: number;
	public offset?: number;

	public orientations: Orientation[] = [];

	exportXml () {

		throw new Error( 'Method not implemented.' );

	}

	toVector3 (): Vector3 {

		console.error( 'Method not implemented.' );

		return new Vector3();

	}

	toXML (): XmlElement {
		return undefined;
	}


}
