/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BoundingBox } from './tv-bounding-box';
import { PedestrianCategory } from './tv-enums';
import { IScenarioObject } from './tv-interfaces';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { TvProperties } from './tv-properties';

export class Pedestrian extends IScenarioObject {

	private m_Name: string;
	private m_Model: string;
	private m_Mass: string;
	private m_Category: PedestrianCategory;
	private m_ParameterDeclarations: ParameterDeclaration[];
	private m_BoundingBox: BoundingBox;
	private m_Properties: TvProperties;

}
