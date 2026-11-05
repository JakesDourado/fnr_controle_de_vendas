import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app'
import prisma from '../config/prisma'

const token = jwt.sign({ sub: 'admin@vendas.com', id: 1 }, process.env.JWT_SECRET!)
const auth = { Authorization: `Bearer ${token}` }

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Integração: rota /categorias + JWT + controller + banco', () => {
  test('deve recusar acesso sem token (401)', async () => {
    const res = await request(app).get('/categorias')
    expect(res.status).toBe(401)
  })

  test('deve cadastrar a categoria e gravar no banco (201)', async () => {
    const res = await request(app).post('/categorias').set(auth).send({ nome: 'Bebidas' })
    expect(res.status).toBe(201)
    const noBanco = await prisma.categoria.findUnique({ where: { nome: 'Bebidas' } })
    expect(noBanco).not.toBeNull()
  })

  test('deve listar a categoria cadastrada (200)', async () => {
    const res = await request(app).get('/categorias').set(auth)
    expect(res.status).toBe(200)
    expect(res.body[0].nome).toBe('Bebidas')
  })

  test('deve recusar categoria duplicada (400)', async () => {
    const res = await request(app).post('/categorias').set(auth).send({ nome: 'Bebidas' })
    expect(res.status).toBe(400)
    expect(res.body.detail).toBe('Categoria já cadastrada')
  })
})
