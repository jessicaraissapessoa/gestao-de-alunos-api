import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
async function login(credenciais, role) {
  const resposta = await request(app).post('/api/auth/login').send(credenciais).expect(200);
  expect(resposta.body.token).to.be.a('string').and.not.empty;
  expect(resposta.body.usuario).to.include({ email: credenciais.email, role });
  expect(resposta.body.usuario.id).to.be.a('string').and.not.empty;
  expect(resposta.body.usuario).not.to.have.property('senha');
  return resposta.body;
}
export const loginAdmin = (credenciais) => login(credenciais, 'admin');
export const loginAluno = (credenciais) => login(credenciais, 'aluno');
