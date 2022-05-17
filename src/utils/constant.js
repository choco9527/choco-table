import Enum from './enum'

export default {
  CUR_RATE: 100, // RIGEL 货币比率
  account: {
    authStatus: new (class extends Enum { // 认证状态
      constructor() {
        super([
          [0, '未认证'],
          [1, '审核中'],
          [2, '审核成功'],
          [3, '审核不通过，可重新提交审核'],
          [4, '审核不通过，不可重新提交审核']
        ])
        this.NONE = 0
        this.AUDITING = 1
        this.AUDITING_PASS = 2
        this.AUDITING_FAIL_CAN_RETRY = 3
        this.AUDITING_FAIL_END = 4
      }
    })(),
    authType: new (class extends Enum { // 认证类型
      constructor() {
        super([
          [0, '未定义'],
          [1, '企业'],
          [2, '个人']
        ])
        this.UNDEFINED = 0
        this.BUSINESS = 1
        this.PERSONAL = 2
      }
    })()
  },
  order: {
    status: new (class extends Enum { // 推广计划状态
      constructor() {
        super([
          [0, '未定义'],
          [1, '投放中'],
          [3, '已完成']
        ])
        this.NONE = 0
        this.RUNNING = 1
        this.COMPLETE = 3
      }
    })(),
    paymentStatus: new (class extends Enum { // 推广计划订单状态
      constructor() {
        super([
          [0, '初始化状态'],
          [1, '已付款'],
          [2, '待付款'],
          [3, '订单已失效']
        ])
        this.NONE = 0
        this.PAID = 1
        this.PENDING = 2
        this.EXPIRED = 3
      }
    })(),
    topUpStatus: new (class extends Enum { // 充值状态（处理过，）
      constructor() {
        super([
          [0, '无此状态'],
          [1, '处理中'],
          [2, '充值成功'],
          [3, '提现失败']
        ])
        this.none = 0
        this.processing = 1
        this.success = 2
        this.fail = 3
      }
    })(),
    //     充值的：
    // //ChargeStatusCreated 已发起
    // ChargeStatusCreated = 10
    // //ChargeStatusSuccess 已完成
    // ChargeStatusSuccess = 20
    // //ChargeStatusCancel 充值失败
    // ChargeStatusCancel = 30
    // //ChargeStatusFail 回调失败
    // ChargeStatusFail = 40
    // //ChargeStatusSuccessButOpFailed 成功，但是加钱操作失败
    // ChargeStatusSuccessButOpFailed = 50

    topUpOrderStatus: new (class extends Enum { // 充值订单状态
      constructor() {
        super([
          [10, '已发起'],
          [20, '已完成'],
          [30, '充值失败'],
          [40, '充值失败'], // 回调失败
          [50, '充值失败'] // 成功，但是加钱操作失败
        ])
        this.chargeStatusCreated = 10
        this.chargeStatusSuccess = 20
        this.chargeStatusCancel = 30
        this.chargeStatusFail = 40
        this.chargeStatusSuccessButOpFailed = 50
      }
    })(),

    // 退款的：
    // //FinanceRefundOrderStatusCreated 审核中
    // FinanceRefundOrderStatusCreated = 10
    // //FinanceRefundOrderStatusSend 已发起
    // FinanceRefundOrderStatusSend = 20
    // //FinanceRefundOrderStatusSuccess 已退款成功
    // FinanceRefundOrderStatusSuccess = 30
    // //FinanceRefundOrderStatusFailed 退款失败
    // FinanceRefundOrderStatusFailed = 40
    refundOrderStatus: new (class extends Enum { // 退款订单状态
      constructor() {
        super([
          [10, '审核中'],
          [20, '已发起'],
          [30, '已退款成功'],
          [40, '退款失败']
        ])
        this.financeRefundOrderStatusCreated = 10
        this.financeRefundOrderStatusSend = 20
        this.financeRefundOrderStatusSuccess = 30
        this.financeRefundOrderStatusFailed = 40
      }
    })()
  }
}
