class ParallelPressureField {
    constructor(high, low, hemisphere) {
        this.high = high
        this.low = low
        this.type = 0//0: parallel, 1: anti-cyclone, 2: cyclone
        this.hemisphere = hemisphere //1 if northern hemisphere, -1 if southern.
    }

    get_pressure_gradient_unit_vector(point) {// does not depend on point but accepts if for consistency with other PressureFields
        return Vector.from_endpoints(this.high, this.low).get_unit()
    }

    draw() {
        //1. draw isobar
        stroke(0,0,0);
        let d = 40///pixels
        let vec = Vector.from_endpoints(this.high, this.low).get_unit()
        let m = - vec.dx / vec.dy

        for (let i=-5; i<=8; i++) {
            let intersection = new Point(
                this.high.x + vec.dx * d * i,
                this.high.y + vec.dy * d * i
            )
            strokeWeight(2);
            let c = lerpColor(color(235, 64, 52), color(255, 255, 255), (i + 5)/14)
            stroke(c)
            line(0, m * (0 - intersection.x) + intersection.y, width, m * (width - intersection.x) + intersection.y)
        }

        //2. draw circle
        drawCircleWithText("H", this.high.x, this.high.y, this.high.radius, [242, 136, 70], [235, 64, 52])
        drawCircleWithText("L", this.low.x, this.low.y, this.low.radius, [124, 173, 252], [90, 13, 222])

    }
}

class AntiCyclonePressureField {
    constructor(high, hemisphere) {
        this.low = new PressurePoint(0, 0, radius=0, pascal=0, type='high')//dummy
        this.high = high
        this.type = 1
        this.hemisphere = hemisphere //1 if northern hemisphere, -1 if southern.
    }

    get_pressure_gradient_unit_vector(point) {
        return Vector.from_endpoints(this.high, point).get_unit()
    }

    draw() {
        stroke(0,0,0);
          strokeWeight(3);
          noFill();
        //1. draw isobar
        let d = 40
        let centerColor = color(235, 64, 52)
        for (let i=0; i<=10; i++){
            let c = lerpColor(centerColor, color(255, 255, 255), i/10)
            stroke(c)
            circle(this.high.x, this.high.y, d * i)// third argument is width, not radius
        }
        
        //2. draw circle
        drawCircleWithText("H", this.high.x, this.high.y, this.high.radius, [242, 136, 70], [235, 64, 52])

    }
}

class CyclonePressureField {
    constructor(low, hemisphere) {
        this.low = low
        this.high = new PressurePoint(0, 0, radius=0, pascal=0, type='high')//dummy
        this.type = 2
        this.hemisphere = hemisphere //1 if northern hemisphere, -1 if southern.
    }

    get_pressure_gradient_unit_vector(point) {
        return Vector.from_endpoints(point, this.low).get_unit()
    }

    draw() {
        stroke(0,0,0);
          strokeWeight(3);
          noFill();
        //1. draw isobar
        let d = 40
        // let centerColor = color(235, 64, 52)
        let centerColor = color(90, 13, 222)
        for (let i=0; i<=10; i++){
            let c = lerpColor(centerColor, color(255, 255, 255), i/10)
            stroke(c)
            circle(this.low.x, this.low.y, d * i)// third argument is width, not radius
        }
        
        //2. draw circle
        drawCircleWithText("L", this.low.x, this.low.y, this.low.radius, [124, 173, 252], [90, 13, 222])

    }
}