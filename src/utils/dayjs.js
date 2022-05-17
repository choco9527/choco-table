// dayjs
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import objectSupport from 'dayjs/plugin/objectSupport'
dayjs.extend(objectSupport)
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

export default dayjs
