// db.js - Lógica de conexão com o MongoDB e Schema do Usuário
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Definição do Schema (Modelo de Dados)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Hook (Gatilho) que criptografa a senha antes de salvar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar a senha fornecida com a senha criptografada no banco
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

// 2. Função de Conexão
const connectDB = async () => {
    try {
        // Acessa a variável de ambiente MONGO_URI
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado com Sucesso.');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        // Encerra o processo se houver falha na conexão
        process.exit(1);
    }
};

module.exports = { connectDB, User };