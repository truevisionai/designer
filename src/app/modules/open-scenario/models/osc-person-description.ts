import { OscSex } from './osc-enums';
import { OscProperties } from './osc-properties';

export class OscPersonDescription {

	private weight: number;
	private height: number;
	private eyeDistance: number;
	private age: number;
	private sex: OscSex;
	private properties: OscProperties = new OscProperties;

}
