import { TvParkingSpaceAccess } from "../tv-common";
import { TvParkingSpaceMarking } from "./tv-parking-space-marking";

export class TvParkingSpace {
	public attr_access: TvParkingSpaceAccess;
	public attr_restriction: string;

	// MAX 4 ENTRIES ALLOWED
	public marking: TvParkingSpaceMarking[] = [];

	getMarkingCount (): number {
		return this.marking.length;
	}

	getMarkingList (): TvParkingSpaceMarking[] {
		return this.marking;
	}

	getMarking ( i: number ): TvParkingSpaceMarking {
		return this.marking[ i ];
	}
}
