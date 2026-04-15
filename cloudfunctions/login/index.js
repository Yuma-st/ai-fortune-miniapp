// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  // 获取 openid
  const openid = wxContext.OPENID;

  // 返回 openid
  return {
    openid: openid,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID || null
  };
};
