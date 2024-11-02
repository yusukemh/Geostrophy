PG_FACTOR = 1
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
        var pgf_magnitude = pressure_difference / distance //Pa.m-1
        
        if (this.type == 0) {
            var pgf_vec = Vector.from_endpoints(this.high, this.low)
        } else if (this.type == 1){//H in L
            var pgf_vec = Vector.from_endpoints(this.high, point)
        } else if (this.type == 2) {//L in H
            var pgf_vec = Vector.from_endpoints(point, this.low)
        }
        pgf_magnitude *= PG_FACTOR
        return Vector.mult(pgf_vec, pgf_magnitude / pgf_vec.length)
    }

    draw() {
        drawIsobar(this)
    }
}

class PressurePoint extends Point {
    constructor(x, y, pascal, type) {
        super(x, y)
        this.pascal = pascal
        this.type = type
    }

    draw() {
        if (this.type == 'H') {
            drawCircleWithText("H", this.x, this.y, 40, [235, 64, 52])
        } else if (this.type == "L") {
            drawCircleWithText("L", this.x, this.y, 40, [90, 13, 222])
        } else {
            console.log("unknown type", this.type)
        }
    }
}



class Parcel extends Point {
    constructor(x, y, pressure_field) {
        super(x, y)
        this.pressure_field = pressure_field

        this.v = new Vector(0,0)
        this.M = 1000//kg
        this.geostrophic_balance = false
    }

    update() {
        if (this.geostrophic_balance) {
            if (this.pressure_field.type == 0) {//parallel
                var vec = new Vector(0,0)
            } else if (this.pressure_field.type == 1) {//H in L
                var vec = Vector.from_endpoints(this, this.pressure_field.high)
                vec = Vector.mult(vec.get_unit(), this.v.length ** 2 / vec.length)
            } else if (this.pressure_field.type == 2) {//L in H
                var vec = Vector.from_endpoints(this, this.pressure_field.low)
                vec = Vector.mult(vec.get_unit(), this.v.length ** 2 / vec.length)
            }
        } else {
            var pgf = this.pressure_field.get_pressure_gradient_force(this)
            var cof = this.corioli()
            vec = Vector.add(pgf, cof)
            vec = Vector.mult(vec, dt)
            this.geostrophic_balance = abs(Math.acos(Vector.inner(pgf,cof)/(pgf.length * cof.length)) * 180 / Math.PI - 180) < EPSILON
        }
        vec = Vector.mult(vec, dt)
        this.v = Vector.add(this.v, new Vector(vec.dx, vec.dy))
        this.x += this.v.dx * dt
        this.y += this.v.dy * dt
    }

    corioli() {
        // return Vector.mult(this.v.get_perp(), CO_FACTOR)
        var mult_factor = 2 * this.M * (7.27 / 100000 * sqrt(45)/2) * CO_FACTOR
        return Vector.mult(this.v.get_perp(), mult_factor)
    }
  }