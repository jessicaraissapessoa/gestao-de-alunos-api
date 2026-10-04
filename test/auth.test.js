import request from 'supertest';
import { expect } from 'chai';
import { readFileSync } from 'node:fs';
import app from '../src/app.js';
import { loginAdmin } from './helpers/login.js';
const dados = JSON.parse(readFileSync(new URL('./data/cenarios.json', import.meta.url), 'utf8'));
describe('Login do administrador', () => {
  it('retorna token e perfil admin com credenciais válidas', async () => {
    await loginAdmin(dados.admin);
  });
  it('rejeita senha inválida', async () => {
    const resposta = await request(app).post('/api/auth/login').send(dados.loginInvalido).expect(401);
    expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
  });
});
