/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TrafficSignalController } from '../services/traffic-signal-controller.condition';
import { File } from './tv-common';

export class RoadNetwork {

	constructor (
		public logics: File,
		public sceneGraph: File,
		public trafficSignalControllers: TrafficSignalController[] = []
	) {
	}


}
