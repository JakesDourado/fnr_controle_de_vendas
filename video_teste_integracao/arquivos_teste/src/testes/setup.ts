import fs from 'fs'
import Database from 'better-sqlite3'

// Banco exclusivo para teste: o dev.db não é tocado
const arquivo = 'prisma/test.db'
process.env.DATABASE_URL = `file:./${arquivo}`
process.env.JWT_SECRET = 'segredo-de-teste'

// Recria o banco vazio a cada execução, usando a migração do projeto
if (fs.existsSync(arquivo)) fs.unlinkSync(arquivo)
const db = new Database(arquivo)
db.exec(fs.readFileSync('prisma/migrations/20260531001410_init/migration.sql', 'utf8'))
db.close()
