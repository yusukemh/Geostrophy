
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
  stroke(0, 0, 0);
  d = 0.5 / handler_pg_magnitude.get_value()
  vec = new Vector(lp.x - hp.x, lp.y - hp.y)
  m = - vec.dx / vec.dy

  for (let i = -5; i < 8; i ++){
    intersection = new Point(hp.x + vec.dx * d * i, hp.y + vec.dy * d * i)
    strokeWeight(2);
    c = lerpColor(color(235, 64, 52), color(255, 255, 255), (i + 5)/14)
    stroke(c)
    line(0, m * (0 - intersection.x) + intersection.y, width, m * (width - intersection.x) + intersection.y)
  }
}

function drawCircularIsobar(pressure_field) {
  // stroke(0,0,0);
  strokeWeight(3);
  noFill();
  
  if (pressure_field.type == 1) {
    center = pressure_field.high
    vec = Vector.from_endpoints(pressure_field.high, new Point(0,0))
    centerColor = color(235, 64, 52)
  } else {
    center = pressure_field.low
    vec = Vector.from_endpoints(new Point(0,0), pressure_field.low)
    centerColor = color(90, 13, 222)
  }

  d = 50 * 1 / handler_pg_magnitude.get_value()
  for (let i=0; i<=10; i++){
    c = lerpColor(centerColor, color(255, 255, 255), i/10)
    stroke(c)
    circle(center.x, center.y, d * i)// third argument is width, not radius
  }
}

function drawIsobar(pressure_field) {
  if (pressure_field.type == 0) {
    drawParallelIsobar()
    pressure_field.high.draw()
    pressure_field.low.draw()
  } else if (pressure_field.type == 1) {
    drawCircularIsobar(pressure_field)
    pressure_field.high.draw()
  }else if (pressure_field.type == 2){
    drawCircularIsobar(pressure_field)
    pressure_field.low.draw()
  } else {
    console.log('unexpected pressure_field.type in drawIsobar()', pressure_field.type)
  }
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
  noStroke();
  fill(facecolor[0], facecolor[1], facecolor[2])
  circle(x, y, radius*2)// third value is width, not radius!

  // Draw the text inside the circle
  fill(255); // Text color
  textSize(radius); // Set text size proportional to radius
  text(txt, x, y); // Draw text at the center of the circle
  
  strokeWeight(0.04 * radius)
  stroke(edgecolor[0], edgecolor[1], edgecolor[2]);
  noFill();
  circle(x, y, radius*2)
}


class RadioButtonHandler {
  constructor(name){//name of the radio options
    this.name = name
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
  constructor(id, normalize=false) {
    this.id = id
    this.element = document.getElementById(this.id)
    this.min = this.element.min
    this.max = this.element.max
    this.normalize = normalize
  }

  get_value() {
    if (this.normalize) {
      return (this.element.value - this.min) / (this.max - this.min)
    } else {
      return this.element.value
    }
  }
}

class dragManager {
  constructor(){
    this.dragging = false
    this.object_idx = -1
    this.objects = []
  }

  push(obj) {
    this.objects.push()
  }

  get_current_object() {
    //returns object that is currently being dragged, -1 if nothing is dragged
    if (this.dragging) {
      return this.objects[this.object_idx]
    } else {
      return -1
    }
    
  }
}