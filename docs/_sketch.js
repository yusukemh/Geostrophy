// H overtake...
//pgf changes length when moving L
//arrows all black.

//parcel.js Line 122, mult(dt) happening twice?

dt = 0.01
KM_PER_PIXEL = 1
EPSILON = 0.1
ARROW_SCALE = 50

let x = 200;
let y = 200;
let traceCanvas;

// function _setup() {
//   img_play = loadImage('icons8-play-50.png');
//   img_pause = loadImage('icons8-pause-50.png')
//   img_reset = loadImage('icons8-reset-50.png')
//   allow_changes = true
//   // BACKGROUND_COLOR = color(167, 247, 141)
//   BACKGROUND_COLOR = color(250, 250, 250)
//   createCanvas(500, 500);
//   background(BACKGROUND_COLOR);
//   textAlign(CENTER, CENTER);
//   textFont('Roboto Mono');
//   setupUI()
//   pressure_field_type = handler_pressure_field_type.get_selection()
  
//   traceCanvas = createGraphics(400, 400);
//   initPressureField(pressure_field_type)
// }

function setup() {
  img_play = loadImage('icons8-play-50.png');
  img_pause = loadImage('icons8-pause-50.png')
  img_reset = loadImage('icons8-reset-50.png')
  BACKGROUND_COLOR = color(250, 250, 250)
  setupUI()
}

function draw() {
  background(BACKGROUND_COLOR)
  let pressure_field = new ParallelPressureField(
    high = new PressurePoint(300, 320, radius=30, pascal=1050, type='high'),
    low = new PressurePoint(300, 250, radius=30, pascal=990, type='low')
  )
  handle_cursor()
  pressure_field.update()
  pressure_field.draw()
}

function disableSettings() {
  document.getElementById('northern').disabled = true
  document.getElementById('southern').disabled = true
  parcel.disable()
  hp.disable()
  lp.disable()
}

function enableSettings() {
  document.getElementById('northern').disabled = false
  document.getElementById('southern').disabled = false
  parcel.enable()
  hp.enable()
  lp.enable()
}

function initPressureField(pressure_field_type) {
  traceCanvas.clear()
  if (pressure_field_type == 0) {// parallel
    hp = new PressurePoint(300, 320, radius=30, pascal=1050, type='high')
    lp = new PressurePoint(300, 250, radius=30, pascal=990, type='low')
    pressure_field = new PressureField(hp, lp, type=pressure_field_type)
    parcel = new Parcel(50, 350, radius=10, pressure_field)
  } else if (pressure_field_type == 1) {// H in Low
    hp = new PressurePoint(350, 250, radius=30, pascal=1025, type='high')
    lp = new PressurePoint(300, 320, radius=0, pascal=990, type='low')
    pressure_field = new PressureField(hp, lp, type=pressure_field_type)
    parcel = new Parcel(400, 250, radius=10, pressure_field)
  } else if (pressure_field_type == 2) {
    hp = new PressurePoint(250, 250, radius=0, pascal=1025, type='high')
    lp = new PressurePoint(300, 320, radius=30, pascal=990, type='low')// radius 0 to prevent drag overtake by H
    pressure_field = new PressureField(hp, lp, type=pressure_field_type)
    parcel = new Parcel(50, 350, radius=10, pressure_field)
  }
  HALT = true
  playbutton.default()
  enableSettings()
}

function handle_cursor() {
  //check buttons
  checklist = [playbutton, reset_button]
  for (let i=0;i<checklist.length;i++) {
    if (checklist[i].mouse_on(mouseX, mouseY)) {
        cursor(HAND)
      return
    } else {
      cursor(ARROW)
    }
  }

  // MovablePoints, unless disabled
  checklist = [hp, lp, parcel]
  for (let i=0;i<checklist.length;i++) {
    if (checklist[i].mouse_on(mouseX, mouseY)) {
      if (!checklist[i].disabled) {
        cursor(HAND)
      }
      return
    } else {
      cursor(ARROW)
    }
  }
}

function _draw() {
  background(BACKGROUND_COLOR)
  // init pressure field once new selection is made
  if (handler_pressure_field_type.get_selection() != pressure_field.type) {
    initPressureField(handler_pressure_field_type.get_selection())
  }
  pressure_field.update()
  handle_cursor()
  if (pressure_field != 0) {
    pressure_field.draw()
  }

  if (!HALT) {
    parcel.update()
  }

  arrow_scale = handler_arrow_scale.get_value()
  pgf = pressure_field.get_pressure_gradient_force(parcel).mult(arrow_scale * 0.1)
  
  if (handler_pgf.is_checked()){//pgf
    // pgf.mult(arrow_scale * 0.03).draw_from(parcel, rgb=[38, 37, 128], parcel.radius, 'PGF')
    pgf.draw_from(parcel, rgb=[38, 37, 128], parcel.radius, label='PGF')
  }
  if (handler_corioli.is_checked()){// corioli
    angle = Math.acos(Vector.inner(pgf, parcel.v) / (pgf.length * parcel.v.length)) * 180 / Math.PI
    parcel.v.get_unit().rotate(
      handler_hemisphere.get_selection() * 90)
    .mult(pgf.length * (angle / 90))
    .draw_from(parcel, rgb=[140, 17, 29], parcel.radius, 'CF')
  }
  if (handler_velocity.is_checked()) {// velocity vector
    parcel.v.get_unit().mult(parcel.v.length * arrow_scale * 5).draw_from(parcel, [18, 18, 28], parcel.radius, 'V')
  }
  //trace
  if (!parcel.dragged){
    traceCanvas.noFill();
    traceCanvas.stroke(255,5,43)
    traceCanvas.strokeWeight(1);
    traceCanvas.circle(parcel.x, parcel.y, .1,.1)
  }
  if (handler_trace.is_checked()){
    imageMode(CORNER)
    image(traceCanvas, 0, 0);
  }
  parcel.draw()
  // fill(88, 245, 117)
  // strokeWeight(0)
  // rect(0,0,210,50)
  reset_button.draw()
  playbutton.draw()
}

