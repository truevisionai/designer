export class IDService {

	private highestID: number;
	private usedIDs: Set<number>;

	constructor () {

		this.highestID = 0;
		this.usedIDs = new Set<number>();

	}

	reset () {

		this.highestID = 0;
		this.usedIDs = new Set<number>();

	}

	getNextId ( importedID?: number ): number {

		if ( this.usedIDs.has( importedID ) ) {
			throw new Error( `IDService: ID ${ importedID } already in use!` );
		}

		let nextId = null;

		if ( importedID !== undefined && importedID !== null && typeof importedID === 'number' ) {

			nextId = importedID;

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

	}

	private updateHighestID () {

		for ( const id of this.usedIDs ) {

			if ( id > this.highestID ) {

				this.highestID = id;

			}

		}

	}

}
