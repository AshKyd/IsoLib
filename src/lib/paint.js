import Color from "color";
import config from "./replacements.json";
import { DAY } from "./time";
const { colourReplacements, colourWindows, colourNeons } = config;

function makeReplacement(haystack, type, before, after) {
  const search = new RegExp(type + ":" + before, "g");
  return haystack.replace(search, type + ":" + after);
}

function recolour(svg, type, newBase) {
  var baseColor = Color(newBase);
  var fills = {
    fill: [
      baseColor.darken(0.2).hex(),
      baseColor.hex(),
      baseColor.lighten(0.1).hex(),
      baseColor.lighten(0.2).hex(),
    ],
    stroke: [
      baseColor.darken(0.3).hex(),
      baseColor.darken(0.1).hex(),
      baseColor.lighten(0.2).hex(),
      baseColor.lighten(0.3).hex(),
    ],
  };

  for (var i = 0; i < colourReplacements[type].length; i++) {
    svg = makeReplacement(
      svg,
      "fill",
      colourReplacements[type][i],
      fills.fill[i]
    );
    svg = makeReplacement(
      svg,
      "stop-color",
      colourReplacements[type][i],
      fills.fill[i]
    );
    svg = makeReplacement(
      svg,
      "stroke",
      colourReplacements[type][i],
      fills.stroke[i]
    );
  }

  return svg;
}

function colorEq(a, b) {
  if (typeof a == "undefined" || typeof b == "undefined") return false;
  return a.toUpperCase() == b.toUpperCase();
}

function numberBetween(a, b, c) {
  return a < c && b > c;
}

function recolorEvening(str, oldColor, time, opts) {
  if (colorEq(oldColor, colourNeons.on)) {
    return oldColor + ";";
  } else if (colorEq(oldColor, colourNeons.blink)) {
    return (time * 10000) % 2 == 0
      ? colourNeons.on + ";"
      : colourNeons.off + ";";
  }

  if (colorEq(oldColor, colourWindows.nightOnly)) {
    if (numberBetween(6, 20, time)) {
      return "rgba(0,0,0,0);";
    }
    return colourWindows.nightLight;
  } else if (
    colorEq(oldColor, colourWindows.nightLight) ||
    colorEq(oldColor, colourWindows.nightRandom)
  ) {
    if (numberBetween(6, 20, time)) {
      return colourWindows.day + ";";
    }

    if (
      (typeof opts.alwayslightup != "undefined" && opts.alwayslightup) ||
      colorEq(oldColor, colourWindows.nightLight)
    ) {
      return colourWindows.nightLight + ";";
    }

    var lightsChance = Math.abs(time - 12) / 24;
    return Math.random() > lightsChance
      ? colourWindows.nightLight + ";"
      : colourWindows.nightDark + ";";
  }

  var color = Color(oldColor);
  if (numberBetween(5, 6.1, time) || numberBetween(17, 18.1, time)) {
    color = color.darken(0.05).mix(Color("#FF8800"), 0.1);
  } else if (numberBetween(4, 5.1, time) || numberBetween(18, 19.1, time)) {
    color = color.darken(0.1).mix(Color("#FF4400"), 0.1);
  } else if (numberBetween(3, 4.1, time) || numberBetween(19, 20.1, time)) {
    color = color.darken(0.2).desaturate(0.2).mix(Color("#8800FF"), 0.1);
  } else if (numberBetween(20, 24, time) || numberBetween(-1, 6.1, time)) {
    // From 9 PM until 6 AM
    color = color.darken(0.2).desaturate(0.5).mix(Color("#0000ff"), 0.2);
  }
  return color.hex() + ";";
}

export function paint(
  svg,
  { flip, primary, secondary, time, alwayslightup = false }
) {
  var flipped = flip ? "Alt" : "";
  svg = recolour(svg, "primary" + flipped, primary);
  svg = recolour(svg, "secondary" + flipped, secondary);

  const hourOfDay = (time % DAY) / (DAY / 24);

  if (time) {
    svg = svg.replace(/(#[a-fA-F0-9]{6});/g, function (a, b) {
      return recolorEvening(a, b, hourOfDay, { alwayslightup });
    });
  }

  return svg;
}
