require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'https://karlusx22.github.io/Havibarber/'
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao banco de dados!');
});

app.use(cors());
app.use(express.json());

app.get('/verificar/:data/:horario', (req, res) => {
    const { data, horario } = req.params;

    const sql = SELECT * FROM agendamentos WHERE data_agendamento = ? AND horario = ?;
    db.query(sql, [data, horario], (err, results) => {
        if (err) {
            console.error('Erro ao verificar disponibilidade', err);
            return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
        }
        res.json({ disponivel: results.length === 0 });
    });
});

app.post('/reservar', (req, res) => {
    const { nome, telefone, data, horario, servico, preco } = req.body;

    const verificarSql = SELECT * FROM agendamentos WHERE data_agendamento = ? AND horario = ?;
    db.query(verificarSql, [data, horario], (err, results) => {
        if (err) {
            console.error('Erro ao verificar disponibilidade', err);
            return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Horário já reservado' });
        }

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

app.listen(PORT, () => {
    console.log(Servidor rodando na porta ${PORT});
});
