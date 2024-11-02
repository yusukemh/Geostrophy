// FIELD_TYPE = 1
dt = 0.01
KM_PER_PIXEL = 0.00001
EPSILON = 0.1
ARROW_SCALE = 50
HALT = true
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
  // var dashboard = createCanvas(1000, 800)

  // button_params = [10, 10, 80, 30]
  // drawButton(button_params);
  hp = 0
  lp = 0
  parcel = 0
  setupUI()
}

function draw() {
  if (HALT) {return}
  background(BACKGROUND_COLOR)
  reset_button.draw()
  stop_button.draw()
  start_button.draw()
  restart_button.draw()

  if (parcel != 0){
    pressure_field.draw()
    parcel.update()

    pgf = pressure_field.get_pressure_gradient_force(parcel)
    arrow_scale = handler_arrow_scale.get_value()
    
    if (handler_pgf.is_checked()){//pgf
      Vector.mult(pgf.get_unit(), arrow_scale).draw_from(parcel, rgb=[38, 37, 128])
    }
    if (handler_corioli.is_checked()){// corioli
      angle = Math.acos(Vector.inner(pgf, parcel.v) / (pgf.length * parcel.v.length)) * 180 / Math.PI
      Vector.mult(
        parcel.v.get_unit().get_perp(), arrow_scale * (angle / 90)
      ).draw_from(parcel, rgb=[140, 17, 29])
    }
    if (handler_velocity.is_checked()) {// velocity vector
      Vector.mult(parcel.v.get_unit(), parcel.v.length * arrow_scale * 0.04).draw_from(parcel, [18, 18, 28])
    }
    stroke(0,0,0)
    fill(0)
    circle(parcel.x, parcel.y, 3)
  }
}

function mouseDragged() {
  if (pressure_field.high.mouse_on(mouseX, mouseY)) {
    pressure_field.high.whileDragged(mouseX, mouseY)
  } else if (pressure_field.low.mouse_on(mouseX, mouseY)) {
    pressure_field.low.whileDragged(mouseX, mouseY)
  }
  // circle(mouseX, mouseY, 30)
}

function mouseReleased() {
  if (typeof pressure_field !== 'undefined') {
    pressure_field.high.mouseReleased()
    pressure_field.low.mouseReleased()
  }
}

function mousePressed() {
  // if (inRect(rect_params=button_params, mouseX, mouseY)) {
  //   clear()
  //   setup()
  //   return
  // }
  if (reset_button.is_on(mouseX, mouseY)) {
    // clear()
    HALT = true
    setup()
    return
  }
  if (stop_button.is_on(mouseX, mouseY)) {
    HALT = true
    return
  }
  if (start_button.is_on(mouseX, mouseY)) {
    HALT = false
    return
  }
  if (restart_button.is_on(mouseX, mouseY)) {
    HALT = false
    parcel = new Parcel(parcel_start_x, parcel_start_y, pressure_field)
    return
  }
  if (! inRect([0,0,width, height], mouseX, mouseY)) {
    return
  }
  if (hp == 0) {
    hp = new PressurePoint(mouseX, mouseY, radius=40, pascal=1050, type='high')
    hp.draw()
    return
  }
  if (lp == 0) {
    lp = new PressurePoint(mouseX, mouseY, radius=40, pascal=995, type='low')
    lp.draw()
    pressure_field = new PressureField(hp, lp, type=handler_pressure_field_type.get_selection())
    // drawParallelIsobar()
    drawIsobar(pressure_field)
    return
  }
  if (parcel == 0) {
  // if (true) {
    // drawCircleWithText("p", mouseX, mouseY, 20)
    parcel = new Parcel(mouseX, mouseY, pressure_field)
    parcel_start_x = mouseX
    parcel_start_y = mouseY
    HALT = false
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

  draw_from(point, rgb=[0,0,0]) {
    // stroke(110, 110, 110);
    stroke(rgb[0], rgb[1], rgb[2])
    strokeWeight(2)
    let tip = new Point(point.x + this.dx, point.y + this.dy)
    line(point.x, point.y, tip.x, tip.y)
    let wing_1 = Vector.mult(this.get_unit(), 0.1 * this.length).rotate(150)
    line(tip.x, tip.y, tip.x + wing_1.dx, tip.y + wing_1.dy)
    let wing_2 = Vector.mult(this.get_unit(), 0.1 * this.length).rotate(-150)
    line(tip.x, tip.y, tip.x + wing_2.dx, tip.y + wing_2.dy)
  }

  static mult(vector, scaler) {
    return new Vector(vector.dx * scaler, vector.dy * scaler)
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
  handler_velocity = new CheckBoxHandler('velocity')
  handler_pgf = new CheckBoxHandler('pgf')
  handler_corioli = new CheckBoxHandler('corioli')
  handler_friction = new CheckBoxHandler('friction')
  handler_arrow_scale = new SliderHandler('arrow_scale')
  // console.log(handler_velocity.is_checked())

  reset_button = new Button(10, 10, 100, 30, 'Clear All')
  reset_button.draw()
  start_button = new Button(120, 10, 80, 30, 'start')
  start_button.draw()
  stop_button = new Button(210, 10, 80, 30, 'stop')
  stop_button.draw()
  restart_button = new Button(300, 10, 80, 30, 'Restart')
  restart_button.draw()
}