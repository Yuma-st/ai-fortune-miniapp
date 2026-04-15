App({
  globalData: {
    userInfo: null,
    openid: null,
    hasUserInfo: false
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'ai-fortune-xxxx', // TODO: 替换为你的云环境ID
        traceUser: true,
      });
    }

    // 检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.globalData.openid = openid;
      this.globalData.hasUserInfo = true;
    }
  },

  // 登录获取openid
  login() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        success: (res) => {
          if (res.result && res.result.openid) {
            this.globalData.openid = res.result.openid;
            this.globalData.hasUserInfo = true;
            wx.setStorageSync('openid', res.result.openid);
            resolve(res.result.openid);
          } else {
            reject(new Error('登录失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
});
