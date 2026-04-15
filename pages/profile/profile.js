const app = getApp();

Page({
  data: {
    freeUsesLeft: 3,
    totalUsed: 0,
    records: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  loadData() {
    // 获取剩余次数
    const today = new Date().toISOString().split('T')[0];
    const lastDate = wx.getStorageSync('lastUsedDate') || '';
    const todayUses = wx.getStorageSync('todayUses') || 0;

    let freeLeft = 3;
    if (lastDate === today) {
      freeLeft = Math.max(0, 3 - todayUses);
    }

    // 获取累计使用次数
    const totalUsed = wx.getStorageSync('totalUsed') || 0;

    // 获取历史记录
    const records = wx.getStorageSync('records') || [];

    this.setData({
      freeUsesLeft: freeLeft,
      totalUsed: totalUsed,
      records: records.slice(0, 10) // 只显示最近10条
    });
  },

  // 查看历史记录
  viewRecord(e) {
    const record = e.currentTarget.dataset.record;
    if (record && record.result) {
      wx.navigateTo({
        url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(record.result))}&type=${record.type}`
      });
    }
  },

  // 关于我们
  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'AI 命理是一款结合人工智能与传统玄学的命理分析小程序。我们致力于为用户提供有趣、温暖的命理解读体验。\n\n版本：1.0.0',
      showCancel: false
    });
  },

  // 使用帮助
  onHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 选择你喜欢的测算方式（八字/星盘/塔罗）\n2. 填写你的出生信息\n3. 点击"开始分析"获取专属命理解读\n4. 每日可免费使用3次\n5. 次数用完后可观看视频广告获取更多机会',
      showCancel: false
    });
  },

  // 隐私政策
  onPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护：\n\n1. 我们仅收集您的出生日期信息用于命理分析\n2. 您的数据将安全存储在微信云服务器\n3. 我们不会将您的个人信息提供给第三方\n4. 所有分析结果仅供娱乐参考\n\n如有疑问，请联系我们的客服。',
      showCancel: false
    });
  }
});
