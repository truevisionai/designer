import { TvObjectMarking } from "../tv-object-marking";
import { ObjectTypes } from "../tv-common";
import { TvRoadObject } from "./tv-road-object";
import { TvCornerRoad } from "./tv-corner-road";
import { TvObjectOutline } from "./tv-object-outline";

export class Crosswalk extends TvRoadObject {

	constructor (
		s: number,
		t: number,
		markings = [ new TvObjectMarking() ],
		outlines = [ new TvObjectOutline() ]
	) {

		super( ObjectTypes.crosswalk, 'crosswalk', TvRoadObject.counter++, s, t );

		outlines.forEach( outline => outline.cornerRoad.forEach( cornerRoad => {

			cornerRoad.mainObject = this;

			this.add( cornerRoad );

		} ) );

		this.outlines = outlines;

		if ( !markings.length ) markings.push( new TvObjectMarking() );

		markings.map( marking => marking.roadObject = this );

		this._markings = markings;

		this.update();
	}

	get marking () {

		return this.markings[ 0 ];

	}

	update () {

		if ( this.marking.cornerReferences.length < 2 ) return;

		this.marking.update();

	}

	addCornerRoad ( cornerRoad: TvCornerRoad ) {

		cornerRoad.mainObject = this;

		this.marking.addCornerRoad( cornerRoad );

		this.outlines[ 0 ].cornerRoad.push( cornerRoad );

		this.add( cornerRoad );

		this.update();

	}

	removeCornerRoad ( cornerRoad: TvCornerRoad ) {

		this.marking.removeCornerRoad( cornerRoad );

		this.outlines[ 0 ].removeCornerRoad( cornerRoad );

		this.remove( cornerRoad );

		this.update();

	}

}
