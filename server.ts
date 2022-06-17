import express, { Response, Request } from "express";
import cors from "cors";
import mysql from "mysql";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = 10;
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    app.use(cors());
    next();
});

const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on " + process.env.PORT);
});

app.get("/auth", (req: Request, res: Response) => {
    const token = req.header("token");

    try {
        const userVerified = jwt.verify(token!, process.env.SECRET!);
        if (userVerified) res.send({ success: true });
    } catch (err) {
        res.send({ success: false });
    }
});

app.post("/login", (req: Request, res: Response) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, resultDB) => {
        if (err) {
            res.send(err);
        }

        if (resultDB.length > 0) {
            bcrypt.compare(password, resultDB[0].password, (err, result) => {
                if (result) {
                    const TOKEN = jwt.sign(
                        { email: resultDB[0].email, id: resultDB[0].id },
                        process.env.SECRET!,
                        { expiresIn: 3600 }
                    );

                    res.send({ success: true, TOKEN });
                } else {
                    res.send({ msg: "Senha incorreta", success: false });
                }
            });
        } else {
            res.send({ msg: "Email não cadastrado", success: false });
        }
    });
});

app.post("/register", (req: Request, res: Response) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, resultDB) => {
        if (err) res.send(err);

        if (resultDB.length === 0) {
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    res.send(err);
                }

                db.query(
                    "INSERT INTO users (email, password) VALUES (?,?)",
                    [email, hash],
                    (err, result) => {
                        if (err) {
                            res.send(err);
                        }

                        res.send({ msg: "Cadastrado com sucesso", success: true });
                    }
                );
            });
        } else {
            res.send({ msg: "Email já cadastrado", success: false });
        }
    });
});

app.post("/newTask", (req: Request, res: Response) => {
    const { taskId, task } = req.body;
    const token = req.header("token");

    let userVerified;

    jwt.verify(token!, process.env.SECRET!, (err) => {
        if (err) {
            // res.send({ msg: "Usuário não autorizado", success: false });
            res.send(token);
        } else {
            userVerified = true;
        }
    });

    if (userVerified) {
        const { email }: any = jwt.decode(token!);

        db.query(
            "INSERT INTO tasks (email,task ,TaskId) VALUES (?,?,?)",
            [email, task, taskId],
            (err, resultDB) => {
                if (err) {
                    res.send(err);
                }
                res.send({ success: true });
            }
        );
    }
});

app.put("/putTask", (req: Request, res: Response) => {
    const { taskId, task } = req.body;
    const token = req.header("token");
    let userVerified;

    jwt.verify(token!, process.env.SECRET!, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        } else {
            userVerified = true;
        }
    });

    if (userVerified) {
        const { email }: any = jwt.decode(token!);
        db.query(
            "SELECT * FROM tasks WHERE email = ? AND TaskId = ?",
            [email, taskId],
            (err, resultDB) => {
                if (err) {
                    res.send(err);
                }
                if (resultDB.length === 1) {
                    db.query(
                        "UPDATE tasks SET task = ? WHERE email = ? AND TaskId = ?",
                        [task, email, taskId],
                        (err, result) => {
                            if (err) {
                                res.send(err);
                            }
                            res.send({ success: true });
                        }
                    );
                }
            }
        );
    }
});

app.put('/handleChecked', (req: Request, res: Response) => {
    const { checked, taskId } = req.body;
    const token = req.header("token");
    let userVerified;

    jwt.verify(token!, process.env.SECRET!, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        } else {
            userVerified = true;
        }
    });

    if (userVerified) {
        const { email }: any = jwt.decode(token!);
        db.query(
            "SELECT * FROM tasks WHERE email = ? AND TaskId = ?",
            [email, taskId],
            (err, resultDB) => {
                if (err) {
                    res.send(err);
                }
                if (resultDB.length === 1) {
                    db.query(
                        "UPDATE tasks SET checked = ? WHERE email = ? AND TaskId = ?",
                        [checked, email, taskId],
                        (err, result) => {
                            if (err) {
                                res.send(err);
                            }
                            res.send({ success: true });
                        }
                    );
                }
            }
        );
    }
})

app.delete("/deleteTask", (req: Request, res: Response) => {
    const token = req.header("token");
    const taskId = req.header("taskId");
    let userVerified;

    jwt.verify(token!, process.env.SECRET!, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        } else {
            userVerified = true;
        }
    });

    if (userVerified) {
        const { email }: any = jwt.decode(token!);
        db.query(
            "SELECT * FROM tasks WHERE TaskId = ? AND email = ?",
            [taskId, email],
            (err, resultDB) => {
                if (err) {
                    res.send(err);
                }
                if (resultDB.length === 1) {
                    db.query(
                        "DELETE FROM tasks WHERE TaskId = ? AND email = ?",
                        [taskId, email],
                        (err, result) => {
                            if (err) {
                                res.send(err);
                            }
                            res.send({ success: true });
                        }
                    );
                } else {
                    res.send({ msg: "Tarefa não encontrada", success: false });
                }
            }
        );
    }
});

app.get("/allTasks", (req: Request, res: Response) => {
    const token = req.header("token");
    let userVerified;

    jwt.verify(token!, process.env.SECRET!, (err) => {
        if (err) {
            res.send({ msg: "Usuário não autorizado", success: false });
        } else {
            userVerified = true;
        }
    });

    if (userVerified) {
        const { email }: any = jwt.decode(token!);

        db.query("SELECT * FROM tasks WHERE email = ? ", [email], (err, resultDB) => {
            if (err) {
                res.send(err);
            }
            if (resultDB.length > 0) {
                res.send(resultDB);
            } else {
                res.send({ data: 0 });
            }
        });
    }
});
