// 合计行固定逻辑 配合css .sticky-footer
export default {
  data() {
    this.bodyDom = null
    this.footerDoms = null // 用于固定合计行的dom
  },
  methods: {
    initStickyFooter() { // 获取所有合计行并计算初始化
      if (!this.stickyFooter) return
      this.$nextTick(() => {
        this.footerDoms = document.querySelectorAll(`${this.tableSelector} .vxe-table--footer-wrapper`)
        this.setFootersClass()
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
        const { width, x } = tableDom.getBoundingClientRect()
        footerDom.style.width = width ? width + 'px' : '100%'
        footerDom.style.left = x ? x + 'px' : 0
      }
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
      const innerHeight = window.innerHeight
      const { height, y } = this.bodyDom.getBoundingClientRect()
      return innerHeight > (height + y)
    }
  }
}
