import * as Canvg from "canvg";
import sax from "sax";

export function getDims(svg) {
  return new Promise((resolve, reject) => {
    const parser = sax.parser(true);

    parser.onerror = function (e) {
      reject(e);
    };
    //   parser.ontext = function (t) {
    //     // got some text.  t is the string of text.
    //   };
    parser.onopentag = function (node) {
      if (node.name === "svg") {
        resolve([node.attributes.width, node.attributes.height]);
      }
    };
    //   parser.onattribute = function (attr) {
    //     // an attribute.  attr has "name" and "value"
    //   };
    parser.onend = function () {};

    parser.write(svg).close();
  });
}

export async function getNadir(svg) {
  const canvas = new OffscreenCanvas(100, 100);
  //   const canvas = document.createElement("canvas");
  //   canvas.width = Math.round(100);
  //   canvas.height = Math.round(100);
  //   canvas.style.border = "1px solid black";
  //   document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  const v = await Canvg.Canvg.fromString(context, svg, {});
  await v.render();

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = pixels.data.length - 4; i >= 0; i -= 4) {
    // const r = pixels.data[i];
    // const g = pixels.data[i + 1];
    // const b = pixels.data[i + 2];
    const a = pixels.data[i + 3];
    // console.log(`rgba(${[r, g, b, a].join()})`);
    if (a !== 0) {
      // this is our first non-empty pixel we're looking for.
      const x = (i / 4) % canvas.width;
      const y = Math.floor(i / canvas.width / 4);
      return [x, y];
    }
  }
}
