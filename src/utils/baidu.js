import Vue from 'vue'

const loginName = '登录'
const bindName = 'ASA绑定'
const manageName = '广告管理'
const reportName = '自定义报表'
import store from '@/store'
const isProduction = process.env.NODE_ENV === 'production'

export function trackBaiDuEvent(category = '', action = '', opt_label = '') {
  if (window && category && isProduction) {
    const hmt = window._hmt
    const userPhone = store.getters && store.getters.name // 最后一位信息始终为用户姓名 即手机号

    hmt.push(['_trackEvent', category, action, `${opt_label}-${userPhone}`])
  }
}

export function loginEvent(action = '', label) {
  if (action) {
    trackBaiDuEvent(loginName, action, label)
  }
}

export function bindEvent(action = '', label) {
  if (action) {
    trackBaiDuEvent(bindName, action, label)
  }
}

export function manageEvent(action = '', label) { // 广告管理页面
  if (action) {
    trackBaiDuEvent(manageName, action, label)
  }
}

export function reportEvent(action = '', label) { // 报表页面
  if (action) {
    trackBaiDuEvent(reportName, action, label)
  }
}
