declare module 'break_eternity.js' {
  export default class Decimal {
    constructor(value?: number | string | Decimal);
    m: number;
    e: number;
    s: number;
    plus(other: number | string | Decimal): Decimal;
    minus(other: number | string | Decimal): Decimal;
    times(other: number | string | Decimal): Decimal;
    divide(other: number | string | Decimal): Decimal;
    eq(other: number | string | Decimal): boolean;
    lt(other: number | string | Decimal): boolean;
    lte(other: number | string | Decimal): boolean;
    gt(other: number | string | Decimal): boolean;
    gte(other: number | string | Decimal): boolean;
    floor(): Decimal;
    toNumber(): number;
    toExponential(places?: number): string;
    static min(a: number | string | Decimal, b: number | string | Decimal): Decimal;
    static max(a: number | string | Decimal, b: number | string | Decimal): Decimal;
  }
}