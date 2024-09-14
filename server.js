require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'https://karlusx22.github.io/Havibarber/'
}));

// Configuração do banco de dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Verifica conexão com o banco de dados
db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        process.exit(1); // Sai do processo caso haja erro na conexão
    }
    console.log('Conectado ao banco de dados!');
});

app.use(express.json());

// Rota para verificar a disponibilidade de horário
app.get('/verificar/:data/:horario', (req, res) => {
    const { data, horario } = req.params;

    const sql = SELECT * FROM agendamentos WHERE data_agendamento = ? AND horario = ?;
    db.query(sql, [data, horario], (err, results) => {
        if (err) {
            console.error('Erro ao verificar disponibilidade', err);
            return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
        }
        res.json({ disponivel: results.length === 0 }); // Retorna 'true' se não houver resultados (disponível)
    });
});

// Rota para reservar o horário
app.post('/reservar', (req, res) => {
    const { nome, telefone, data, horario, servico, preco } = req.body;

    // Verificar se o horário já está reservado
    const verificarSql = SELECT * FROM agendamentos WHERE data_agendamento = ? AND horario = ?;
    db.query(verificarSql, [data, horario], (err, results) => {
        if (err) {
            console.error('Erro ao verificar disponibilidade', err);
            return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
        }

        // Se o horário já estiver reservado, retornar um erro
        if (results.length > 0) {
            return res.status(400).json({ error: 'Horário já reservado' });
        }

        // Inserir novo agendamento
        const insertSql = INSERT INTO agendamentos (nome, telefone, servico, preco, data_agendamento, horario) VALUES (?, ?, ?, ?, ?, ?);
        db.query(insertSql, [nome, telefone, servico, preco, data, horario], (err) => {
            if (err) {
                console.error('Erro ao inserir agendamento', err);
                return res.status(500).json({ error: 'Erro ao inserir agendamento' });
            }
            res.json({ message: 'Horário reservado com sucesso!' });
        });
    });
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
    console.log(Servidor rodando na porta ${PORT});
});
