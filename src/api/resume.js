/*
 * @File: 
 * @Description: 
 * @Author: guyawei (1972065889@qq.com)
 * @Date: 2026-04-25 09:50:06
 * @LastEditTime: 2026-04-25 10:17:46
 * @LastEditors: guyawei (1972065889@qq.com)
 * @FilePath: \filesearch\resume-frontend\src\api\resume.js
 */
import request from './request';

export function getResumeList(page = 1, size = 10) {
  return request.get('/resumes', { params: { page, size } });
}

export function getResumeDetail(id) {
  return request.get(`/resumes/${id}`);
}

export function updateResume(id, data) {
  return request.put(`/resumes/${id}`, data);
}

export function uploadResume(formData) {
  return request.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
