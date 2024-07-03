let count = 2;
let archive = ["<svg viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n	<polygon points=\"\" style=\"fill: rgb(255,0,0); stroke: rgb(255,0,0); stroke-width: 0.3;\"></polygon>\n</svg>"];

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
  var maxX = el.clientWidth;                    // Get the canvas size
  var maxY = el.clientHeight;
  var cx = event.clientX;                       // Get the cursor coordinates
  var cy = event.clientY;

  var rect = el.getBoundingClientRect();        // position on the screen
  var py = rect.top;                            // from top edge
  var px = rect.left;

  var ry = cy - py;                             // Coordinates relate to parent
  var rx = cx - px;

  var rry = Math.round(ry / maxY * 1000) / 10;  // Coord. relate to parent and image size
  var rrx = Math.round(rx / maxX * 1000) / 10;

  var svgRoot = el.getElementsByTagName("svg")[0];
  var polel = el.getElementsByTagName("polygon")[0];
  var clist = polel.points;
  var point = svgRoot.createSVGPoint();
  point.x = rrx;
  point.y = rry;

  polel.points.appendItem(point);

  FShowResult();
}

function FDelPoint() {
  var el = document.getElementById("paternImage");
  var polel = el.getElementsByTagName("polygon")[0];
  var clist = polel.points;
  var Np = clist.length;
  polel.points.removeItem(Np - 1);
  FShowResult();
}


// Show SVG code
function FShowResult() {
  var el = document.getElementById("paternImage");
  var svgRoot = el.getElementsByTagName("svg")[0];
  var answ = "<svg viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">";
  answ += svgRoot.innerHTML;
  answ += "</svg>";

  // var pretxt = svgRoot.innerHTML;
  // var textArray = pretxt.split("<");
  // var answ = '<code><</code><code>svg viewBox="0 0 100 100" preserveAspectRatio="none"</code><code>>';
  // for (var i = 0; i < textArray.length; i++) {
  // 	answ += '<code><</code>' + textArray[i]
  // }
  // answ += '<</code><code>/svg</code><code>></code>'
  document.getElementById("resultHtml").innerHTML = answ;

  FArchiveOperations(answ);
}


// Change SVG polygon on text input
function FChangeSvg(el) {
  var answ = el.value;
  answ = answ.replace(new RegExp("&lt;", "g"), "<");
  answ = answ.replace(new RegExp("&gt;", "g"), ">");
  document.getElementById("svgContainer").innerHTML = answ;

  FArchiveOperations(answ);
}


function FChangeColor() {
  var el = document.getElementsByTagName("polygon")[0];
  var colr = document.getElementById("pColor").value;
  var filEl = document.getElementById("pFill");
  if (filEl.checked == true) {
    el.style.fill = colr;
    el.style.stroke = colr;
  } else {
    el.style.fill = "none";
    el.style.stroke = colr;
  }
}


function FZoomIn() {
  var el = document.getElementById("paternImage");
  var oWidth = el.clientWidth;
  var nWidth = Math.round(oWidth * 1.1);
  el.style.width = nWidth + "px";
  if (nWidth > el.parentNode.clientWidth) {
    el.parentNode.style.display = "block";
  }
}

function FZoomOut() {
  var el = document.getElementById("paternImage");
  var oWidth = el.clientWidth;
  var nWidth = Math.round(oWidth / 1.1);
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
    var dt = archive.length - count;
    for (var i = 0; i < dt; i++) {
      archive.pop();
    }
    archive.push(answ);
    count = archive.length;
  }
}


function FPrevOperation(el) {
  var Na = archive.length;
  count -= 1;
  if (count > 1) {
    var incount = count - 1;
    var t = archive[incount];
    document.getElementById("svgContainer").innerHTML = t;
    document.getElementById("resultHtml").innerHTML = t;
    el.classList.remove("not-active");
    el.nextElementSibling.classList.remove("not-active");
  } else if (count == 1) {
    var incount = count - 1;
    var t = archive[incount];
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
  var Na = archive.length;
  count += 1;
  if (count < Na) {
    var incount = count - 1;
    var t = archive[incount];
    document.getElementById("svgContainer").innerHTML = t;
    document.getElementById("resultHtml").innerHTML = t;
    el.classList.remove("not-active");
    el.previousElementSibling.classList.remove("not-active");

  } else if (count == Na) {
    var incount = count - 1;
    var t = archive[incount];
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
  var el = document.getElementById("paternImage");
  var polel = el.getElementsByTagName("polygon")[0];
  var clist = polel.points;
  var Np = clist.length;
  for (var p = Np - 1; p >= 0; p--) {
    polel.points.removeItem(p);
  }
  FShowResult();
}
