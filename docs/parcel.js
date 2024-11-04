// PG_FACTOR = 1
CO_FACTOR = 100

class Point {
    constructor(x, y) {
      this.x = x
      this.y = y
    }
    static dist(point_a, point_b) {
      return sqrt((point_a.x - point_b.x) ** 2 + (point_a.y - point_b.y) ** 2)
    }
  }
  

class MovablePoint extends Point {
    constructor(x, y, drawing_radius) {
        super(x, y)
        this.default_drawing_radius = drawing_radius// needs this to make radius temporalily bigger only during drag
        this.drawing_radius = drawing_radius
        this.disabled = false
        this.dragged = false
        this.dragging_radius = drawing_radius //need this to make dragging smooth in case mouse goes out radius while dragging
    }

    mousePressed() {
        if (!this.mouse_on(mouseX, mouseY)) {return}
        this.dragging_radius = 100000000
        this.diff = new Vector(this.x - mouseX, this.y - mouseY)
    }

    whileDragged(mouseX, mouseY) {
        if (!this.disabled) {
            // let diff = new Vector(this.x - mouseX, this.y - mouseY)
            // console.log(diff)
            this.x = mouseX + this.diff.dx
            this.y = mouseY + this.diff.dy
            this.drawing_radius = this.default_drawing_radius * 1.1
            this.dragged = true
        }
    }

    disable() {
        this.disabled = true
    }

    enable() {
        this.disabled = false
    }

    mouse_on(mouseX, mouseY) {
        return sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2) <= this.dragging_radius
    }

    mouseReleased() {
        if (!this.mouse_on(mouseX, mouseY)) {return}
        this.dragging_radius = this.default_drawing_radius
        this.drawing_radius = this.default_drawing_radius
        this.dragged = false
    }
}

class PressurePoint extends MovablePoint {
    constructor(x, y, radius, pascal, type) {
        super(x, y, PRESSURE_POINT_DRAWING_RADIUS)
        this.radius = radius
        this.pascal = pascal
        this.type = type// high or low
    }

}



class Parcel extends MovablePoint {
    constructor(x, y, pressure_field) {
        super(x, y, 10)
        this.pressure_field = pressure_field

        this.v = new Vector(0,0)
        this.M = 1200000000//kg, rho=1.2kg/m^3
        this.volume = 1000000000//m^3 1km, 1km, 1km
        this.geostrophic_balance = false

        this.init_x = x
        this.init_y = y

        this.pgf = this.pressure_field.get_pressure_gradient_vector().mult(this.volume)
        this.cof = this.corioli()
    }

    commit_location(x, y) {
        this.init_x = x
        this.init_y = y
    }

    reset() {
        this.x = this.init_x
        this.y = this.init_y
        this.v = new Vector(0,0)
        this.geostrophic_balance = false
        this.pressure_field = pressure_field
    }

    update() {
        this.pgf = this.pressure_field.get_pressure_gradient_vector().mult(this.volume)
        this.cof = this.corioli()
        // console.log(cof)
        let vec = Vector.add(this.pgf, this.cof)// vector, in Neuton
        // F = ma => a=F/m
        let acc = vec.mult(1/this.M)
        this.v = Vector.add(this.v, acc.mult(dt))
        this.x += this.v.dx * dt
        this.y += this.v.dy * dt
        console.log(this.x)


        // console.log(pgf)
        // if (this.geostrophic_balance) {
        //     if (this.pressure_field.type == 0) {//parallel
        //         var vec = new Vector(0,0)
        //     } else if (this.pressure_field.type == 1) {//H in L
        //         var vec = Vector.from_endpoints(this, this.pressure_field.high)
        //         vec = vec.get_unit().mult(this.v.length ** 2 / vec.length)
        //     } else if (this.pressure_field.type == 2) {//L in H
        //         var vec = Vector.from_endpoints(this, this.pressure_field.low)
        //         vec = vec.get_unit().mult(this.v.length ** 2 / vec.length)
        //     }
        // } else {
        //     var pgf = this.pressure_field.get_pressure_gradient_force(this)
        //     var cof = this.corioli()
        //     vec = Vector.add(pgf, cof).mult(dt)
        //     // vec = Vector.mult(vec, dt)
        //     this.geostrophic_balance = abs(Math.acos(Vector.inner(pgf,cof)/(pgf.length * cof.length)) * 180 / Math.PI - 180) < EPSILON
        // }
        // vec = vec.mult(dt)//??
        // this.v = Vector.add(this.v, new Vector(vec.dx, vec.dy))
        // this.x += this.v.dx * dt
        // this.y += this.v.dy * dt
    }

    corioli() {
        var mult_factor = 2 * this.M * (7.27 / 100000) * sin(45 * Math.PI / 180)// * CO_FACTOR
        return this.v.rotate(handler_hemisphere.get_selection() * 90).mult(mult_factor)
        
    }

    draw() {
        drawCircleWithText(
            "P", this.x, this.y, 10, [75, 158, 222], [38, 30, 186])
    }
  }