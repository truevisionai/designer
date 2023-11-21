// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvLane } from '../modules/tv-map/models/tv-lane';
// import { BaseCommand } from './base-command';

// export class SetLanePropertyCommand<T extends TvLane, K extends keyof T> extends BaseCommand {

// 	private readonly oldValue: T[ K ];

// 	constructor ( private lane: T, private attribute: K, private newValue: T[ K ] ) {

// 		super();

// 		this.oldValue = lane[ attribute ];
// 	}

// 	execute (): void {

// 		this.lane[ this.attribute ] = this.newValue;

// 		// this.buildRoad( this.lane.laneSection.road );

// 	}

// 	undo (): void {

// 		this.lane[ this.attribute ] = this.oldValue;

// 		// this.buildRoad( this.lane.laneSection.road );

// 	}

// 	redo (): void {

// 		this.execute();

// 	}


// }
