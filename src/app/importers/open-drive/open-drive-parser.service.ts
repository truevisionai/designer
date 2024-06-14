/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { XMLParser } from "fast-xml-parser";
import { XmlElement } from "../xml.element";
import { OpenDrive14Parser } from "./open-drive-1-4.parser";
import { IOpenDriveParser } from "./i-open-drive.parser";
import { OpenDrive15Parser } from './open-drive-1-5.parser';
import { OpenDrive16Parser } from './open-drive-1-6.parser';
import { TvConsole } from 'app/core/utils/console';
import { TvMap } from 'app/map/models/tv-map.model';
import { SnackBar } from 'app/services/snack-bar.service';

@Injectable( {
	providedIn: 'root'
} )
export class OpenDriveParserService {

	constructor (
		private snackBar: SnackBar,
	) {
	}

	parse ( contents: string ): TvMap {

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			textNodeName: 'value',
			ignoreAttributes: false,
			supressEmptyNode: false,
			format: true,
		};

		const xmlParser = new XMLParser( defaultOptions );

		const root: XmlElement = xmlParser.parse( contents );

		const openDriveParser = this.getOpenDriveParser( root );

		if ( !openDriveParser ) {
			return new TvMap();
		}

		const map = openDriveParser.parse( root );

		return map;
	}

	private parseVersion ( xml: XmlElement ): string {

		const revMajor = parseInt( xml.OpenDRIVE?.header?.attr_revMajor );
		const revMinor = parseInt( xml.OpenDRIVE?.header?.attr_revMinor );

		return "v" + revMajor + "." + revMinor;
	}

	private getOpenDriveParser ( root: XmlElement ): IOpenDriveParser | undefined {

		const version = this.parseVersion( root );

		TvConsole.info( "Importing OpenDRIVE version: " + version );

		return this.getParser( version );
	}

	getParser ( version: string ): IOpenDriveParser | undefined {

		if ( version == "v1.0" ) {
			return new OpenDrive14Parser( this.snackBar );
		}

		if ( version == "v1.1" ) {
			return new OpenDrive14Parser( this.snackBar );
		}

		if ( version == "v1.2" ) {
			return new OpenDrive14Parser( this.snackBar );
		}

		if ( version == "v1.4" ) {
			return new OpenDrive14Parser( this.snackBar );
		}

		if ( version == "v1.5" ) {
			return new OpenDrive15Parser( this.snackBar );
		}

		if ( version == "v1.6" ) {
			return new OpenDrive16Parser( this.snackBar );
		}

		if ( version == "v1.7" ) {
			return new OpenDrive16Parser( this.snackBar );
		}

		if ( version == "v1.8" ) {
			return new OpenDrive16Parser( this.snackBar );
		}

		if ( version == "v2.0" ) {
			this.snackBar.error( "Unsupported OpenDRIVE version: " + version );
		}

		this.snackBar.error( "Unsupported OpenDRIVE version: " + version );
	}

}
