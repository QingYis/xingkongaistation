// @ts-nocheck
import * as THREE from 'three'
import { Observer } from './Observer';

/**
 * 
 * @param {HTMLElement | Document} domElement 
 * @returns {domElement is HTMLElement}
 */
function isHTMLElement(domElement) {
  return domElement !== document;
}

/**
 * This is a modified pointerlockcontrols.js from THREE.js
 * @member {HTMLElement} domElement
 */
export class CameraDragControls {


  /**
   * 
   * @param {Observer} observer 
   * @param {HTMLElement} domElement 
   */
  constructor(observer, domElement) {
    this.observer = observer;
    const inclineMatrix = new THREE.Matrix4().makeRotationZ(this.observer.incline);
    this.observer.up.applyMatrix4(inclineMatrix)

    this.domElement = (domElement !== undefined) ? domElement : document;

    this.enabled = true;

    this.lookSpeed = 0.005;
    this.lookVertical = true;

    this.offsetX = 0
    this.offsetY = 0
    this.lastX = 0
    this.lastY = 0

    this.pitch = 0
    this.yaw = 0
    this.roll = -1

    this.viewHalfX = 0
    this.viewHalfY = 0

    this.mouseDragOn = false
    this.onContextMenu = null
    this.onMouseMove = null
    this.onMouseDown = null
    this.onMouseUp = null

    if (isHTMLElement(this.domElement)) {
      this.domElement.setAttribute('tabindex', '-1');
    }

    this.addMouseEventHandlers();
    this.handleResize();
  }

  //
  handleResize() {
    if (!isHTMLElement(this.domElement)) {
      this.viewHalfX = window.innerWidth / 2;
      this.viewHalfY = window.innerHeight / 2;
    } else {
      this.viewHalfX = this.domElement.offsetWidth / 2;
      this.viewHalfY = this.domElement.offsetHeight / 2;
    }

    this.observer.setDirection(this.pitch, this.yaw);
  };

  update(delta) {

    if (this.enabled === false) return;
    let directionChanged = false;

    if (this.observer.angularVelocity > 0) {
      this.yaw += this.observer.angularVelocity * delta
      directionChanged = true;
    }

    if (this.mouseDragOn) {
      if (this.offsetX !== 0) {
        this.yaw += this.lookSpeed * this.offsetX;
        directionChanged = true;
      }

      if (this.lookVertical && this.offsetY !== 0) {
        this.pitch += this.lookSpeed * this.offsetY;
        this.pitch = Math.min(Math.PI / 2 - 0.01, Math.max(-Math.PI / 2 + 0.01, this.pitch))
        directionChanged = true;

      }
      this.offsetX /= 2;
      this.offsetY /= 2;

      if (Math.abs(this.offsetX) < 0.001) this.offsetX = 0;
      if (Math.abs(this.offsetY) < 0.001) this.offsetY = 0;
    }

    if (directionChanged) {
      this.observer.setDirection(this.pitch, this.yaw);
    }
  }


  getRelativePosition(event) {
    if (!isHTMLElement(this.domElement)) {
      return {
        x: event.pageX - this.viewHalfX,
        y: event.pageY - this.viewHalfY,
      };
    }

    return {
      x: event.pageX - this.domElement.offsetLeft - this.viewHalfX,
      y: event.pageY - this.domElement.offsetTop - this.viewHalfY,
    };
  }

  addMouseEventHandlers() {
    this.onContextMenu = (event) => {
      event.preventDefault();
    };

    this.onMouseMove = (event) => {

      // calculate moved position
      if (this.mouseDragOn) {
        const { x: newX, y: newY } = this.getRelativePosition(event);

        this.offsetX = newX - this.lastX;
        this.offsetY = newY - this.lastY;
        this.lastX = newX;
        this.lastY = newY;
      }
    };

    this.onMouseDown = (event) => {
      if (isHTMLElement(this.domElement)) {
        this.domElement.focus();
      }
      event.preventDefault();
      event.stopPropagation();
      this.mouseDragOn = true;
      // remember current mouse position
      const { x, y } = this.getRelativePosition(event);
      this.lastX = x;
      this.lastY = y;
    };

    this.onMouseUp = (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.mouseDragOn = false;
      this.offsetX = 0;
      this.offsetY = 0;
    };

    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    this.domElement.addEventListener('mousemove', this.onMouseMove);
    this.domElement.addEventListener('mousedown', this.onMouseDown);
    this.domElement.addEventListener('mouseup', this.onMouseUp);
  }

  dispose() {
    if (!this.domElement) {
      return;
    }

    if (this.onContextMenu) {
      this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    }

    if (this.onMouseMove) {
      this.domElement.removeEventListener('mousemove', this.onMouseMove);
    }

    if (this.onMouseDown) {
      this.domElement.removeEventListener('mousedown', this.onMouseDown);
    }

    if (this.onMouseUp) {
      this.domElement.removeEventListener('mouseup', this.onMouseUp);
    }
  }

}
