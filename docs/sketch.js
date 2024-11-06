// H overtake...
//arrows all black.
// deprecate pascal

//parcel.js Line 122, mult(dt) happening twice?

dt = 0.01
EPSILON = 0.1
let traceCanvas;

function setup() {
  img_play = loadImage('icons8-play-50.png');
  img_pause = loadImage('icons8-pause-50.png')
  img_reset = loadImage('icons8-reset-50.png')
  allow_changes = true
  BACKGROUND_COLOR = color(250, 250, 250)
  createCanvas(800, 800);
  background(BACKGROUND_COLOR);
  textAlign(CENTER, CENTER);
  textFont('Roboto Mono');
  setupUI()
  pressure_field_type = handler_pressure_field_type.get_selection()
  
  traceCanvas = createGraphics(800, 800);
  initPressureField(pressure_field_type)
}

function disableSettings() {
  document.getElementById('northern').disabled = true
  document.getElementById('southern').disabled = true
  parcel.disable()
  pressure_field.high.disable()
  pressure_field.low.disable()
}

function enableSettings() {
  document.getElementById('northern').disabled = false
  document.getElementById('southern').disabled = false
  parcel.enable()
  pressure_field.high.enable()
  pressure_field.low.enable()
}

function initPressureField(pressure_field_type) {
  traceCanvas.clear()
  if (pressure_field_type == 0) {// parallel
    pressure_field = new ParallelPressureField(
      new PressurePoint(300, 320, radius=30, pascal=1050, type='high'),
      new PressurePoint(300, 250, radius=30, pascal=995, type='low')
    )
    parcel = new Parcel(50, 350, radius=10, pressure_field)
  } else if (pressure_field_type == 1) {// H in Low
    pressure_field = new AntiCyclonePressureField(
      high = new PressurePoint(350, 250, radius=30, pascal=1050, type='high')
    )
    parcel = new Parcel(400, 250, radius=10, pressure_field)
  } else if (pressure_field_type == 2) {
    pressure_field = new CyclonePressureField(
      low = new PressurePoint(300, 320, radius=30, pascal=995, type='low')
    )
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

  // check stuff that can potentially be disabled
  checklist = [pressure_field.high, pressure_field.low, parcel]
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

function draw() {
  background(BACKGROUND_COLOR)
  // init pressure field once new selection is made
  if (handler_pressure_field_type.get_selection() != pressure_field.type) {
    initPressureField(handler_pressure_field_type.get_selection())
  }
  handle_cursor()
  if (pressure_field != 0) {
    pressure_field.draw()
  }

  if (!HALT) {
    // console.log(int(handler_play_speed.get_value() / 10))
    for (let i = 0; i <= int(handler_play_speed.get_value() / 10); i++) {
      parcel.update()
    }
  }

  //trace
  if (!parcel.dragged){
    traceCanvas.noFill();
    traceCanvas.stroke(245, 135, 66)
    traceCanvas.strokeWeight(5);
    traceCanvas.circle(parcel.x, parcel.y, .1,.1)
  }
  if (handler_trace.is_checked()){
    imageMode(CORNER)
    image(traceCanvas, 0, 0);
  }
  // arrows
  arrow_scale = handler_arrow_scale.get_value()
  pgf = pressure_field.get_pressure_gradient_unit_vector(parcel).mult(arrow_scale * 100)
  
  if (handler_pgf.is_checked()){//pgf
    pgf.draw_from(parcel, rgb=[238, 137, 128], parcel.radius, label='PGF')
  }
  if (handler_corioli.is_checked()){// corioli
    angle = Math.acos(Vector.inner(pgf, parcel.v) / (pgf.length * parcel.v.length)) * 180 / Math.PI
    parcel.v.get_unit().rotate(
      handler_hemisphere.get_selection() * 90)
    .mult(pgf.length * (angle / 90))
    .draw_from(parcel, rgb=[140, 217, 129], parcel.radius, 'CF')
    // .draw_from(parcel, rgb=[255, 255, 255], parcel.radius, 'CF')
  }
  if (handler_velocity.is_checked()) {// velocity vector
    parcel.v.get_unit().mult(parcel.v.length * arrow_scale * 20).draw_from(parcel, [118, 118, 228], parcel.radius, 'V')
  }
  parcel.draw()
  reset_button.draw()
  playbutton.draw()
}

function mouseDragged() {
  if (pressure_field.high.mouse_on(mouseX, mouseY)) {
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

  if (pressure_field.high.mouse_on(mouseX, mouseY)) {
    pressure_field.high.mousePressed(mouseX, mouseY)
  }

  if (pressure_field.low.mouse_on(mouseX, mouseY)) {
    pressure_field.low.mousePressed(mouseX, mouseY)
  }

  if (parcel.mouse_on(mouseX, mouseY)) {
    traceCanvas.clear()
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
    stroke(rgb[0], rgb[1], rgb[2])
    strokeWeight(3)
    let offset_vec = this.get_unit().mult(offset)
    noFill()
    let tip = new Point(point.x + this.dx + offset_vec.dx, point.y + this.dy + offset_vec.dy)
    line(point.x + offset_vec.dx, point.y + offset_vec.dy, tip.x, tip.y)
    let wing_1 = this.get_unit().mult(0.2 * this.length).rotate(150)
    line(tip.x, tip.y, tip.x + wing_1.dx, tip.y + wing_1.dy)
    let wing_2 = this.get_unit().mult(0.2 * this.length).rotate(-150)
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
  handler_play_speed = new SliderHandler('play_speed', normalize=false)

  reset_button = new Button(10, 10, 100, 30, img_reset)
  reset_button.draw()
  playbutton = new ToggleButton(120, 10, 80, 30, options=[img_play, img_pause])
  playbutton.draw()
}