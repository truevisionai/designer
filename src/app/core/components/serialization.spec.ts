import { PlayerStats, Serializable, SerializedField, getSerializableFields } from "./serialization";

describe( 'Serialization', () => {

	it( 'should parse LongitudinalPurpose->None correctly', () => {

		const obj = new PlayerStats();

		const properties = getSerializableFields( obj );

		console.log( properties );

	} )

} );