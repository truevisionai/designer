/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class FileHeader {

	public revMajor: number;
	public revMinor: number;
	public date: string;
	public description: string;
	public author: string;

	constructor (
		revMajor: number = 1,
		revMinor: number = 6,
		date: string = '',
		description: string = '',
		author: string = ''
	) {

		this.revMajor = revMajor;
		this.revMinor = revMinor;
		this.date = date;
		this.description = description;
		this.author = author;

	}

	static readXml ( FileHeader: any ): FileHeader {

		const revMajor = FileHeader.attr_revMajor;
		const revMinor = FileHeader.attr_revMinor;
		const date = FileHeader.attr_date;
		const description = FileHeader.attr_description;
		const author = FileHeader.attr_author;

		return new FileHeader( revMajor, revMinor, date, description, author );
	}

	exportXml (): any {

		return {
			attr_revMajor: this.revMajor,
			attr_revMinor: this.revMinor,
			attr_date: this.date,
			attr_description: this.description,
			attr_author: this.author,
		};

	}


}
