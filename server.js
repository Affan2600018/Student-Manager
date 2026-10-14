const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const file = path.join(__dirname, "students.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadStudents()
{
    if (!fs.existsSync(file))
    {
        return [];
    }

    const text = fs.readFileSync(file, "utf8");

    if (!text.trim())
    {
        return [];
    }

    return JSON.parse(text);
}

function saveStudents(students)
{
    fs.writeFileSync(file, JSON.stringify(students, null, 2));
}

function isText(value)
{
    return typeof value === "string" && value.trim() !== "";
}

app.get("/students", function (req, res)
{
    let students = loadStudents();
    const program = req.query.program;

    if (program)
    {
        students = students.filter(function (s)
        {
            return s.program.toLowerCase() === String(program).toLowerCase();
        });
    }

    res.json(students);
});

app.get("/students/:id", function (req, res)
{
    const id = Number(req.params.id);

    const student = loadStudents().find(function (s)
    {
        return s.id === id;
    });

    if (!student)
    {
        return res.status(404).json({ message: "Not found" });
    }

    res.json(student);
});

app.post("/students", function (req, res)
{
    const body = req.body || {};
    const { name, email, program } = body;

    if (!isText(name) || !isText(email) || !isText(program))
    {
        return res.status(400).json({ message: "All fields needed" });
    }

    if (!email.includes("@"))
    {
        return res.status(400).json({ message: "Email is not valid" });
    }

    const students = loadStudents();
    const last = students[students.length - 1];
    const id = last ? last.id + 1 : 1;

    const student =
    {
        id: id,
        name: name.trim(),
        email: email.trim(),
        program: program.trim()
    };

    students.push(student);
    saveStudents(students);

    res.status(201).json(student);
});

app.put("/students/:id", function (req, res)
{
    const id = Number(req.params.id);
    const students = loadStudents();

    const student = students.find(function (s)
    {
        return s.id === id;
    });

    if (!student)
    {
        return res.status(404).json({ message: "Not found" });
    }

    const body = req.body || {};

    if (body.email !== undefined && (!isText(body.email) || !body.email.includes("@")))
    {
        return res.status(400).json({ message: "Email is not valid" });
    }

    if (body.name !== undefined && !isText(body.name))
    {
        return res.status(400).json({ message: "Name is not valid" });
    }

    if (body.program !== undefined && !isText(body.program))
    {
        return res.status(400).json({ message: "Program is not valid" });
    }

    if (body.name)
    {
        student.name = body.name.trim();
    }
    if (body.email)
    {
        student.email = body.email.trim();
    }
    if (body.program)
    {
        student.program = body.program.trim();
    }

    saveStudents(students);
    res.json(student);
});

app.delete("/students/:id", function (req, res)
{
    const id = Number(req.params.id);
    const students = loadStudents();

    const index = students.findIndex(function (s)
    {
        return s.id === id;
    });

    if (index === -1)
    {
        return res.status(404).json({ message: "Not found" });
    }

    students.splice(index, 1);
    saveStudents(students);

    res.json({ message: "Deleted" });
});

app.use(function (err, req, res, next)
{
    if (err.type === "entity.parse.failed")
    {
        return res.status(400).json({ message: "Invalid JSON" });
    }

    res.status(500).json({ message: "Server error" });
});

app.listen(3000, function ()
{
    console.log("Running at http://localhost:3000");
});