function mouseDragged() {
  if (pressure_field.high.mouse_on(mouseX, mouseY)) {
    // console.log(pressure_field.high.disabled)
    pressure_field.high.whileDragged(mouseX, mouseY)
  } else if (pressure_field.low.mouse_on(mouseX, mouseY)) {
    pressure_field.low.whileDragged(mouseX, mouseY)
  } else if (parcel.mouse_on(mouseX, mouseY)) {
    parcel.whileDragged(mouseX, mouseY)
  }
}

function mouseReleased() {
  pressure_field.high.mouseReleased()
  pressure_field.low.mouseReleased()
  parcel.mouseReleased()
}

function mousePressed() {
  if (! inRect([0,0,width, height], mouseX, mouseY)) {
    // if outside
    return
  }
  if (playbutton.mouse_on(mouseX, mouseY)) {
    //if play button pushed
    playbutton.mousePressed()
    if (HALT) {//if currently stopped then commit
      parcel.commit_location(parcel.x, parcel.y)
    }
    HALT = !HALT
    disableSettings()
    return
  }
  if (reset_button.mouse_on(mouseX, mouseY)) {
    // setup()
    traceCanvas.clear()
    parcel.reset()
    if (HALT) {
      enableSettings()
    }
    return
  }

  if (hp.mouse_on(mouseX, mouseY)) {
    hp.mousePressed(mouseX, mouseY)
  }

  if (lp.mouse_on(mouseX, mouseY)) {
    lp.mousePressed(mouseX, mouseY)
  }

  if (parcel.mouse_on(mouseX, mouseY)) {
    parcel.mousePressed(mouseX, mouseY)
  }
}

class Vector {
  constructor(dx, dy) {
    this.dx = dx
    this.dy = dy
    this.length = sqrt(dx ** 2 + dy ** 2)
  }

  static from_endpoints(point_a, point_b) {
    return new Vector(point_b.x - point_a.x, point_b.y - point_a.y)
  }

  draw_from(point, rgb=[0,0,0], offset=0, label='') {
    // stroke(110, 110, 110);
    stroke(rgb[0], rgb[1], rgb[2])
    strokeWeight(2)
    let offset_vec = this.get_unit().mult(offset)
    // console.log(offset_vec.length)
    let tip = new Point(point.x + this.dx + offset_vec.dx, point.y + this.dy + offset_vec.dy)
    // let tip = new Point(point.x + this.dx, point.y + this.dy)
    line(point.x + offset_vec.dx, point.y + offset_vec.dy, tip.x, tip.y)
    let wing_1 = this.get_unit().mult(0.1 * this.length).rotate(150)
    line(tip.x, tip.y, tip.x + wing_1.dx, tip.y + wing_1.dy)
    let wing_2 = this.get_unit().mult(0.1 * this.length).rotate(-150)
    line(tip.x, tip.y, tip.x + wing_2.dx, tip.y + wing_2.dy)
    if (label != '') {
      fill(0);
      textSize(15);
      strokeWeight(0);
      textFont('Roboto Mono');
      let margin = this.get_unit().mult(15)
      text(label, tip.x + margin.dx, tip.y + margin.dy)
    }
  }

  mult(scaler) {
    return new Vector(this.dx * scaler, this.dy * scaler)
  }

  static add(vec_a, vec_b) {
    return new Vector(
      vec_a.dx + vec_b.dx,
      vec_a.dy + vec_b.dy
    )
  }

  static inner(vec_a, vec_b) {
    return vec_a.dx * vec_b.dx + vec_a.dy * vec_b.dy
  }

  get_unit() {
    return new Vector(this.dx / this.length, this.dy / this.length)
  }

  rotate(degrees) {
    let rad = degrees * Math.PI / 180
    return new Vector(
      this.dx * cos(rad) - this.dy * sin(rad), this.dx * sin(rad) + this.dy * cos(rad)
    )
  }
  
}







function setupUI() {
  handler_pressure_field_type = new RadioButtonHandler('pressure_field_type')
  handler_hemisphere = new RadioButtonHandler('hemisphere')
  handler_velocity = new CheckBoxHandler('velocity')
  handler_pgf = new CheckBoxHandler('pgf')
  handler_corioli = new CheckBoxHandler('corioli')
  handler_friction = new CheckBoxHandler('friction')
  handler_trace = new CheckBoxHandler('trace')
  handler_arrow_scale = new SliderHandler('arrow_scale', normalize=true)
  // handler_pg_magnitude = new SliderHandler('pg_magnitude', normalize=true)
  handler_hpascal = new SliderHandler('high_pascal', normalize=false)
  handler_lpascal = new SliderHandler('low_pascal', normalize=false)

  reset_button = new Button(10, 10, 100, 30, img_reset)
  reset_button.draw()
  playbutton = new ToggleButton(120, 10, 80, 30, options=[img_play, img_pause])
  playbutton.draw()
}