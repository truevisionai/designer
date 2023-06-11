/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BoundingBox } from './osc-bounding-box';
import { PedestrianCategory } from './osc-enums';
import { IScenarioObject } from './osc-interfaces';
import { ParameterDeclaration } from './osc-parameter-declaration';
import { Properties } from './osc-properties';

export class Pedestrian extends IScenarioObject {

	private m_Name: string;
	private m_Model: string;
	private m_Mass: string;
	private m_Category: PedestrianCategory;
	private m_ParameterDeclarations: ParameterDeclaration[];
	private m_BoundingBox: BoundingBox;
	private m_Properties: Properties;

}
