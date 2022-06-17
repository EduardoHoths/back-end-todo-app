"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mysql_1 = __importDefault(require("mysql"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const saltRounds = 10;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    app.use((0, cors_1.default)());
    next();
});
let db;
if (process.env.CLEARDB_DATABASE_URL) {
    db = mysql_1.default.createPool({
        host: process.env.HOST_PRODUCTION,
        user: process.env.USER_PRODUCTION,
        password: process.env.PASSWORD_PRODUCTION,
        database: process.env.DB_PRODUCTION,
    });
}
else {
    db = mysql_1.default.createPool({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
    });
}
app.listen(process.env.PORT, () => {
    console.log("Server is running on " + process.env.PORT);
});
app.get("/auth", (req, res) => {
    const token = req.header("token");
    try {
        const userVerified = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        if (userVerified)
            res.send({ success: true });
    }
    catch (err) {
        res.send({ success: false });
    }
});
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, resultDB) => {
        if (err) {
            res.send(err);
        }
        if (resultDB.length > 0) {
            bcrypt_1.default.compare(password, resultDB[0].password, (err, result) => {
                if (result) {
                    const TOKEN = jsonwebtoken_1.default.sign({ email: resultDB[0].email, id: resultDB[0].id }, process.env.SECRET, { expiresIn: 3600 });
                    res.send({ success: true, TOKEN });
                }
                else {
                    res.send({ msg: "Senha incorreta", success: false });
                }
            });
        }
        else {
            res.send({ msg: "Email não cadastrado", success: false });
        }
    });
});
app.post("/register", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, resultDB) => {
        if (err)
            res.send(err);
        if (resultDB.length === 0) {
            bcrypt_1.default.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    res.send(err);
                }
                db.query("INSERT INTO users (email, password) VALUES (?,?)", [email, hash], (err, result) => {
                    if (err) {
                        res.send(err);
                    }
                    res.send({ msg: "Cadastrado com sucesso", success: true });
                });
            });
        }
        else {
            res.send({ msg: "Email já cadastrado", success: false });
        }
    });
});
app.post("/newTask", (req, res) => {
    const { taskId, task } = req.body;
    const token = req.header("token");
    let userVerified;
    jsonwebtoken_1.default.verify(token, process.env.SECRET, (err) => {
        if (err) {
            // res.send({ msg: "Usuário não autorizado", success: false });
            res.send(token);
        }
        else {
            userVerified = true;
        }
    });
    if (userVerified) {
        const { email } = jsonwebtoken_1.default.decode(token);
        db.query("INSERT INTO tasks (email,task ,TaskId) VALUES (?,?,?)", [email, task, taskId], (err, resultDB) => {
            if (err) {
                res.send(err);
            }
            res.send({ success: true });
        });
    }
});
app.put("/putTask", (req, res) => {
    const { taskId, task } = req.body;
    const token = req.header("token");
    let userVerified;
    jsonwebtoken_1.default.verify(token, process.env.SECRET, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        }
        else {
            userVerified = true;
        }
    });
    if (userVerified) {
        const { email } = jsonwebtoken_1.default.decode(token);
        db.query("SELECT * FROM tasks WHERE email = ? AND TaskId = ?", [email, taskId], (err, resultDB) => {
            if (err) {
                res.send(err);
            }
            if (resultDB.length === 1) {
                db.query("UPDATE tasks SET task = ? WHERE email = ? AND TaskId = ?", [task, email, taskId], (err, result) => {
                    if (err) {
                        res.send(err);
                    }
                    res.send({ success: true });
                });
            }
        });
    }
});
app.put('/handleChecked', (req, res) => {
    const { checked, taskId } = req.body;
    const token = req.header("token");
    let userVerified;
    jsonwebtoken_1.default.verify(token, process.env.SECRET, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        }
        else {
            userVerified = true;
        }
    });
    if (userVerified) {
        const { email } = jsonwebtoken_1.default.decode(token);
        db.query("SELECT * FROM tasks WHERE email = ? AND TaskId = ?", [email, taskId], (err, resultDB) => {
            if (err) {
                res.send(err);
            }
            if (resultDB.length === 1) {
                db.query("UPDATE tasks SET checked = ? WHERE email = ? AND TaskId = ?", [checked, email, taskId], (err, result) => {
                    if (err) {
                        res.send(err);
                    }
                    res.send({ success: true });
                });
            }
        });
    }
});
app.delete("/deleteTask", (req, res) => {
    const token = req.header("token");
    const taskId = req.header("taskId");
    let userVerified;
    jsonwebtoken_1.default.verify(token, process.env.SECRET, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        }
        else {
            userVerified = true;
        }
    });
    if (userVerified) {
        const { email } = jsonwebtoken_1.default.decode(token);
        db.query("SELECT * FROM tasks WHERE TaskId = ? AND email = ?", [taskId, email], (err, resultDB) => {
            if (err) {
                res.send(err);
            }
            if (resultDB.length === 1) {
                db.query("DELETE FROM tasks WHERE TaskId = ? AND email = ?", [taskId, email], (err, result) => {
                    if (err) {
                        res.send(err);
                    }
                    res.send({ success: true });
                });
            }
            else {
                res.send({ msg: "Tarefa não encontrada", success: false });
            }
        });
    }
});
app.get("/allTasks", (req, res) => {
    const token = req.header("token");
    let userVerified;
    jsonwebtoken_1.default.verify(token, process.env.SECRET, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        }
        else {
            userVerified = true;
        }
    });
    if (userVerified) {
        const { email } = jsonwebtoken_1.default.decode(token);
        db.query("SELECT * FROM tasks WHERE email = ? ", [email], (err, resultDB) => {
            if (err) {
                res.send(err);
            }
            if (resultDB.length > 0) {
                res.send(resultDB);
            }
            else {
                res.send({ data: 0 });
            }
        });
    }
});
