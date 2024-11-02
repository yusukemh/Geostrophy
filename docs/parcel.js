// PG_FACTOR = 1
CO_FACTOR = 100

class PressureField {
    constructor(high_pressure, low_pressure, type) {
        this.high = high_pressure
        this.low = low_pressure
        this.type = type
        if (type == 0) {
        } else if (type == 1) {
        } else if (type == 2) {
        } else {
            console.log('unexpected type on constructing PressureField', type)
        }
    }

    get_pressure_gradient_force(point) {
        // return Vector
        var pressure_difference = 100 * (this.high.pascal - this.low.pascal)//Pa
        var distance = Point.dist(this.high, this.low) * KM_PER_PIXEL * 1000// m
        var pgf_magnitude = pressure_difference / distance * handler_pg_magnitude.get_value() * 0.3//Pa.m-1
        if (this.type == 0) {
            var pgf_vec = Vector.from_endpoints(this.high, this.low)
        } else if (this.type == 1){//H in L
            var pgf_vec = Vector.from_endpoints(this.high, point)
        } else if (this.type == 2) {//L in H
            var pgf_vec = Vector.from_endpoints(point, this.low)
        }
        // pgf_magnitude *= PG_FACTOR
        return pgf_vec.mult(pgf_magnitude / pgf_vec.length)
    }

    draw() {
        drawIsobar(this)
    }
}

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
    constructor(x, y, radius) {
        super(x, y)
        this.default_radius = radius// needs this to make radius temporalily bigger only during drag
        this.radius = radius
        this.disabled = false
    }

    whileDragged(mouseX, mouseY) {
        if (!this.disabled) {
            this.x = mouseX
            this.y = mouseY
            this.radius = this.default_radius * 1.1
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
        return sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2) <= this.radius
    }

    mouseReleased() {
        this.radius = this.default_radius
        this.dragged = false
    }
}

class PressurePoint extends MovablePoint {
    constructor(x, y, radius, pascal, type) {
        super(x, y, radius)
        this.pascal = pascal
        this.type = type// high or low
    }

    draw() {
        if (this.type == 'high') {
            drawCircleWithText("H", this.x, this.y, this.radius, [242, 136, 70], [235, 64, 52])
        } else if (this.type == 'low') {
            drawCircleWithText("L", this.x, this.y, this.radius, [124, 173, 252], [90, 13, 222])
        } else {
            console.log("unknown type", this.type)
        }
    }
}



class Parcel extends MovablePoint {
    constructor(x, y, radius, pressure_field) {
        super(x, y, radius)
        this.pressure_field = pressure_field

        this.v = new Vector(0,0)
        this.M = 1000//kg
        this.geostrophic_balance = false

        this.init_x = x
        this.init_y = y
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
        if (this.geostrophic_balance) {
            if (this.pressure_field.type == 0) {//parallel
                var vec = new Vector(0,0)
            } else if (this.pressure_field.type == 1) {//H in L
                var vec = Vector.from_endpoints(this, this.pressure_field.high)
                vec = vec.get_unit().mult(this.v.length ** 2 / vec.length)
            } else if (this.pressure_field.type == 2) {//L in H
                var vec = Vector.from_endpoints(this, this.pressure_field.low)
                vec = vec.get_unit().mult(this.v.length ** 2 / vec.length)
            }
        } else {
            var pgf = this.pressure_field.get_pressure_gradient_force(this)
            var cof = this.corioli()
            vec = Vector.add(pgf, cof).mult(dt)
            // vec = Vector.mult(vec, dt)
            this.geostrophic_balance = abs(Math.acos(Vector.inner(pgf,cof)/(pgf.length * cof.length)) * 180 / Math.PI - 180) < EPSILON
        }
        vec = vec.mult(dt)//??
        this.v = Vector.add(this.v, new Vector(vec.dx, vec.dy))
        this.x += this.v.dx * dt
        this.y += this.v.dy * dt
    }

    corioli() {
        // return Vector.mult(this.v.get_perp(), CO_FACTOR)
        var mult_factor = 2 * this.M * (7.27 / 100000 * sqrt(45)/2) * CO_FACTOR

        // if (handler_hemisphere.get_selection() == 0) {//northern
        //     return this.v.rotate(90).mult(mult_factor)
        // } else { //southern
        //     return this.v.rotate(-90).mult(mult_factor)
        // }

        
        return this.v.rotate(handler_hemisphere.get_selection() * 90).mult(mult_factor)
        
    }

    draw() {
        drawCircleWithText(
            "P", this.x, this.y, this.radius, [75, 158, 222], [38, 30, 186])
    }
  }