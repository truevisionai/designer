/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class Product {
  public _id: string;
  public name: string;
  public description?: string;
  public category?: string;
  public tags?: string[];
  public price: {
    sale: number,
    previous?: number
  };
  public ratings?: {
    rating: number,
    ratingCount: number
  };
  public features?: string[];
  public photo?: string;
  public gallery?: string[];
  public badge?: { text: string, color?: string };
}
