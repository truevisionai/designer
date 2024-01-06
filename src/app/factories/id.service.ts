export class IDService {

	private highestID: number;
	private usedIDs: Set<number>;
	private removedIDs: Set<number>;

	constructor () {

		this.highestID = 0;
		this.usedIDs = new Set<number>();
		this.removedIDs = new Set<number>();

	}

	reset () {

		this.highestID = 0;
		this.usedIDs.clear()
		this.removedIDs.clear();

	}

	getNextId ( importedID?: number ): number {

		if ( this.usedIDs.has( importedID ) ) {
			throw new Error( `IDService: ID ${ importedID } already in use!` );
		}

		let nextId = null;

		if ( importedID !== undefined && importedID !== null && typeof importedID === 'number' ) {

			nextId = importedID;

		} else if ( this.removedIDs.size > 0 ) {

			nextId = this.removedIDs.values().next().value;

			this.removedIDs.delete( nextId );

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

		this.removedIDs.add( id );

		this.updateHighestID();

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
