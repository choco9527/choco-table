import dayjs from '@/utils/dayjs'
import { clone, toFixed } from 'xe-utils'
import XLSX from 'xlsx'

export function isDevicePhone() {
  const userAgent = window.navigator.userAgent
  if (
    userAgent.match(/Android/i) ||
    userAgent.match(/webOS/i) ||
    userAgent.match(/iPhone/i) ||
    userAgent.match(/iPad/i) ||
    userAgent.match(/iPod/i) ||
    userAgent.match(/BlackBerry/i) ||
    userAgent.match(/Windows Phone/i)
  ) {
    return true
  } else {
    return false
  }
}
/**
 * 根据数组对象的某个字段去重
 * item.name  是[{name:1}] 根据每条数据的name值来去重
 * */
export function uniqBy(arr, key) {
  const res = new Map()
  return arr.filter(item => !res.has(item[key]) && res.set(item[key], 1))
}

export function difference(a, b) {
  return a.filter(v => (b.indexOf(v) === -1))
}

export function intersection(...args) { // 交集 [1,2], [2,3], [2,3,4] => [2]
  return args.length === 0 ? []
    : args.length === 1 ? args[0]
      : args.reduce((result, next) => {
        return result.filter(item => next.includes(item))
      })
}

export function debounce(fn, delay = 200) {
  // 防抖函数
  let timer = null
  const ctx = this
  function run(...args) {
    clearTimeout(timer)

    timer = setTimeout(() => {
      fn.call(ctx, args)
    }, delay)
  }
  return run
}

// 清除所有定时器
export function clearAllTimer(window) {
  try {
    let id = setTimeout(() => { }, 0)
    let id2 = setInterval(() => { }, 9999)
    while (id > 0) {
      window.clearTimeout(id)
      id--
    }
    while (id2 > 0) {
      window.clearInterval(id2)
      id2--
    }
  } catch (e) {
    console.log(e)
  }
}

export function getRmbNum(str = '') { // 获取rmb字符串数字 str -> num
  str = str.replace(/(￥|¥|,)/g, '')
  const reg = /^\d+\.?\d*$/
  if (!reg.test(str)) { // 非数字
    return NaN
  }
  return parseFloat(str)
}

export function sleep(time = 1000) {
  return new Promise(resolve => {
    const t = setTimeout(() => {
      resolve(t)
    }, time)
  })
}

export function cloneDeep(obj) {
  return clone(obj, true)
}

export function fixedNumber(num, digit = 1, show = 'string') { // 转换字符串为数字or字符串数字
  if (isNaN(parseFloat(num))) return ''
  return show === 'string' ? toFixed(parseFloat(num), digit) : parseFloat(toFixed(parseFloat(num), digit))
}

export function loadExcel({ header = [], range = 0 }) {
  return new Promise(resolve => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.click() // 开始选择文件
    fileInput.onchange = () => { // 监听选择文件的结果，获取选择到的文件
      const file = fileInput.files[0]
      readWorkbookFromLocalFile(file, (list) => {
        resolve(list)
      })
    }

    function readWorkbookFromLocalFile(file, callback) {
      const reader = new FileReader()
      reader.onload = function(e) {
        const data = e.target.result
        // 读取二进制的excel
        const wb = XLSX.read(data, { type: 'binary' })

        const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header, range })
        if (callback) callback(json)
      }
      reader.readAsBinaryString(file)
    }
  })
}

export function formatToSecond(dateVal) { // 01:00:10/date -> 3610
  return (dayjs(dateVal).hour() * 3600 + dayjs(dateVal).minute() * 60 + dayjs(dateVal).second())
}

export function formatTime(time, more = '') { // 3610 -> 01:00:10 / 1时1分10秒
  if (!time) return
  if (time instanceof Date) { // 时间对象先转换为秒
    time = formatToSecond(time)
  }
  time = time * 1000

  const timeObj = dayjs.duration(time) // 得到一个对象，里面有对应的时分秒等时间对象值
  const format = 'HH:mm:ss'
  const days = Math.floor(timeObj.asDays())
  const hours = timeObj.hours()
  const minutes = timeObj.minutes()
  const seconds = timeObj.seconds()
  if (more === 'day') {
    if (days > 0) {
      return `${days}天 ${hours}时${minutes}分${seconds}秒`
    } else {
      return `${hours}时${minutes}分${seconds}秒`
    }
  }
  return dayjs({ hours, minutes, seconds }).format(format)
}

