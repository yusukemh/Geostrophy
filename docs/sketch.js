//global variables
let pressure_field;

function setup() {
    img_play = loadImage('icons8-play-50.png');
    img_pause = loadImage('icons8-pause-50.png')
    img_reset = loadImage('icons8-reset-50.png')
    BACKGROUND_COLOR = color(250, 250, 250)
    setupUI()
    createCanvas(500,500)

    pressure_field = new ParallelPressureField(
        high = new PressurePoint(300, 320, radius=0, pascal=1050, type='high'),
        low = new PressurePoint(300, 250, radius=0, pascal=990, type='low')
    )

    parcel = new Parcel(50, 350, pressure_field)
}
  

function draw() {
    background(BACKGROUND_COLOR)
    handle_cursor()
    pressure_field.update()
    pressure_field.draw()
    parcel.update()
    parcel.draw()

    this.parcel.pgf.mult(0.00001).draw_from(parcel, rgb=[38, 37, 128], parcel.radius, label='PGF')
    this.parcel.cof.mult(0.00001).draw_from(parcel, rgb=[140, 17, 29], parcel.radius, 'CF')
    this.parcel.v.draw_from(parcel, [18, 18, 28], parcel.radius, 'V')
    // for (let i=0;i<100;i++){
    //     parcel.update()
    // }

    // console.log(pressure_field.get_pressure_gradient_vector())
}

function mousePressed() {
    pressure_field.high.mousePressed()
    pressure_field.low.mousePressed()
    parcel.mousePressed()
}

function mouseReleased() {
    pressure_field.high.mouseReleased()
    pressure_field.low.mouseReleased()
    parcel.mouseReleased()
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


function handle_cursor() {
    //check buttons
    // checklist = [playbutton, reset_button]
    // for (let i=0;i<checklist.length;i++) {
    //     if (checklist[i].mouse_on(mouseX, mouseY)) {
    //         cursor(HAND)
    //     return
    //     } else {
    //     cursor(ARROW)
    //     }
    // }

    //MovablePoints, unless disabled
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