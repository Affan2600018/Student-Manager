const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "notes.json");

function loadNotes()
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

    try
    {
        return JSON.parse(text);
    }
    catch (error)
    {
        return [];
    }
}

function saveNotes(notes)
{
    fs.writeFileSync(file, JSON.stringify(notes, null, 2));
}

function showHelp()
{
    console.log("Wrong command.");
    console.log("Use one of these:");
    console.log("  node notes.js add \"Buy milk\"");
    console.log("  node notes.js list");
    console.log("  node notes.js clear");
}

const command = process.argv[2];
const text = process.argv.slice(3).join(" ").trim();

if (command === "add")
{
    if (!text)
    {
        console.log("Please write the note text.");
        console.log("Example: node notes.js add \"Buy milk\"");
    }
    else
    {
        const notes = loadNotes();
        notes.push(text);
        saveNotes(notes);
        console.log("Note added: " + text);
    }
}
else if (command === "list")
{
    const notes = loadNotes();

    if (notes.length === 0)
    {
        console.log("No notes yet.");
    }
    else
    {
        notes.forEach(function (note, index)
        {
            console.log((index + 1) + ". " + note);
        });
    }
}
else if (command === "clear")
{
    saveNotes([]);
    console.log("All notes cleared.");
}
else
{
    showHelp();
}
