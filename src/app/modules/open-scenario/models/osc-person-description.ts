import { OscProperties } from './osc-properties';
import { OscSex } from './osc-enums';

export class OscPersonDescription {

	private weight: number;
	private height: number;
	private eyeDistance: number;
	private age: number;
	private sex: OscSex;
	private properties: OscProperties = new OscProperties;

}