export function promiseRetry({ fn = null, times = 1, delay = 0, args }) {
  if (!fn) return
  return new Promise((resolve, reject) => {
    const tryFn = function() {
      fn(args).then(resolve).catch(() => {
        if (times-- > 0) {
          console.log(`请求失败，再请求${times}次`)
          setTimeout(tryFn, delay)
        } else {
          reject()
        }
      })
    }
    return tryFn()
  })
}

export function multiRequest(urls, maxNum = 1, request) {
  const ret = []
  let i = 0
  let resolve
  const promise = new Promise(r => resolve = r)
  const addTask = () => {
    if (i >= urls.length) {
      return resolve()
    }

    const task = request(urls[i++]).finally(() => {
      addTask()
    })
    ret.push(task)
  }

  while (i < maxNum) {
    addTask()
  }

  return promise.then(() => Promise.all(ret))
}

export function raceTime(a, b) { // 比较两个时间点 11:00 > 10:59 ，return a>b
  try {
    const [h1, m1] = a.split(':')
    const [h2, m2] = b.split(':')
    if (parseInt(h1) > h2) return true
    if (parseInt(h1) < h2) return false
    return parseInt(m1) > m2
  } catch (e) {
    return false
  }
}

// 金额千分逗号 10000 => ￥1,000
export function toCNYPrice(price, currency = 'CNY') {
  const a = parseFloat(price)
  const options = {
    style: 'currency',
    currency
  }
  return a.toLocaleString('zh-CN', options)
}

export function toFixedPrice(str) {
  return fixedNumber(str, 2, 'number')
}

export function isJson(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export function workbook2blob(workbook) {
  // 生成excel的配置项
  const wopts = {
    // 要生成的文件类型
    bookType: 'xlsx',
    // // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    bookSST: false,
    type: 'binary'
  }
  const wbout = XLSX.write(workbook, wopts)
  // 将字符串转ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
    return buf
  }
  return new Blob([s2ab(wbout)], {
    type: 'application/octet-stream'
  })
}

// 将blob对象创建bloburl，然后用a标签实现弹出下载框
export function openDownloadDialog(blob, fileName) {
  if (typeof blob === 'object' && blob instanceof Blob) {
    blob = URL.createObjectURL(blob) // 创建blob地址
  }
  const aLink = document.createElement('a')
  aLink.href = blob
  // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，有时候 file:///模式下不会生效
  aLink.download = fileName || ''
  let event
  if (window.MouseEvent) event = new MouseEvent('click')
  //   移动端
  else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  }
  aLink.dispatchEvent(event)
}

export function getAllDates(start, end) {
  const dateList = []
  var startTime = getDate(start)
  var endTime = getDate(end)

  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear()
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1
    var day = startTime.getDate().toString().length == 1 ? '0' + startTime.getDate() : startTime.getDate()
    dateList.push(year + '-' + month + '-' + day)
    startTime.setDate(startTime.getDate() + 1)
  }
  return dateList
}

export function getDate(datestr) {
  var temp = datestr.split('-')
  var date = new Date(temp[0], temp[1] - 1, temp[2])
  return date
}

export function getCssVar(name = '') { // 获取css变量值
  const docStyle = window.getComputedStyle(document.documentElement, null)
  const isSupported =
    window.CSS &&
    window.CSS.supports &&
    window.CSS.supports('--a', 0)
  if (isSupported) {
    return docStyle.getPropertyValue(`--js_${name}`).trim()
  } else {
    return ''
  }
}

export function dispatchEvent(el, type) { // 派发事件
  try {
    if (el && type) {
      const evt = document.createEvent('Event')
      evt.initEvent(type, true, true)
      el.dispatchEvent(evt)
    }
  } catch (e) {
    console.log('派发事件错误：', e)
  }
}
