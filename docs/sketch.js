//pgf length does not change, parcel dragging wonky
// restart should only reset the parcel, not the whole thing...
// H overtake...
//parcel.js Line 122, mult(dt) happening twice?


dt = 0.01
KM_PER_PIXEL = 0.00001
EPSILON = 0.1
ARROW_SCALE = 50

// 0: parallel, 1: H in L, 2: L in H
hp = 0
lp = 0
parcel_start_x = 0
parcel_start_y = 0

function setup() {
  BACKGROUND_COLOR = color(167, 247, 141)
  createCanvas(1000, 1000);
  background(BACKGROUND_COLOR);
  textAlign(CENTER, CENTER);
  textFont('Roboto Mono');
  setupUI()

  pressure_field_type = handler_pressure_field_type.get_selection()
  initPressureField(pressure_field_type)
}

function initPressureField(pressure_field_type) {
  if (pressure_field_type == 0) {// parallel
    hp = new PressurePoint(250, 250, radius=30, pascal=1050, type='high')
    lp = new PressurePoint(300, 320, radius=30, pascal=995, type='low')
    pressure_field = new PressureField(hp, lp, type=pressure_field_type)
    // parcel = new Parcel(50, 50, radius=20, pressure_field)
  } else if (pressure_field_type == 1) {// H in Low
    hp = new PressurePoint(250, 250, radius=30, pascal=1050, type='high')
    lp = new PressurePoint(300, 320, radius=0, pascal=995, type='low')
    pressure_field = new PressureField(hp, lp, type=pressure_field_type)
    // parcel = new Parcel(50, 50, radius=20, pressure_field)
  } else if (pressure_field_type == 2) {
    hp = new PressurePoint(250, 250, radius=0, pascal=1050, type='high')
    lp = new PressurePoint(300, 320, radius=30, pascal=995, type='low')// radius 0 to prevent drag overtake by H
    pressure_field = new PressureField(hp, lp, type=pressure_field_type)
  }
  parcel = new Parcel(50, 50, radius=10, pressure_field)
  HALT = true
}

function draw() {
  background(BACKGROUND_COLOR)
  reset_button.draw()
  playbutton.draw()
  // init pressure field once new selection is made
  if (handler_pressure_field_type.get_selection() != pressure_field.type) {
    initPressureField(handler_pressure_field_type.get_selection())
  }

  if (pressure_field != 0) {
    pressure_field.draw()
  }

  if (!HALT) {
    parcel.update()
  }

  pgf = pressure_field.get_pressure_gradient_force(parcel)
  arrow_scale = handler_arrow_scale.get_value()
  
  if (handler_pgf.is_checked()){//pgf
    pgf.get_unit().mult(arrow_scale).draw_from(parcel, rgb=[38, 37, 128], parcel.radius, 'PGF')
  }
  if (handler_corioli.is_checked()){// corioli
    angle = Math.acos(Vector.inner(pgf, parcel.v) / (pgf.length * parcel.v.length)) * 180 / Math.PI
    parcel.v.get_unit().get_perp().mult(arrow_scale * (angle / 90)).draw_from(parcel, rgb=[140, 17, 29], parcel.radius, 'CF')
  }
  if (handler_velocity.is_checked()) {// velocity vector
    parcel.v.get_unit().mult(parcel.v.length * arrow_scale * 0.04).draw_from(parcel, [18, 18, 28], parcel.radius, 'V')
  }
  parcel.draw()
}

function mouseDragged() {
  if (pressure_field.high.mouse_on(mouseX, mouseY)) {
    pressure_field.high.whileDragged(mouseX, mouseY)
  } else if (pressure_field.low.mouse_on(mouseX, mouseY)) {
    pressure_field.low.whileDragged(mouseX, mouseY)
  } else if (parcel.mouse_on(mouseX, mouseY)) {
    parcel.whileDragged(mouseX, mouseY)
  } else {
  }
}

function mouseReleased() {
  if (typeof pressure_field !== 'undefined') {
    pressure_field.high.mouseReleased()
    pressure_field.low.mouseReleased()
  }
}

function mousePressed() {
  if (! inRect([0,0,width, height], mouseX, mouseY)) {
    // if outside
    return
  }
  if (playbutton.is_on(mouseX, mouseY)) {
    //if play button pushed
    playbutton.mousePressed()
    HALT = !HALT
    return
  }
  if (reset_button.is_on(mouseX, mouseY)) {
    setup()
    return
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

  get_perp() {
    return new Vector(-this.dy, this.dx)// if northern hemisphere
    return new Vector(this.dy, -this.dx)// if southern hemisphere
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
  handler_arrow_scale = new SliderHandler('arrow_scale')
  handler_pg_magnitude = new SliderHandler('pg_magnitude')

  reset_button = new Button(10, 10, 100, 30, 'Restart')
  reset_button.draw()
  playbutton = new ToggleButton(120, 10, 80, 30, options=['>', '||'])
  playbutton.draw()
}