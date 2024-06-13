/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneWidthNode } from "../../objects/lane-width-node";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { CommandHistory } from "../../services/command-history";
import { RemoveObjectCommand } from "../../commands/remove-object-command";

export class LaneWidthNodeInspector {

	constructor (
		public node: LaneWidthNode
	) {
	}

	@SerializedField( { type: 'int' } )
	get s (): number {
		return this.node.laneWidth.s;
	}

	set s ( value: number ) {

		if ( value < 0 ) {
			console.warn( 'S cannot be negative' );
			return;
		}

		this.node.laneWidth.s = value;

	}

	@SerializedField( { type: 'int' } )
	get width (): number {
		return this.node.laneWidth.a;
	}

	set width ( value: number ) {

		if ( value < 0 ) {
			console.warn( 'Width cannot be negative' );
			return;
		}

		this.node.laneWidth.a = value;

	}

	@SerializedAction( { label: 'Delete' } )
	delete ( value: number ) {
		CommandHistory.execute( new RemoveObjectCommand( this.node ) );
	}


}