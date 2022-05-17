const langMap = require('@/assets/language_zh_CN.json')

export function getLang(serName = '', name = '') { // 获取中文名
  if (!name) return ''
  const key = serName + '.' + name
  return langMap[key] || ''
}
