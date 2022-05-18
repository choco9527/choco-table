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

export function getDate(datestr) {
  var temp = datestr.split('-')
  var date = new Date(temp[0], temp[1] - 1, temp[2])
  return date
}
