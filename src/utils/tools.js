import { clone } from 'xe-utils'

/**
 * 判断字符串是否为json
 * @param str {string}
 * @returns {boolean}
 */
export function isJson(str = '') {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

/**
 * 清除页面内所有定时器
 * @param win {window}
 */
export function clearAllTimer(win) {
  win = win || window
  try {
    let id = setTimeout(() => { }, 0)
    let id2 = setInterval(() => { }, 9999)
    while (id > 0) {
      win.clearTimeout(id)
      id--
    }
    while (id2 > 0) {
      win.clearInterval(id2)
      id2--
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 * sleep
 * @param time{number} 毫秒
 * @returns {Promise<any>}
 */
export function sleep(time = 1000) {
  return new Promise(resolve => {
    const t = setTimeout(() => {
      resolve(t)
    }, time)
  })
}

/**
 * 深拷贝
 * @param obj
 * @returns {Object}
 */
export function cloneDeep(obj) {
  return clone(obj, true)
}

/**
 * 重试函数
 * @param fn 执行主函数
 * @param times 重试次数
 * @param delay 重试延迟
 * @param args 函数参数
 * @returns {Promise<any>}
 */
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

/**
 * 缓存方法
 * _session提供sessionStorage
 * _local提供localStorage
 */
const _storage = function(type) {
  if (!window) return
  const _s = window && window.sessionStorage
  const _l = window && window.localStorage
  if (['session', 'local'].includes(type) && _s && _l) {
    return {
      // session存储,可设置过期时间
      set(key, value, expires = 0) {
        const params = { key, value, expires }
        if (expires) {
        // 记录何时将值存入缓存，毫秒级
          const data = Object.assign(params, { startTime: new Date().getTime() })
          type === 'session' ? _s.setItem(key, JSON.stringify(data)) : _l.setItem(key, JSON.stringify(data))
        } else {
          if (Object.prototype.toString.call(value) === '[object Object]') {
            value = JSON.stringify(value)
          }
          if (Object.prototype.toString.call(value) === '[object Array]') {
            value = JSON.stringify(value)
          }
          type === 'session' ? _s.setItem(key, value) : _l.setItem(key, value)
        }
      },
      // 取出
      get(key) {
        let item = type === 'session' ? _s.getItem(key) : _l.getItem(key)
        try { // 解析出json
          item = JSON.parse(item)
        } catch (error) {
        // not Object
        }
        if (item && item.startTime) {
          const date = new Date().getTime()
          if (date - item.startTime > item.expires) {
            type === 'session' ? _s.removeItem(key) : _l.removeItem(key)
            return false
          } else {
            return item.value
          }
        } else {
          return item
        }
      },
      // 删除
      remove(key) {
        type === 'session' ? _s.removeItem(key) : _l.removeItem(key)
      },
      // 清除全部
      clear() {
        type === 'session' ? _s.clear() : _l.clear()
      }
    }
  }
}

export const _session = _storage('session')
export const _local = _storage('local')

/**
 * 获取路由中所有参数
 */
export const getAllParams = () => {
  if (!window) return null
  const href = decodeURI(window.location.href)
  const query = href.substring(href.indexOf('?') + 1)
  const vars = query.split('&')
  const obj = {}
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    // 将参数名和参数值分别作为对象的属性名和属性值
    const key = pair[0]
    const val = pair[1]
    if (Object.prototype.toString.call(obj[key]) === '[object String]') { // 已有字符串，处理为数组
      obj[key] = [obj[key], val]
    } else if (Object.prototype.toString.call(obj[key]) === '[object Array]') { // 如果已有为数组，添加为数组
      obj[key] = [...obj[key], val]
    } else {
      obj[key] = isJson(val) ? JSON.parse(val) : val
    }
  }
  return obj
}
