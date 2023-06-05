/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';

export class TvUtils {

	static checkInterval ( items: Map<number, ThirdOrderPolynom>, s: number, sort: boolean = false ): ThirdOrderPolynom {

		let array = [];

		if ( sort ) {

			const inDescOrder = ( a, b ) => a[ 0 ] > b[ 0 ] ? -1 : 1;

			array = [ ...items.entries() ].sort( inDescOrder );

		} else {

			array = Array.from( items.entries() );

		}

		const checkInterval = ( a, b ) => a[ 0 ] > s ? -1 : 1;

		return array.sort( checkInterval ).pop();
	}

	static checkIntervalArray ( items: { s: number }[], s: number ): any {

		let result = null;

		for ( let i = 0; i < items.length; i++ ) {

			const item = items[ i ];

			if ( s >= item.s ) result = item;

		}

		return result;

		// less efficient map copy method
		// const array = Array.from( items.entries() );
		//
		// // filter items that are equal and greater than the given s
		// const checkInterval = ( a ) => a[ 0 ] >= s ? -1 : 1;
		//
		// try {
		//
		//     // get the last item from the list
		//     return array.filter( checkInterval ).pop()[ 1 ];
		//
		// } catch ( e ) {
		//
		//     console.error( e );
		//     console.error( items, s );
		//
		// }

	}

	static getRandomMapItem ( map: Map<number, any> ): any {

		let items = Array.from( map );

		return items[ Math.floor( Math.random() * items.length ) ][ 1 ];

	}

	static getRandomArrayItem ( items: any[] ): any {

		return items[ Math.floor( Math.random() * items.length ) ];

	}

	static computeCoefficients ( sections: ThirdOrderPolynom[], sectionLength: number ): void {

		// need at least 2 sections to compute coefficients
		if ( sections.length < 2 ) return;

		for ( let i = 0; i < sections.length; i++ ) {

			const current = sections[ i ];

			let valueStart, valueEnd, derivStart, derivEnd, length;

			if ( ( i + 1 ) < sections.length ) {

				const next = sections[ i + 1 ];

				// next s cannot be less than current so we need to clamp it
				if ( next.s <= current.s ) {

					next.s = current.s + 0.1;

				}

				length = next.s - current.s;

				valueStart = current.a;          // value at start
				valueEnd = next.a;               // value at end
				derivStart = current.b;          // derivative at start
				derivEnd = next.b;               // derivative at end

			} else {

				// take lane section length
				length = sectionLength;

				valueStart = current.a;          // value at start
				valueEnd = current.a;            // value at end
				derivStart = current.b;          // derivative at start
				derivEnd = current.b;            // derivative at end

			}

			let a = valueStart;
			let b = derivStart;
			let c = ( -3 * valueStart ) + ( 3 * valueEnd ) + ( -2 * derivStart ) + ( -1 * derivEnd );
			let d = ( 2 * valueStart ) + ( -2 * valueEnd ) + ( 1 * derivStart ) + ( 1 * derivEnd );

			b /= length;
			c /= length * length;
			d /= length * length * length;

			current.a = a;
			current.b = b;
			current.c = c;
			current.d = d;

		}

	}

}
