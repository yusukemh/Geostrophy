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