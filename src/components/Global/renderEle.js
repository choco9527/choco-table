export class GetEle {
  constructor(vm, fn) {
    this.vm = vm
    this.fn = fn
    this.edit = false
  }
  getEle() {
    return this.fn()
  }
}
