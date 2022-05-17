// 加减乘除

/**
 * 获取小数后位数最大值
 *
 * @param {Number} a
 * @param {Number} b
 */
const getE = (a, b) => {
  const la = getLen(a) // a的小数部分长度
  const lb = getLen(b) // b的小数部分长度
  return Math.pow(10, Math.max(la, lb)) // 保证a、b为整数的最小10次幂
}

/**
 * 获取数字小数位长度
 *
 * @param {Number} num
 */
const getLen = (num) => {
  let len = 0 // a的小数部分长度
  try {
    num.toString().split('.')[1] && (len = num.toString().split('.')[1].length)
  } catch (err) {
    console.log(err)
  }
  return len
}

/**
 * 加法运算
 *
 * @param {Number} a
 * @param {Number} b
 */
export function add(a = 0, b = 0) {
  if (!a || !b) {
    console.log('Error: 加法需要传入2个数字')
    return '加法需要传入2个数字'
  }
  const e = getE(a, b)
  return (a * e + b * e) / e
}

/**
 * 减法运算
 *
 * @param {Number} a
 * @param {Number} b
 */
export function sub(a = 0, b = 0) {
  if (!a || !b) {
    console.log('Error: 减法需要传入2个数字')
    return '减法需要传入2个数字'
  }
  const e = getE(a, b)
  return (a * e - b * e) / e
}

/**
 * 乘法运算
 *
 * @param {Number} a
 * @param {Number} b
 */

export function mul(a, b) {
  if (!a || !b) {
    console.log('Error: 乘法运算需要传入2个数字')
    return '乘法运算需要传入2个数字'
  }
  const la = getLen(a) // a的小数部分长度
  const lb = getLen(b) // b的小数部分长度
  return (parseInt(a.toString().replace('.', '')) * parseInt(b.toString().replace('.', ''))) / (10 ** (la + lb))
}

/**
 * 除法运算
 *
 * @param {Number} a
 * @param {Number} b
 */

/* 提示：因为原生js会出现类似：
0.3/0.1=2.9999999999999996
0.6/3=0.19999999999999998
的情况。所以共同乘以10的n次方，n为a、b两个数小数部分的最大长度值，这样就能一起化为整数运算
*/
export function div(a, b) {
  if (!a || !b) {
    console.log('Error: 减法运算需要传入2个数字')
    return '减法运算需要传入2个数字'
  }
  const la = getLen(a) // a的小数部分长度
  const lb = getLen(b) // b的小数部分长度

  const molecular = Number(a.toString().replace('.', '')) * (10 ** (la + lb))
  const denominator = Number(b.toString().replace('.', '')) * (10 ** (la + lb))
  return molecular / denominator / Math.pow(10, (la - lb))
}
