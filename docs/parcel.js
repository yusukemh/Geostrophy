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
        this.dragged = false
        this.dragging_radius = radius //needs this to make dragging smooth in case mouse goes out radius while dragging
    }

    mousePressed() {
        this.dragging_radius = 100000000
        this.diff = new Vector(this.x - mouseX, this.y - mouseY)
    }

    whileDragged(mouseX, mouseY) {
        if (!this.disabled) {
            // let diff = new Vector(this.x - mouseX, this.y - mouseY)
            // console.log(diff)
            this.x = mouseX + this.diff.dx
            this.y = mouseY + this.diff.dy
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
        return sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2) <= this.dragging_radius
    }

    mouseReleased() {
        this.dragging_radius = this.radius
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
}



class Parcel extends MovablePoint {
    constructor(x, y, radius, pressure_field) {
        super(x, y, radius)
        this.pressure_field = pressure_field

        this.v = new Vector(0,0)
        // this.M = 1000//kg
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
            } else if (this.pressure_field.type == 1) {// Anti-cyclone
                var vec = Vector.from_endpoints(this, this.pressure_field.high)
                vec = vec.get_unit().mult(this.v.length ** 2 / vec.length)
            } else if (this.pressure_field.type == 2){//cyclone
                var vec = Vector.from_endpoints(this, this.pressure_field.low)
                vec = vec.get_unit().mult(this.v.length ** 2 / vec.length)
            }
        } else {
            if (this.pressure_field.type == 0) {
                var PG_FACTOR = 30
                var CO_FACTOR = 5
            } else if (this.pressure_field.type == 1) {
                var PG_FACTOR = 30
                var CO_FACTOR = 10
            } else if (this.pressure_field.type == 2) {
                var PG_FACTOR = 30
                var CO_FACTOR = 4
            }
            
            var pgf = this.pressure_field.get_pressure_gradient_unit_vector(this)
            var cof = this.v.rotate(handler_hemisphere.get_selection() * 90)
            var vec = Vector.add(pgf.mult(PG_FACTOR), cof.mult(CO_FACTOR)).mult(dt)
            // vec = Vector.mult(vec, dt)
            this.geostrophic_balance = abs(Math.acos(Vector.inner(pgf,cof)/(pgf.length * cof.length)) * 180 / Math.PI - 180) < EPSILON
        }
        vec = vec.mult(dt)
        this.v = Vector.add(this.v, new Vector(vec.dx, vec.dy))
        this.x += this.v.dx * dt
        this.y += this.v.dy * dt
    }   

    draw() {
        drawCircleWithText(
            "P", this.x, this.y, this.radius, [75, 158, 222], [38, 30, 186])
    }
  }