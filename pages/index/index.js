const app = getApp();

Page({
  data: {
    selectedType: 'bazi',
    birthDate: '',
    birthHour: '',
    gender: '',
    freeUsesLeft: 3,
    hours: [
      '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)',
      '卯时 (05:00-07:00)', '辰时 (07:00-09:00)', '巳时 (09:00-11:00)',
      '午时 (11:00-13:00)', '未时 (13:00-15:00)', '申时 (15:00-17:00)',
      '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
    ]
  },

  onLoad() {
    this.checkFreeUses();
  },

  onShow() {
    this.checkFreeUses();
  },

  // 检查剩余免费次数
  checkFreeUses() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = wx.getStorageSync('lastUsedDate') || '';
    const todayUses = wx.getStorageSync('todayUses') || 0;

    if (lastDate === today) {
      this.setData({ freeUsesLeft: Math.max(0, 3 - todayUses) });
    } else {
      // 新的一天，重置次数
      wx.setStorageSync('lastUsedDate', today);
      wx.setStorageSync('todayUses', 0);
      this.setData({ freeUsesLeft: 3 });
    }
  },

  // 选择玄学类型
  selectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  // 选择出生日期
  onBirthDateChange(e) {
    this.setData({ birthDate: e.detail.value });
  },

  // 选择出生时辰
  onBirthHourChange(e) {
    this.setData({ birthHour: e.detail.value });
  },

  // 选择性别
  selectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.gender });
  },

  // 检查是否可以开始
  computeCanStart() {
    const { selectedType, birthDate, gender } = this.data;
    return selectedType && birthDate && gender;
  },

  // 开始分析
  async startAnalysis() {
    if (!this.computeCanStart()) {
      wx.showToast({ title: '请完善信息', icon: 'none' });
      return;
    }

    if (this.data.freeUsesLeft <= 0) {
      // 次数用完，提示看广告
      wx.showModal({
        title: '今日次数已用完',
        content: '观看视频可获得1次分析机会',
        confirmText: '观看视频',
        success: (res) => {
          if (res.confirm) {
            this.watchAd();
          }
        }
      });
      return;
    }

    // 调用分析
    await this.doAnalysis();
  },

  // 执行分析
  async doAnalysis() {
    wx.showLoading({ title: '命理解读中...' });

    try {
      const result = await wx.cloud.callFunction({
        name: 'ai-analyzer',
        data: {
          type: this.data.selectedType,
          birthDate: this.data.birthDate,
          birthHour: this.data.birthHour !== '' ? this.data.birthHour : '0',
          gender: this.data.gender
        }
      });

      wx.hideLoading();

      if (result.errMsg && result.errMsg.includes('ok')) {
        // 记录使用
        this.recordUsage();

        // 跳转到结果页
        wx.navigateTo({
          url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(result.result))}&type=${this.data.selectedType}`
        });
      } else {
        throw new Error('分析失败');
      }
    } catch (err) {
      wx.hideLoading();
      console.error('分析出错:', err);
      wx.showToast({ title: '网络波动，请重试', icon: 'none' });
    }
  },

  // 记录使用次数
  recordUsage() {
    const today = new Date().toISOString().split('T')[0];
    const todayUses = (wx.getStorageSync('todayUses') || 0) + 1;
    wx.setStorageSync('todayUses', todayUses);
    this.setData({ freeUsesLeft: Math.max(0, 3 - todayUses) });
  },

  // 观看激励视频广告
  watchAd() {
    // 激励视频广告加载
    let rewardedVideoAd = null;
    
    if (wx.createRewardedVideoAd) {
      rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: 'YOUR_AD_UNIT_ID' // TODO: 替换为你的广告位ID
      });

      rewardedVideoAd.onLoad(() => {
        rewardedVideoAd.show().catch(() => {
          rewardedVideoAd.load().then(() => {
            rewardedVideoAd.show();
          });
        });
      });

      rewardedVideoAd.onError((err) => {
        console.error('广告加载失败:', err);
        wx.showToast({ title: '暂无广告，请稍后再试', icon: 'none' });
      });

      rewardedVideoAd.onRewarded((res) => {
        // 用户观看完成，增加次数
        const todayUses = Math.max(0, (wx.getStorageSync('todayUses') || 0) - 1);
        wx.setStorageSync('todayUses', todayUses);
        this.setData({ freeUsesLeft: Math.min(3, todayUses + 1) });
        wx.showToast({ title: '获得1次分析机会！', icon: 'success' });
      });
    } else {
      wx.showToast({ title: '当前版本不支持广告', icon: 'none' });
    }
  }
});
