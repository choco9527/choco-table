// 枚举类
export default class Enum {
  constructor(map) {
    this.map = new Map(map)
  }

  getNames() {
    return Object.keys(this).filter(key => key !== 'map')
  }

  getTexts() {
    return Array.from(this.map.values())
  }

  getTextByName(name) {
    return this.map.get(this[name])
  }

  getTextByValue(value) {
    return this.map.get(value)
  }

  getOptions() {
    const res = []
    this.map.forEach((value, key) => res.push({ key: key, value: key, label: value }))
    return res
  }
}
