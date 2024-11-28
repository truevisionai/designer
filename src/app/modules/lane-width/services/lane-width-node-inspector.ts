/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction, SerializedField } from "../../../core/components/serialization";
import { Commands } from "app/commands/commands";
import { LaneWidthPoint } from "../objects/lane-width-point";
import { LaneWidthLine } from "app/modules/lane-width/objects/lane-width-line";

export class LaneWidthInspector {

	constructor (
		public node: LaneWidthPoint|LaneWidthLine
	) {
	}

	@SerializedField( { type: 'int' } )
	get s (): number {
		return this.node.width.s;
	}

	set s ( value: number ) {

		if ( value < 0 ) {
			console.warn( 'S cannot be negative' );
			return;
		}

		this.node.width.s = value;

	}

	@SerializedField( { type: 'int' } )
	get width (): number {
		return this.node.width.a;
	}

	set width ( value: number ) {

		if ( value < 0 ) {
			console.warn( 'Width cannot be negative' );
			return;
		}

		this.node.width.a = value;

	}

	@SerializedAction( { label: 'Delete' } )
	delete (): void {
		Commands.RemoveObject( this.node );
	}


}
