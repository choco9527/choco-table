import { clone } from 'xe-utils'

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

export function isJson(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
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
 * 带有缓存的 sessionStorage 方法
 */
const _storage = function(type) {
  if (['session', 'local'].includes(type) && sessionStorage && localStorage) {
    return {
      // session存储,可设置过期时间
      set(key, value, expires = 0) {
        const params = { key, value, expires }
        if (expires) {
        // 记录何时将值存入缓存，毫秒级
          const data = Object.assign(params, { startTime: new Date().getTime() })
          type === 'session' ? sessionStorage.setItem(key, JSON.stringify(data)) : localStorage.setItem(key, JSON.stringify(data))
        } else {
          if (Object.prototype.toString.call(value) === '[object Object]') {
            value = JSON.stringify(value)
          }
          if (Object.prototype.toString.call(value) === '[object Array]') {
            value = JSON.stringify(value)
          }
          type === 'session' ? sessionStorage.setItem(key, value) : localStorage.setItem(key, value)
        }
      },
      // 取出
      get(key) {
        let item = type === 'session' ? sessionStorage.getItem(key) : localStorage.getItem(key)
        try { // 解析出json
          item = JSON.parse(item)
        } catch (error) {
        // not Object
        }
        if (item && item.startTime) {
          const date = new Date().getTime()
          if (date - item.startTime > item.expires) {
            type === 'session' ? sessionStorage.removeItem(key) : localStorage.removeItem(key)
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
        type === 'session' ? sessionStorage.removeItem(key) : localStorage.removeItem(key)
      },
      // 清除全部
      clear() {
        type === 'session' ? sessionStorage.clear() : localStorage.clear()
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
