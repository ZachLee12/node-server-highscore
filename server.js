const express = require('express');
const cors = require('cors');
const {Client} = require('pg');
const app = express();
const port = 3000;

// db client config
dbClientConfig = {
    user:'postgres',
    host:'localhost',
    port: 9999,
    password: '12345'
}

async function updateHighScore(highscoreValue){
    // Connect to the database
    const client = new Client(dbClientConfig);
    await client.connect()
    try {

        // Create table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS high_scores (
                highscore TEXT NOT NULL
            );
        `;
        await client.query(createTableQuery);
        console.log('Table created or already exists.');

        // Insert values into the table
        const insertQuery = 'INSERT INTO high_scores (highscore) VALUES ($1) RETURNING *';
        const res = await client.query(insertQuery, [highscoreValue]);

        console.log('Inserted:', res.rows[0]);

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        // Close the database connection
        await client.end();
    }
} 

//Enable all origins for cors to make it easier lol
app.use(cors({origin:'*'}));

app.use(express.text()); // for parsing text/plain


app.get('/highscore', async (req, res) => {
    // Connect to the database
    const client = await new Client(dbClientConfig);
    await client.connect()
    try {

        // Insert values into the table
        const getQuery = 'SELECT * FROM high_scores';
        const result = await client.query(getQuery);
        //find max val for highscore
        const highScore = Math.max(...result.rows.map(r => Number(r.highscore)))
        res.send(highScore.toString())

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        // Close the database connection
        await client.end();
    }
});


app.post('/highscore', async (req, res) => {
    const highScore = req.body;
    await updateHighScore(highScore)
    res.send(`done`);
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
