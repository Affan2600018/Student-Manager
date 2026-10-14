const API = "/students";

const form = document.getElementById("student-form");
const formTitle = document.getElementById("form-title");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const programInput = document.getElementById("program");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const filterInput = document.getElementById("filter");
const tableBody = document.getElementById("table-body");
const message = document.getElementById("message");
const count = document.getElementById("count");

let editingId = null;

function showMessage(text, type)
{
    message.textContent = text;
    message.className = "message " + type;
}

function hideMessage()
{
    message.textContent = "";
    message.className = "message";
}

async function request(url, options)
{
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok)
    {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

function createCell(text)
{
    const td = document.createElement("td");
    td.textContent = text;
    return td;
}

function createButton(label, className, onClick)
{
    const button = document.createElement("button");
    button.textContent = label;
    button.className = "btn " + className;
    button.addEventListener("click", onClick);
    return button;
}

function renderStudents(students)
{
    tableBody.innerHTML = "";
    count.textContent = students.length;

    if (students.length === 0)
    {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.className = "empty";
        cell.textContent = "No students found";
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    students.forEach(function (student)
    {
        const row = document.createElement("tr");

        row.appendChild(createCell(student.id));
        row.appendChild(createCell(student.name));
        row.appendChild(createCell(student.email));
        row.appendChild(createCell(student.program));

        const actions = document.createElement("td");
        actions.className = "actions-cell";

        actions.appendChild(createButton("Edit", "edit", function ()
        {
            startEdit(student);
        }));

        actions.appendChild(createButton("Delete", "delete", function ()
        {
            deleteStudent(student);
        }));

        row.appendChild(actions);
        tableBody.appendChild(row);
    });
}

async function loadStudents()
{
    const program = filterInput.value.trim();
    let url = API;

    if (program)
    {
        url += "?program=" + encodeURIComponent(program);
    }

    try
    {
        const students = await request(url);
        renderStudents(students);
    }
    catch (error)
    {
        showMessage(error.message, "error");
    }
}

function resetForm()
{
    form.reset();
    editingId = null;
    formTitle.textContent = "Add Student";
    submitBtn.textContent = "Add Student";
    cancelBtn.classList.add("hidden");
}

function startEdit(student)
{
    editingId = student.id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    programInput.value = student.program;
    formTitle.textContent = "Edit Student #" + student.id;
    submitBtn.textContent = "Update Student";
    cancelBtn.classList.remove("hidden");
    hideMessage();
    nameInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteStudent(student)
{
    if (!confirm("Delete " + student.name + "?"))
    {
        return;
    }

    try
    {
        await request(API + "/" + student.id,
        {
            method: "DELETE"
        });

        if (editingId === student.id)
        {
            resetForm();
        }

        showMessage("Student deleted", "success");
        loadStudents();
    }
    catch (error)
    {
        showMessage(error.message, "error");
    }
}

form.addEventListener("submit", async function (event)
{
    event.preventDefault();

    const body =
    {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        program: programInput.value.trim()
    };

    const isEditing = editingId !== null;
    const url = isEditing ? API + "/" + editingId : API;
    const method = isEditing ? "PUT" : "POST";

    try
    {
        await request(url,
        {
            method: method,
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        showMessage(isEditing ? "Student updated" : "Student added", "success");
        resetForm();
        loadStudents();
    }
    catch (error)
    {
        showMessage(error.message, "error");
    }
});

cancelBtn.addEventListener("click", function ()
{
    resetForm();
    hideMessage();
});

filterInput.addEventListener("input", loadStudents);

loadStudents();
