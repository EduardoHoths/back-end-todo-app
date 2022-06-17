# Back end Todo App

## 📜 Descrição 

Meu primeiro servidor feito em Node/Express com Typescript, suas funcionalidades são:

- Realizar o cadastro/login de usuário;
- Autenticação de usuário;
- Inserir, alterar e deletar tarefas do banco de dados em Mysql;
- Criptografar senhas;
- Criar tokens de autenticação.


## 🧰 Ferramentas Utilizadas

<table> 
  <tr>
    <td>Node</<td>
    <td>Express</<td>
    <td>Nodemon</<td>
    <td>Dotenv</<td>
    <td>Json Web Token</<td>
    <td>Bcrypt</<td>
    <td>Mysql</<td>
    <td>Cors</<td>
  </tr>
</table>

## ⚠️ Requerimentos
- [Node e NPM](http://nodejs.org)
- Mysql server, exemplo XAMPP ou Mysql Workbench

## ✨ Comandos essenciais 

- ``npm install``
- ``npm run start:dev``
- ``npm run compile:dev``

## 💻 Para rodar a aplicação, execute os seguintes passos

1. Faça um clone do repositório: ``git clone git@github.com:EduardoHoths/back-end-todo-app.git``
2. Instale as dependências: ``npm install``
3. Crie um arquivo .env na raiz do repositório
4. Dentro do arquivo .env insira as seguintes váriaveis ambiente: 
```
PORT="SUA PORTA"
HOST="HOST DO SEU BANCO DE DADOS"
USER="SEU USERNAME DO BANCO DE DADOS"
PASSWORD="SUA SENHA DO BANCO DE DADOS"
DB="O NOME DO SEU BANCO DE DADOS"
SECRET="UMA COMBINAÇÃO ALEATÓRIA DE CARACTERES PARA GERAR O TOKEN DE VERIFICAÇÃO"
```
5. Execute a aplicação com: ``npm start``

## 📋 Visualize a aplicação completa
- [Todo App](https://front-end-todo-app.vercel.app/)
