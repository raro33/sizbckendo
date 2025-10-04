// api/index.js - O Ponto de Entrada da API
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB, User } = require('../db'); 
const bcrypt = require('bcryptjs');

// 1. Inicializa o Express e conecta o DB
connectDB();
const app = express();

// 2. Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. Rotas de API
app.post('/api/cadastro', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Verifica se o usuário já existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'Este e-mail já está em uso.' });
        }

        // 2. Cria e salva novo usuário (a senha será criptografada pelo hook 'pre' em db.js)
        user = new User({ name, email, password });
        await user.save();

        // 3. Resposta de sucesso
        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        console.error('Erro no cadastro:', error.message);
        res.status(500).json({ success: false, message: 'Erro interno no servidor ao cadastrar.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verifica se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }

        // 2. Compara a senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }

        // 3. Resposta de sucesso (sem token JWT, apenas simulação de login)
        res.status(200).json({ success: true, message: 'Login realizado com sucesso!', userName: user.name });

    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ success: false, message: 'Erro interno no servidor ao fazer login.' });
    }
});

// Rota de teste para a raiz da API (útil para verificar se o Vercel está funcionando)
app.get('/api', (req, res) => {
    res.status(200).send('API SiZ está funcionando!');
});

// OBRIGATÓRIO: Exporta a aplicação Express para o Vercel Serverless
module.exports = app;