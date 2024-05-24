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

	@SerializedAction( { label: 'All Go' } )
	allGo () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.ALL_GO );
	}

	@SerializedAction( { label: 'All Stop' } )
	allStop () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.ALL_STOP );
	}

	@SerializedAction( { label: 'All Yield' } )
	allYield () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.ALL_YIELD );
	}

	@SerializedAction( { label: 'Split Phase' } )
	splitPhase () {
		this.tool.autoSignalService.addSignalization( this.junction, AutoSignalizationType.SPIT_PHASE );
	}

	@SerializedAction( { label: 'Remove Signalization' } )
	remove () {
		this.tool.autoSignalService.removeSignalization( this.junction );
	}
}
