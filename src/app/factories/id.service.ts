/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class IDService {

	private readonly usedIDs: Set<number>;

	private highestID: number;

	private removedIDs: number[];

	constructor () {

		this.highestID = 0;
		this.usedIDs = new Set<number>();
		this.removedIDs = [];

	}

	reset () {

		this.highestID = 0;
		this.usedIDs.clear()
		this.removedIDs = [];

	}

	getNextId ( importedID?: number ): number {

		if ( this.usedIDs.has( importedID ) ) {
			throw new Error( `IDService: ID ${ importedID } already in use!` );
		}

		let nextId = null;

		if ( importedID !== undefined && importedID !== null && typeof importedID === 'number' ) {

			nextId = importedID;

		} else if ( this.removedIDs.length > 0 ) {

			nextId = this.removedIDs.shift(); // Take the smallest ID from the sorted array

		} else {

			nextId = this.highestID + 1;

		}

		this.usedIDs.add( nextId );

		this.updateHighestID();

		return nextId;
	}

	getName ( prefix: string, importedID?: number ): string {

		return `${ prefix }_${ this.getNextId( importedID ) }`;

	}

	remove ( id: number ) {

		this.usedIDs.delete( id );

		this.updateHighestID();

		// If the ID is already in the sorted array, don't add it again
		if ( this.removedIDs.includes( id ) ) return;

		// Insert the removed ID into the sorted array in its correct position
		const index = this.removedIDs.findIndex( removedId => removedId > id );

		if ( index === -1 ) {

			this.removedIDs.push( id );

		} else {

			this.removedIDs.splice( index, 0, id );

		}

	}

	private updateHighestID () {

		this.highestID = 0;

		for ( const id of this.usedIDs ) {

			if ( id > this.highestID ) {

				this.highestID = id;

			}

		}

	}

}
