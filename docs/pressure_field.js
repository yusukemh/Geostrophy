

class ParallelPressureField {
    constructor(high, low) {
        this.high = high
        this.low = low
        this.update()
    }

    update() {
        this.low.pascal = handler_lpascal.get_value()
        this.high.pascal = handler_hpascal.get_value()
        this.pg_pascal = (
            (this.high.pascal - this.low.pascal)  * 100/
            (Vector.from_endpoints(this.high, this.low).length * KM_PER_PIXEL * 1000)
        )//Pa per m
    }

    get_pressure_gradient_vector(x,y) {
        return Vector.from_endpoints(this.high, this.low).get_unit().mult(this.pg_pascal)
    }

    draw() { // draw circle and parallel isobar
        //1. draw isobar
        stroke(0, 0, 0);
        let d = 0.05 / this.pg_pascal//just for vis
        let vec = new Vector(this.low.x - this.high.x, this.low.y - this.high.y)
        let m = - vec.dx / vec.dy
      
        for (let i = -5; i < 8; i ++){
          let intersection = new Point(this.high.x + vec.dx * d * i, this.high.y + vec.dy * d * i)
          strokeWeight(2);
          let c = lerpColor(color(235, 64, 52), color(255, 255, 255), (i + 5)/14)
          stroke(c)
          line(0, m * (0 - intersection.x) + intersection.y, width, m * (width - intersection.x) + intersection.y)
        }

        //2. draw circle
        drawCircleWithText("H", this.high.x, this.high.y, this.high.drawing_radius, [242, 136, 70], [235, 64, 52])
        drawCircleWithText("L", this.low.x, this.low.y, this.low.drawing_radius, [124, 173, 252], [90, 13, 222])
        fill(255); // Text color
        noStroke()
        textSize(10); // Set text size proportional to radius
        text("\n\n\n"+this.high.pascal + '', this.high.x, this.high.y); // Draw text at the center of the circle
        text("\n\n\n"+this.low.pascal + '', this.low.x, this.low.y); // Draw text at the center of the circle
      }
}