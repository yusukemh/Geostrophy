
class Button {
    constructor(x, y, w, h, text) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.text = text
    }

    is_on(x, y) {
      return inRect([this.x, this.y, this.w, this.h], x, y)
    }

    draw() {
      fill(200);
      noStroke();
      strokeWeight(1);
      rect(this.x, this.y, this.w, this.h);
      fill(0);
      textSize(16);
      text(this.text,
        this.x + this.w / 2,
        this.y + this.h / 2,
  );
    }
}

class ToggleButton extends Button {
  constructor(x, y, w, h, options) {
    super(x, y, w, h, options[0])
    this.options = options
    this.current_option_index = 0
  }

  mousePressed() {
    this.text = this.options[(this.current_option_index + 1) % this.options.length]
    this.current_option_index += 1
  }
}

function drawButton(button_params) {
  fill(200);
  rect(button_params[0], button_params[1], button_params[2], button_params[3]);
  fill(255);
  textSize(16);
  text("Reset",
    button_params[0] + button_params[2]/2,
    button_params[1] + button_params[3]/2,
  );
}

function drawParallelIsobar() {
  // fill(222);
  stroke(0, 0, 0);
  // strokeWeight(1);
  d = sqrt((lp.x - hp.x) ** 2 + (lp.y - hp.y) ** 2)
  // strokeWeight(0);

  vec = [(lp.x - hp.x), (lp.y - hp.y)]
  m = - (lp.x - hp.x) / (lp.y - hp.y)

  proportions = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5]
  for (let i = 0; i < proportions.length; i ++){
    intersection = new Point(hp.x + vec[0] * proportions[i], hp.y + vec[1] * proportions[i])
    strokeWeight(2);
    // [235, 64, 52], [90, 13, 222]
    c = lerpColor(color(235, 64, 52), color(90, 13, 222), proportions[i]/1.5)
    stroke(c)
    line(0, m * (0 - intersection.x) + intersection.y, width, m * (width - intersection.x) + intersection.y)
  }
}

function drawCircularIsobar(pressure_field) {
  // stroke(0,0,0);
  strokeWeight(3);
  noFill();
  vec = Vector.from_endpoints(pressure_field.high, pressure_field.low)
  
  if (pressure_field.type == 1) {
    center = pressure_field.high
  } else {
    center = pressure_field.low
  }

  proportions = [0.25, 0.5, 0.75, 1, 1.25, 1.5]
  for (let i=0; i<=proportions.length; i++){
    c = lerpColor(color(235, 64, 52), color(90, 13, 222), proportions[i]/1.5)
    stroke(c)
    circle(center.x, center.y, vec.length * proportions[i] * 2)// third argument is width, not radius
  }
}

function drawIsobar(pressure_field) {
  if (pressure_field.type == 0) {
    drawParallelIsobar()
  } else if (pressure_field.type <= 2) {
    drawCircularIsobar(pressure_field)
  } else {
    console.log('unexpected pressure_field.type in drawIsobar()', pressure_field.type)
  }
  // overwrite pressure points over isobars
  pressure_field.high.draw()
  pressure_field.low.draw()
}


function inRect(rect_params, x, y) {
    if (x < rect_params[0]) {return false}
    if (x > rect_params[0] + rect_params[2]) {return false}
    if (y < rect_params[1]) {return false}
    if (y > rect_params[1] + rect_params[3]) {return false}
    return true
  }

function drawCircleWithText(txt, x, y, radius, facecolor, edgecolor) {
  // Draw the circle
  // fill(200); // Circle color
  noStroke();
  fill(facecolor[0], facecolor[1], facecolor[2])
  // fill(facecolor)
  ellipse(x, y, radius, radius);

  // Draw the text inside the circle
  fill(255); // Text color
  textSize(radius/2); // Set text size proportional to radius
  text(txt, x, y); // Draw text at the center of the circle
  
  strokeWeight(0.04 * radius)
  stroke(edgecolor[0], edgecolor[1], edgecolor[2]);
  noFill();
  circle(x, y, radius)
}


class RadioButtonHandler {
  constructor(name){//name of the radio options
    this.name = name
    // document.getElementsByName(this.name)[0].checked = true
  }

  get_selection() {
    var options = document.getElementsByName(this.name)
    for (let i=0; i < options.length; i++){
      if (options[i].checked) {
        return options[i].value
      }
    }
  }
}

class CheckBoxHandler {
  constructor(id){//id of the checkbox
    this.id = id
  }

  is_checked() {
    return document.getElementById(this.id).checked
  }
}

class SliderHandler {
  constructor(id) {
    this.id = id
  }

  get_value() {
    return document.getElementById(this.id).value
  }
}