/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AmbientLight, DirectionalLight, Vector3 } from "three";

export const DIRECTIONAL_LIGHT_COLOR = 0xffffff;
export const DIRECTIONAL_LIGHT_INTENSITY = 6;
export const DIRECTIONAL_LIGHT_POSITION = new Vector3( 5, 10, 7.5 );
export const DEFAULT_DIRECTIONAL_LIGHT = new DirectionalLight( DIRECTIONAL_LIGHT_COLOR, DIRECTIONAL_LIGHT_INTENSITY );

export const AMBIENT_LIGHT_COLOR = 0xE6E6E6;
export const AMBIENT_LIGHT_INTENSITY = 3;
export const DEFAULT_AMBIENT_LIGHT = new AmbientLight( AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY );

