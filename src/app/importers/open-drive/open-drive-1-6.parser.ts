import { Injectable } from '@angular/core';
import { OpenDrive14Parser } from './open-drive-1-4.parser';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { XmlElement } from '../xml.element';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { readXmlArray } from 'app/tools/xml-utils';
import { TvLaneBorder } from 'app/modules/tv-map/models/tv-lane-border';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';


@Injectable( {
	providedIn: 'root'
} )
export class OpenDrive16Parser extends OpenDrive14Parser {

	constructor () {
		super();
	}

	parseLane ( laneSection: TvLaneSection, xmlElement: XmlElement, laneSide: TvLaneSide ): TvLane {

		const lane = super.parseLane( laneSection, xmlElement, laneSide );

		readXmlArray( xmlElement.border, xml => {

			lane.addBorder( this.parseLaneBorder( xml ) );

		} );

		return lane;
	}

	parseLaneBorder ( xml: XmlElement ): TvLaneBorder {

		const s = parseFloat( xml.attr_sOffset );
		const a = parseFloat( xml.attr_a );
		const b = parseFloat( xml.attr_b );
		const c = parseFloat( xml.attr_c );
		const d = parseFloat( xml.attr_d );

		return new TvLaneBorder( s, a, b, c, d );
	}

}
