export default {
  data() {
    const getPickerTime = this.getPickerTime = function(type = '') {
      if (!type) return
      const end = new Date()
      const start = new Date()
      switch (type) {
        case 'lastWeek':
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
          break
        case 'lastMonth':
          start.setMonth(start.getMonth() - 1)
          break
        case 'lastHalfYear':
          start.setMonth(start.getMonth() - 6)
          break
        case 'lastThreeMonth':
          start.setMonth(start.getMonth() - 3)
          break
        case 'prevWeek':
          start.setDate(start.getDate() - start.getDay() - 7)
          end.setDate(end.getDate() - end.getDay() - 1)
          break
        case 'yesterday':
          start.setDate(start.getDate() - 1)
          end.setDate(end.getDate() - 1)
          break
        case 'today':
          break
        case 'thisWeek':
          start.setDate(start.getDate() - start.getDay())
          break
        case 'thisMonth':
          start.setDate(1)
          break
        case 'thisYear':
          start.setFullYear(start.getFullYear() - 1)
          break
      }
      start.setHours(0, 0, 0)
      end.setHours(23, 59, 59)
      return { start, end }
    }
    this.timeDefaultList = [
      { label: '近一周', val: 'lastWeek' },
      { label: '近一月', val: 'lastMonth' },
      { label: '最近三月', val: 'lastThreeMonth' },
      { label: '近半年', val: 'lastHalfYear' },
      { label: '昨天', val: 'yesterday' },
      { label: '今天', val: 'today' },
      { label: '上周', val: 'prevWeek' },
      { label: '本周', val: 'thisWeek' },
      { label: '本月', val: 'thisMonth' },
      { label: '今年', val: 'thisYear' }
    ]
    return {
      pickerOptions: {
        shortcuts: this.timeDefaultList.map(item => ({
          text: item.label,
          onClick(picker) {
            const { start, end } = getPickerTime(item.val)
            picker.$emit('pick', [start, end])
          }
        })
        )
      }
    }
  }

}
