/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction } from "app/core/components/serialization";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TrafficLightToolService } from "./traffic-light-tool.service";
import { AutoSignalizationType } from "./auto-signalize-junction.service";

export class TvJunctionSignalizationInspector {

	constructor (
		public junction: TvJunction,
		private tool: TrafficLightToolService
	) {
	}

	@SerializedAction( {
		label: 'All Go',
		description: 'Let all traffic go'
	} )
	allGo () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.ALL_GO );
	}

	@SerializedAction( {
		label: 'All Stop',
		description: 'All traffic will stop at junction'
	} )
	allStop () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.ALL_STOP );
	}

	@SerializedAction( {
		label: 'All Yield',
		description: 'All traffic will yield at junction'
	} )
	allYield () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.ALL_YIELD );
	}

	@SerializedAction( {
		label: 'Split Phase',
		description: 'All traffic will go and stop a phased maneer'
	} )
	splitPhase () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.SPIT_PHASE );
	}

	@SerializedAction( {
		label: 'Remove Signalization',
		description: 'Remove signalization from junction'
	} )
	remove () {
		this.tool.autoSignalService.removeSignalization( this.junction );
	}
}
