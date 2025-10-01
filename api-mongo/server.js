require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão MongoDB
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("meuAppDB");
    console.log("✅ Conectado ao MongoDB Atlas!");
  } catch (err) {
    console.error("Erro de conexão:", err);
  }
}
connectDB();

// Rotas da API
app.get("/", (req, res) => {
  res.send("API MongoDB funcionando! 🚀");
});

// Buscar todos usuários
app.get("/usuarios", async (req, res) => {
  const usuarios = await db.collection("usuarios").find().toArray();
  res.json(usuarios);
});

// Adicionar usuário
app.post("/usuarios", async (req, res) => {
  const { nome, idade } = req.body;
  const result = await db.collection("usuarios").insertOne({ nome, idade });
  res.json(result);
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));
