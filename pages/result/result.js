Page({
  data: {
    result: null,
    fortuneType: 'bazi'
  },

  onLoad(options) {
    if (options.data) {
      try {
        const resultData = JSON.parse(decodeURIComponent(options.data));
        this.setData({
          result: resultData,
          fortuneType: options.type || 'bazi'
        });
      } catch (err) {
        console.error('解析结果失败:', err);
        wx.showToast({ title: '数据加载失败', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    }
  },

  // 分享给好友
  onShareAppMessage() {
    const { result } = this.data;
    const shareContent = result ? `${result.title}：${result.tags ? result.tags.slice(0, 3).join('、') : '命理分析'}` : 'AI命理';
    
    return {
      title: `✨ ${shareContent}，快来测测你的正缘！`,
      path: '/pages/index/index',
      imageUrl: ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { result } = this.data;
    return {
      title: result ? `${result.title} - AI命理` : 'AI命理 - 探索你的命定之人',
      query: '',
      imageUrl: ''
    };
  },

  // 再算一次
  onAgain() {
    wx.navigateBack();
  },

  // 看广告获取次数
  watchAd() {
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
        // 增加免费次数
        const todayUses = Math.max(0, (wx.getStorageSync('todayUses') || 0) - 1);
        wx.setStorageSync('todayUses', todayUses);
        wx.showToast({ title: '获得1次分析机会！', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      });
    } else {
      wx.showToast({ title: '当前版本不支持广告', icon: 'none' });
    }
  }
});
