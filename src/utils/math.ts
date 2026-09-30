import Decimal from 'break_eternity.js';

export const D = (
  value:
    | number
    | string
    | Decimal,
): Decimal => {
  return new Decimal(value);
};

export const formatDecimal = (
  value: Decimal,
  places = 0,
): string => {
  if (value.lt(1000)) {
    return value
      .toNumber()
      .toFixed(places);
  }

  if (value.lt(1e6)) {
    return (
      value
        .toNumber()
        / 1000
    ).toFixed(2) + 'k';
  }

  if (value.lt(1e9)) {
    return (
      value
        .toNumber()
        / 1e6
    ).toFixed(2) + 'm';
  }

  if (value.lt(1e12)) {
    return (
      value
        .toNumber()
        / 1e9
    ).toFixed(2) + 'b';
  }

  if (value.lt(1e15)) {
    return (
      value
        .toNumber()
        / 1e12
    ).toFixed(2) + 't';
  }

  return value
    .toExponential(2)
    .replace('e+', 'e');
};