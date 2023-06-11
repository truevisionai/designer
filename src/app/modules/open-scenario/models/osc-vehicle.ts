/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BoundingBox } from './osc-bounding-box';
import { VehicleCategory } from './osc-enums';
import { IScenarioObject } from './osc-interfaces';
import { ParameterDeclaration } from './osc-parameter-declaration';
import { Properties } from './osc-properties';

export class Vehicle extends IScenarioObject {
	private m_Name: string;
	private m_Category: VehicleCategory;
	private m_ParameterDeclarations: ParameterDeclaration[];
	private m_BoundingBox: BoundingBox;
	private m_Properties: Properties;

	private m_FrontAxle: Axle;
	private m_RearAxle: Axle;
	private m_AdditionalAxles: Axle[];

}

export class Performance {

	private maxSpeed: number;
	private maxDeceleration: number;
	private mass: number;

}

export class Axle {

	private maxSteering: number;
	private wheelDiameter: number;
	private trackWidth: number;
	private positionX: number;
	private positionZ: number;

}
