const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const login = await prisma.login.findUnique({
      where: { email },
      include: { professor: true },
    });

    if (!login || login.senha !== senha) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    res.status(200).json({
      professor: login.professor,
      message: 'Login bem-sucedido',
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

app.get('/professores', async (req, res) => {
  try {
    const professores = await prisma.professor.findMany({
      include: { login: true } 
    });
    res.status(200).json(professores);
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    res.status(500).json({ message: 'Erro ao buscar professores.' });
  }
});


app.post('/professores', async (req, res) => {
  const { nome, email, cpf, telefone, senha } = req.body;

  try {
    const professor = await prisma.professor.create({
      data: {
        nome,
        email,
        cpf,
        telefone,
        login: {
          create: {
            email,
            senha,
          },
        },
      },
    });

    res.status(201).json(professor);
  } catch (error) {
    console.error('Erro ao cadastrar professor:', error);
    res.status(500).json({ message: 'Erro ao cadastrar professor.' });
  }
});

app.post('/turmas', async (req, res) => {
  const { nome, numero, professor_id } = req.body;

  if (!nome || numero === undefined || !professor_id) {
    return res.status(400).json({ message: "Dados incompletos" });
  }

  try {
    // garantir que 'numero' seja um inteiro
    const turma = await prisma.turma.create({
      data: {
        nome,
        numero: parseInt(numero, 10), 
        professor: {
          connect: {
            id: professor_id
          }
        }
      }
    });

    res.status(201).json(turma);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar turma", error });
  }
});

app.get('/professores/:id/turmas', async (req, res) => {
  const { id } = req.params;

  try {
    const turmas = await prisma.turma.findMany({
      where: { professorId: parseInt(id) },
      include: { atividades: true },
    });

    res.status(200).json(turmas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar turmas.' });
  }
});


app.delete('/turmas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.turma.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Turma excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir turma.' });
  }
});


app.post('/atividades', async (req, res) => {
  const { nome, descricao, data, turmaId } = req.body;

  try {
    const atividade = await prisma.atividade.create({
      data: {
        nome,
        descricao,
        data: new Date(data),
        turma: {
          connect: { id: turmaId },
        },
      },
    });

    res.status(201).json(atividade);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar atividade.' });
  }
});

app.get('/turmas/:id/atividades', async (req, res) => {
  const { id } = req.params;

  try {
    const atividades = await prisma.atividade.findMany({
      where: { turmaId: parseInt(id) },
      orderBy: { data: 'asc' },
    });

    res.status(200).json(atividades);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar atividades.' });
  }
});


app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout efetuado com sucesso.' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
