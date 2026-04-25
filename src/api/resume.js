import request from './request';

export function getResumeList() {
  return request.get('/resumes');
}

export function getResumeDetail(id) {
  return request.get(`/resumes/${id}`);
}

export function updateResume(id, data) {
  return request.put(`/resumes/${id}`, data);
}
