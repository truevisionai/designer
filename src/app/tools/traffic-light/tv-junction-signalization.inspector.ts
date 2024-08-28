/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction } from "app/core/components/serialization";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { AutoSignalizationType, JunctionSignaliztion } from "./auto-signalize-junction.service";
import { Commands } from "app/commands/commands";

export class TvJunctionSignalizationInspector {

	constructor ( public junction: TvJunction ) { }

	@SerializedAction( {
		label: 'All Go',
		description: 'Let all traffic go'
	} )
	allGo (): void {
		this.addCommand( AutoSignalizationType.ALL_GO );
	}

	@SerializedAction( {
		label: 'All Stop',
		description: 'All traffic will stop at junction'
	} )
	allStop (): void {
		this.addCommand( AutoSignalizationType.ALL_STOP );
	}

	@SerializedAction( {
		label: 'All Yield',
		description: 'All traffic will yield at junction'
	} )
	allYield (): void {
		this.addCommand( AutoSignalizationType.ALL_YIELD );
	}

	@SerializedAction( {
		label: 'Split Phase',
		description: 'All traffic will go and stop a phased maneer'
	} )
	splitPhase (): void {
		this.addCommand( AutoSignalizationType.SPIT_PHASE );
	}

	@SerializedAction( {
		label: 'Remove Signalization',
		description: 'Remove signalization from junction'
	} )
	remove (): void {
		Commands.RemoveObject( new JunctionSignaliztion( this.junction, null ) );
	}

	private addCommand ( type: AutoSignalizationType ): void {
		Commands.AddObject( new JunctionSignaliztion( this.junction, type ) );
	}

}
