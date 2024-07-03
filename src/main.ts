let count = 2;
let archive = ["<svg viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n<polygon points=\"\" style=\"fill: rgb(255,0,0); stroke: rgb(255,0,0); stroke-width: 0.3;\"></polygon>\n</svg>"];

window.onload = function() {
  const changeColorTrigger = document.getElementById("pColor");
  if (changeColorTrigger) {
    changeColorTrigger.addEventListener("change", FChangeColor);
  }

  const fillTrigger = document.getElementById("pFill");
  if (fillTrigger) {
    fillTrigger.addEventListener("change", FChangeColor);
  }

  const zoomOutTrigger = document.getElementById("zoomOut");
  if (zoomOutTrigger) {
    zoomOutTrigger.addEventListener("click", FZoomOut);
  }

  const zoomInTrigger = document.getElementById("zoomIn");
  if (zoomInTrigger) {
    zoomInTrigger.addEventListener("click", FZoomIn);
  }

  const prevOperationTrigger = document.getElementById("prevOperation");
  if (prevOperationTrigger) {
    prevOperationTrigger.addEventListener("click", () => FPrevOperation(prevOperationTrigger));
  }

  const nextOperationTrigger = document.getElementById("nextOperation");
  if (nextOperationTrigger) {
    nextOperationTrigger.addEventListener("click", () => FNextOperation(nextOperationTrigger));
  }

  const clearOperationTrigger = document.getElementById("clearOperation");
  if (clearOperationTrigger) {
    clearOperationTrigger.addEventListener("click", FClearOperation);
  }

  const patternImageTrigger = document.getElementById("paternImage");
  if (patternImageTrigger) {
    patternImageTrigger.addEventListener("click", () => FAddPoint(patternImageTrigger));
    patternImageTrigger.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  const svgContainerTrigger = document.getElementById("svgContainer");
  if (svgContainerTrigger) {
    svgContainerTrigger.addEventListener("contextmenu", FDelPoint);
  }

  const resultHtml = document.getElementById("resultHtml");
  if (resultHtml) {
    resultHtml.addEventListener("click", () => FChangeSvg(resultHtml));
  }

  FShowResult();
};

// Choise background image
function FFileSelect(evt) {
  const file = evt.target.files; 		// FileList object
  const f = file[0];

  if (!f.type.match("image.*")) {		// Only process image files.
    alert("Image only please....");
  }

  const reader = new FileReader();
  // Closure to capture the file information.
  reader.onload = (function(theFile) {
    return function(e) {
      const el = document.getElementById("paternImage");
      if (el) {
        const imel = el.getElementsByTagName("img")[0];
        imel.src = e.target.result;
      }
    };
  })(f);
  reader.readAsDataURL(f);   // Read in the image file as a data URL.
}

document.getElementById("iFile")!.addEventListener("change", FFileSelect, false);

function FAddPoint(el) {
  let maxX = el.clientWidth;                    // Get the canvas size
  let maxY = el.clientHeight;
  let cx = event.clientX;                       // Get the cursor coordinates
  let cy = event.clientY;

  let rect = el.getBoundingClientRect();        // position on the screen
  let py = rect.top;                            // from top edge
  let px = rect.left;

  let ry = cy - py;                             // Coordinates relate to parent
  let rx = cx - px;

  let rry = Math.round(ry / maxY * 1000) / 10;  // Coord. relate to parent and image size
  let rrx = Math.round(rx / maxX * 1000) / 10;

  let svgRoot = el.getElementsByTagName("svg")[0];
  let polel = el.getElementsByTagName("polygon")[0];
  let clist = polel.points;
  let point = svgRoot.createSVGPoint();
  point.x = rrx;
  point.y = rry;

  polel.points.appendItem(point);

  FShowResult();
}

function FDelPoint() {
  let el = document.getElementById("paternImage");
  let polel = el.getElementsByTagName("polygon")[0];
  let clist = polel.points;
  let Np = clist.length;
  polel.points.removeItem(Np - 1);
  FShowResult();
}


// Show SVG code
function FShowResult() {
  let el = document.getElementById("paternImage");
  let svgRoot = el.getElementsByTagName("svg")[0];
  let answ = "<svg viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">";
  answ += svgRoot.innerHTML;
  answ += "</svg>";

  // let pretxt = svgRoot.innerHTML;
  // let textArray = pretxt.split("<");
  // let answ = '<code><</code><code>svg viewBox="0 0 100 100" preserveAspectRatio="none"</code><code>>';
  // for (let i = 0; i < textArray.length; i++) {
  // 	answ += '<code><</code>' + textArray[i]
  // }
  // answ += '<</code><code>/svg</code><code>></code>'
  document.getElementById("resultHtml").innerHTML = answ;

  FArchiveOperations(answ);
}


// Change SVG polygon on text input
function FChangeSvg(el) {
  let answ = el.value;
  answ = answ.replace(new RegExp("&lt;", "g"), "<");
  answ = answ.replace(new RegExp("&gt;", "g"), ">");
  document.getElementById("svgContainer").innerHTML = answ;

  FArchiveOperations(answ);
}


function FChangeColor() {
  let el = document.getElementsByTagName("polygon")[0];
  let colr = document.getElementById("pColor").value;
  let filEl = document.getElementById("pFill");
  if (filEl.checked == true) {
    el.style.fill = colr;
    el.style.stroke = colr;
  } else {
    el.style.fill = "none";
    el.style.stroke = colr;
  }
}


function FZoomIn() {
  let el = document.getElementById("paternImage");
  let oWidth = el.clientWidth;
  let nWidth = Math.round(oWidth * 1.1);
  el.style.width = nWidth + "px";
  if (nWidth > el.parentNode.clientWidth) {
    el.parentNode.style.display = "block";
  }
}

function FZoomOut() {
  let el = document.getElementById("paternImage");
  let oWidth = el.clientWidth;
  let nWidth = Math.round(oWidth / 1.1);
  el.style.width = nWidth + "px";
  if (nWidth < el.parentNode.clientWidth) {
    el.parentNode.style.display = "flex";
  }
}


// Archive of polygon changes
function FArchiveOperations(answ) {
  if (count == archive.length) {
    archive.push(answ);
    count = archive.length;
  } else {
    let dt = archive.length - count;
    for (let i = 0; i < dt; i++) {
      archive.pop();
    }
    archive.push(answ);
    count = archive.length;
  }
}


function FPrevOperation(el) {
  let Na = archive.length;
  count -= 1;
  if (count > 1) {
    let incount = count - 1;
    let t = archive[incount];
    document.getElementById("svgContainer").innerHTML = t;
    document.getElementById("resultHtml").innerHTML = t;
    el.classList.remove("not-active");
    el.nextElementSibling.classList.remove("not-active");
  } else if (count == 1) {
    let incount = count - 1;
    let t = archive[incount];
    document.getElementById("svgContainer").innerHTML = t;
    document.getElementById("resultHtml").innerHTML = t;
    el.classList.add("not-active");
    el.nextElementSibling.classList.remove("not-active");
  } else {
    count = 1;
    el.classList.add("not-active");
  }
}

function FNextOperation(el) {
  let Na = archive.length;
  count += 1;
  if (count < Na) {
    let incount = count - 1;
    let t = archive[incount];
    document.getElementById("svgContainer").innerHTML = t;
    document.getElementById("resultHtml").innerHTML = t;
    el.classList.remove("not-active");
    el.previousElementSibling.classList.remove("not-active");

  } else if (count == Na) {
    let incount = count - 1;
    let t = archive[incount];
    document.getElementById("svgContainer").innerHTML = t;
    document.getElementById("resultHtml").innerHTML = t;
    el.classList.add("not-active");
    el.previousElementSibling.classList.remove("not-active");
  } else {
    count = Na;
    el.classList.add("not-active");
  }
}

function FClearOperation() {
  let el = document.getElementById("paternImage");
  let polel = el.getElementsByTagName("polygon")[0];
  let clist = polel.points;
  let Np = clist.length;
  for (let p = Np - 1; p >= 0; p--) {
    polel.points.removeItem(p);
  }
  FShowResult();
}
