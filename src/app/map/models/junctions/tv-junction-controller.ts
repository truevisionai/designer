/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvJunctionController {

	/**
	 * Lists the controllers that should be grouped in a sychronization group (limited to that particular junction).
	 *
	 * @param id ID of the controller
	 * @param type Type of control for this junction. Free text, depending on the application.
	 * @param sequence Sequence number (priority) of this controller with respect to other controllers in the same junction
	 */
	constructor (
		public id: number,
		public type?: string,
		public sequence?: number
	) {
	}

	clone (): TvJunctionController {
		return new TvJunctionController( this.id, this.type, this.sequence );
	}
}
