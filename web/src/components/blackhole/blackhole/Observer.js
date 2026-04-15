import * as THREE from 'three';

export class Observer extends THREE.PerspectiveCamera {
  constructor(fov, ratio, near, far) {
    super(fov, ratio, near, far)
    // for orbit
    this.time = 0
    this.theta = 0
    this.angularVelocity = 0
    this.maxAngularVelocity = 0
    this.velocity = new THREE.Vector3()

    this.position.set(0, 0, 1)
    this.direction = new THREE.Vector3(0, 0, -1);
    this.baseDirection = new THREE.Vector3(0, 0, -1);
    this.directionRotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.inclineMatrix = new THREE.Matrix4();

    // options
    this.moving = false
    this.timeDilation = false
    this.incline = -5 * Math.PI / 180
    this.inclineMatrix.makeRotationX(this.incline)
  }

  // sets position, r vector, direction by supplying distance from center
  set distance(r) {
    this.r = r
    // w
    this.maxAngularVelocity = 1 / Math.sqrt(2.0 * (r - 1.0)) / this.r
    // p
    this.position.normalize().multiplyScalar(r)
  }

  get distance() {
    return this.r
  }

  setDirection(pitch, yaw) {
    this.directionRotation.set(pitch, yaw, 0)
    this.direction.copy(this.baseDirection).applyEuler(this.directionRotation).normalize();
  }

  update(delta) {
    // apply time dilation to delta time
    if (this.timeDilation) {
      this.delta = Math.sqrt((delta * delta * (1.0 - this.angularVelocity * this.angularVelocity)) / (1 - 1.0 / this.r));
    } else {
      this.delta = delta
    }

    // update angle of the camera, orbits around
    this.theta += this.angularVelocity * this.delta
    let cos = Math.cos(this.theta)
    let sin = Math.sin(this.theta)


    // set position according to the angle above
    this.position.set(this.r * sin, 0, this.r * cos)
    // change direction of movement
    this.velocity.set(cos * this.angularVelocity, 0, -sin * this.angularVelocity)

    // give some incline to camera
    this.position.applyMatrix4(this.inclineMatrix)
    this.velocity.applyMatrix4(this.inclineMatrix)

    if (this.moving) {
      // accel
      if (this.angularVelocity < this.maxAngularVelocity)
        this.angularVelocity += this.delta / this.r
      else
        this.angularVelocity = this.maxAngularVelocity

    } else {
      // deccel
      if (this.angularVelocity > 0.0)
        this.angularVelocity -= this.delta / this.r
      else {
        this.angularVelocity = 0
        this.velocity.set(0.0, 0.0, 0.0)
      }
    }

    this.time += this.delta
  }

}
