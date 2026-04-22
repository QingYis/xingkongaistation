// @ts-nocheck
import * as THREE from 'three'
import { Observer } from './Observer';

function isHTMLElement(domElement) {
  return domElement !== document;
}

export class CameraDragControls {
  constructor(observer, domElement) {
    this.observer = observer;
    const inclineMatrix = new THREE.Matrix4().makeRotationZ(this.observer.incline);
    this.observer.up.applyMatrix4(inclineMatrix)

    this.domElement = (domElement !== undefined) ? domElement : document;

    this.enabled = true;

    this.lookSpeed = 0.005;
    this.lookVertical = true;

    this.pendingDeltaX = 0
    this.pendingDeltaY = 0
    this.lastX = 0
    this.lastY = 0

    this.pitch = 0
    this.yaw = 0

    this.viewHalfX = 0
    this.viewHalfY = 0

    this.mouseDragOn = false
    this._rafId = null
    this._pendingUpdate = false
    this.onContextMenu = null
    this.onPointerMove = null
    this.onPointerDown = null
    this.onPointerUp = null

    if (isHTMLElement(this.domElement)) {
      this.domElement.setAttribute('tabindex', '-1');
      this.domElement.style.touchAction = 'none';
    }

    this.addPointerEventHandlers();
    this.handleResize();
  }

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

  _scheduleUpdate() {
    if (!this._pendingUpdate) {
      this._pendingUpdate = true;
      this._rafId = requestAnimationFrame(() => {
        this._pendingUpdate = false;
        this._processInput();
      });
    }
  }

  _processInput() {
    if (!this.mouseDragOn) return;
    const dx = this.pendingDeltaX;
    const dy = this.pendingDeltaY;
    this.pendingDeltaX = 0;
    this.pendingDeltaY = 0;

    if (dx !== 0) {
      this.yaw += this.lookSpeed * dx;
    }
    if (this.lookVertical && dy !== 0) {
      this.pitch += this.lookSpeed * dy;
      this.pitch = Math.min(Math.PI / 2 - 0.01, Math.max(-Math.PI / 2 + 0.01, this.pitch));
    }
    this.observer.setDirection(this.pitch, this.yaw);
  }

  update(delta) {
    if (this.enabled === false) return;

    if (this.observer.angularVelocity > 0) {
      this.yaw += this.observer.angularVelocity * delta;
      this.observer.setDirection(this.pitch, this.yaw);
    }

    if (this.mouseDragOn) {
      this._processInput();
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

  addPointerEventHandlers() {
    this.onContextMenu = (event) => {
      event.preventDefault();
    };

    this.onPointerMove = (event) => {
      if (!this.mouseDragOn) return;
      const { x: newX, y: newY } = this.getRelativePosition(event);
      this.pendingDeltaX += (newX - this.lastX);
      this.pendingDeltaY += (newY - this.lastY);
      this.lastX = newX;
      this.lastY = newY;
      this._scheduleUpdate();
    };

    this.onPointerDown = (event) => {
      if (event.button !== 0) return;
      if (isHTMLElement(this.domElement)) {
        this.domElement.focus();
      }
      event.preventDefault();
      this.mouseDragOn = true;
      if (this.domElement.hasPointerCapture) {
        this.domElement.setPointerCapture(event.pointerId);
      }
      const { x, y } = this.getRelativePosition(event);
      this.lastX = x;
      this.lastY = y;
      this.pendingDeltaX = 0;
      this.pendingDeltaY = 0;
    };

    this.onPointerUp = (event) => {
      event.preventDefault();
      this.mouseDragOn = false;
      if (this.domElement.hasPointerCapture && event.pointerId != null) {
        try { this.domElement.releasePointerCapture(event.pointerId); } catch (e) {}
      }
      this.pendingDeltaX = 0;
      this.pendingDeltaY = 0;
    };

    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
  }

  dispose() {
    if (!this.domElement) {
      return;
    }

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    if (this.onContextMenu) {
      this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    }

    if (this.onPointerMove) {
      this.domElement.removeEventListener('pointermove', this.onPointerMove);
    }

    if (this.onPointerDown) {
      this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    }

    if (this.onPointerUp) {
      this.domElement.removeEventListener('pointerup', this.onPointerUp);
    }
  }
}