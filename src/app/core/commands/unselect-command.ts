/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Selectable } from '../../modules/three-js/objects/i-selectable';
import { BaseCommand } from './base-command';

export interface Tool<T extends Selectable> {
	setPoint ( value: T ): void;

	getPoint (): T | null;

	setMainObject ( value: T ): void;

	getMainObject (): T | null;

	// point: T | null;
	// mainObject: T | null;
}

// export class UnselectCommand<T extends Selectable> extends BaseCommand {
//
// 	private readonly oldPoint: T | null;
// 	private readonly oldMainObject: T | null;
//
// 	constructor ( private tool: Tool<T> ) {
// 		super();
//
// 		this.oldMainObject = this.tool.getMainObject();
// 		this.oldPoint = this.tool.getPoint();
// 	}
//
// 	execute () {
// 		this.oldPoint?.unselect();
//
// 		this.tool.setPoint( null );
// 		this.tool.setMainObject( null );
// 	}
//
// 	undo (): void {
// 		this.oldPoint?.select();
// 		this.tool.setPoint( this.oldPoint );
// 		this.tool.setMainObject( this.oldMainObject );
// 	}
//
// 	redo (): void {
// 		this.execute();
// 	}
// }
