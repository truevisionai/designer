
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

	getUniqueID ( importedID?: number ): number {

		if ( importedID !== undefined ) {

			this.usedIDs.add( importedID );

			if ( importedID > this.highestID ) {
				this.highestID = importedID;
			}

			return importedID;
		}

		// Ensuring the new ID is unique
		do {
			this.highestID++;
		} while ( this.usedIDs.has( this.highestID ) );

		this.usedIDs.add( this.highestID );

		return this.highestID;
	}

	getUniqueName ( prefix: string, importedID?: number ): string {

		return `${ prefix }_${ this.getUniqueID( importedID ) }`;

	}

}
