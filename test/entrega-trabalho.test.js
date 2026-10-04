import { readFileSync } from 'node:fs';
import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin, loginAluno } from './helpers/login.js';
const dados = JSON.parse(readFileSync(new URL('./data/cenarios.json', import.meta.url), 'utf8'));
for (const cenario of dados.cenarios) {
  describe(`Fluxo completo: ${cenario.nome}`, () => {
    it('admin cadastra e matricula aluno; aluno faz login e entrega trabalho', async () => {
      const admin = await loginAdmin(dados.admin);
      const cadastro = await request(app).post('/api/admin/alunos')
        .auth(admin.token, { type: 'bearer' }).send(cenario.aluno).expect(201);
      const alunoId = cadastro.body.id;
      expect(alunoId).to.be.a('string').and.not.empty;
      expect(cadastro.body).to.include({ nome: cenario.aluno.nome, email: cenario.aluno.email,
        matricula: cenario.aluno.matricula, role: 'aluno' });
      expect(cadastro.body).not.to.have.property('senha');
      const aluno = await loginAluno({ email: cenario.aluno.email, senha: cenario.aluno.senha });
      expect(aluno.usuario.id).to.equal(alunoId);
      await request(app).post(`/api/alunos/${alunoId}/trabalhos`)
        .auth(aluno.token, { type: 'bearer' }).send(cenario.trabalho).expect(409);
      const matricula = await request(app)
        .post(`/api/admin/disciplinas/${cenario.trabalho.disciplinaId}/matriculas`)
        .auth(admin.token, { type: 'bearer' }).send({ alunoId }).expect(201);
      expect(matricula.body).to.include({ alunoId, disciplinaId: cenario.trabalho.disciplinaId });
      await request(app).post(`/api/alunos/${alunoId}/trabalhos`).send(cenario.trabalho).expect(401);
      await request(app).post('/api/admin/alunos')
        .auth(aluno.token, { type: 'bearer' }).send(cenario.aluno).expect(403);
      const entrega = await request(app).post(`/api/alunos/${alunoId}/trabalhos`)
        .auth(aluno.token, { type: 'bearer' }).send(cenario.trabalho).expect(201);
      expect(entrega.body).to.include({ ...cenario.trabalho, alunoId, status: 'entregue' });
      expect(entrega.body.id).to.be.a('string').and.not.empty;
      expect(Number.isNaN(Date.parse(entrega.body.dataEntrega))).to.equal(false);
      const consulta = await request(app).get(`/api/alunos/${alunoId}/trabalhos`)
        .auth(aluno.token, { type: 'bearer' }).expect(200);
      expect(consulta.body.map((trabalho) => trabalho.id)).to.include(entrega.body.id);
      await request(app).get('/api/alunos/aluno-ana-souza/trabalhos')
        .auth(aluno.token, { type: 'bearer' }).expect(403);
    });
  });
}
