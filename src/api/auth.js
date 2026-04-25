/*
 * @File: 
 * @Description: 
 * @Author: guyawei (1972065889@qq.com)
 * @Date: 2026-04-24 23:15:36
 * @LastEditTime: 2026-04-25 09:45:47
 * @LastEditors: guyawei (1972065889@qq.com)
 * @FilePath: \filesearch\resume-frontend\src\api\auth.js
 */
import request from './request';

export function login(data) {
  return request.post('/admin/login', data);
}
