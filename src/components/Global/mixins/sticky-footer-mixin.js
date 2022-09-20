import { debounce } from 'xe-utils'
// 合计行固定逻辑 配合css .sticky-footer
export default {
  props: {
    stickyFooter: { type: Boolean, default: false }, // 是否合计行吸底
    scrollSelector: { type: String, default: '' } // 指定需要作为滚动监测的包裹元素，默认为window
  },
  data() {
    this.bodyDom = null
    this.scrollDom = null
    this.footerDoms = null // 用于固定合计行的dom
  },
  computed: {
    $scrollSelector() {
      return this.scrollSelector || this.$cScrollSelector
    }
  },
  mounted() {
    this.scrollDom = this.getScrollDom()
    if (this.stickyFooter) { // calc footer width when window resize
      window.addEventListener('resize', debounce(this.changeFooterFn, 200), false) // 监听窗口改变
      this.scrollDom.addEventListener('scroll', this.changeFooterFn, false)
    }
  },
  methods: {
    getScrollDom() {
      let dom = window
      if (this.$scrollSelector) {
        dom = document.querySelector(this.$scrollSelector) || window
      }
      return dom
    },
    initStickyFooter() { // 获取所有合计行并计算初始化
      if (!this.stickyFooter) return
      this.$nextTick(() => {
        this.footerDoms = document.querySelectorAll(`${this.tableSelector} .vxe-table--footer-wrapper`)
        // init后直接判断锁定与否
        this.changeFooterFn()
      })
    },
    setFootersStyle() { // 设置所有 footer doms class固定
      if (!this.stickyFooter || !this.footerDoms) return
      this.footerDoms.forEach(footerDom => {
        this.setFooterStyle(footerDom)
      })
    },
    setFooterStyle(footerDom, reset = false) { // 设置footer 属性 width left
      if (reset) {
        footerDom.style.width = 'auto'
        footerDom.style.left = 'auto'
      } else {
        const tableDom = footerDom.parentNode
        if (tableDom) {
          const { width, x } = tableDom.getBoundingClientRect()
          footerDom.style.width = width ? width + 'px' : '100%'
          footerDom.style.left = x ? x + 'px' : 0
        }
      }
    },
    changeFooterFn() {
      this.$nextTick(() => {
        if (this.judgeBottomAppear()) {
          this.removeFootersClass()
        } else {
          this.setFootersClass()
        }
      })
    },
    setFootersClass() { // 设置.sticky-footer
      if (!this.stickyFooter || !this.footerDoms) return
      this.footerDoms.forEach(footerDom => {
        if (!footerDom.classList.contains('sticky-footer')) footerDom.classList.add('sticky-footer')
        this.setFooterStyle(footerDom)
      })
    },
    removeFootersClass() { // 清除.sticky-footer
      if (!this.stickyFooter || !this.footerDoms) return
      if (this.footerDoms) {
        this.footerDoms.forEach(footerDom => {
          if (footerDom.classList.contains('sticky-footer')) {
            footerDom && footerDom.classList.remove('sticky-footer')
            this.setFooterStyle(footerDom, true)
          }
        })
      }
    },
    judgeBottomAppear() { // 判断table底部是否在视图内
      if (this.bodyDom) {
        const innerHeight = window.innerHeight
        const { height, y } = this.bodyDom.getBoundingClientRect()
        return innerHeight > (height + y)
      }
    }
  }
}
