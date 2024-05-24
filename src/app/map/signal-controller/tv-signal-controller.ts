/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


export class TvSignalController {

	/**
	 * @param id unique ID within database
	 * @param name Name of controller, can be anything
	 * @param sequence priority of this controller with respect to other controllers of same logical level
	 */
	constructor (
		public id: number,
		public name: string,
		public sequence?: number,
		public controls: TvControllerControl[] = []
	) {
	}

	addControl ( signalId: number, type?: string ) {
		this.controls.push( new TvControllerControl( signalId, type ) );
	}
}


export class TvControllerControl {

	/**
	 * @param signalId id of the controlled signal
	 * @param type type of control, free text depending on the application
	 */
	constructor (
		public signalId: number,
		public type?: string
	) {
	}

}
