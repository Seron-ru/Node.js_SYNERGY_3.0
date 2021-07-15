const express = require('express');
const path = require('path');
const mysql = require("mysql2");
const dotenv = require('dotenv');
var app = express();
var crypto = require("crypto");

dotenv.config({ path: './.env' });


const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = express.json();


app.get("/register", urlencodedParser, function (request, response) {
	response.sendFile(__dirname + "/views/register.html");
});
app.post("/register", urlencodedParser, function (request, response) {
	if (!request.body) return response.sendStatus(400);
	var data = request.body;
	var arr = JSON.parse(JSON.stringify(data));



	const connection = mysql.createConnection({
		host: process.env.DATABASE_HOST,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE
	});

	const publicDirectory = path.join(__dirname, './public');
	app.use(express.static(publicDirectory));
	app.set('view engine', 'hbs');


	// тестирование подключения
	connection.connect(function (err) {
		if (err) {
			return console.error("Ошибка: " + err.message);
		}
		else {
			console.log("Подключение MySQL установилось");
		}
	});



	const sqlCreate = `create table if not exists usersnp2(
    id int primary key auto_increment,
    userLogin varchar(300),
    userSurname varchar(300),
    userName varchar(300),
    userPatron varchar(300) ,
    userPassSer int,
    userPassNum int,
	Password varchar(300) unique
)`;

	
	const subpassword = RandomPassword();
	var hash = crypto.createHash("sha512");
	//console.log(subpassword);
	data = hash.update(subpassword, "utf-8");
	genHash = data.digest("hex");
	password = genHash;


	connection.query(sqlCreate, function (err, results) {
		if (err) console.log(err);
		else console.log("Таблица создана");
	});

	const user = [arr.userLogin, arr.userSurname, arr.userName, arr.userPatron, arr.userPassSer, arr.userPassNum, password];

	const sql1 = "INSERT INTO usersnp2(userLogin, userSurname, userName, UserPatron, userPassSer, userPassNum, password) VALUES(?, ?, ?, ?, ?, ?, ?)";
	connection.query(sql1, user, function (err, result) {
		if (err) console.log(err);
		else console.log("Данные добавлены");
	});

	// закрытие подключения
	connection.end(function (err) {
		if (err) {
			return console.log("Ошибка: " + err.message);
		}
		console.log("Подключение закрыто");
	});
});

function RandomPassword() {
	var StringPassword = "",
		StringSymbols = "1234567890qwertyuiopasdfghjklzxcvbnm",
		CountRandom = 10;
	for (var i = 0; i < CountRandom; i++) {
		Random = Math.round(Math.random() * StringSymbols.length);
		var RandomUpper = Math.round(Math.random() * 10);
		if (RandomUpper >= 5) { StringPassword += StringSymbols[Random]; }
		if (RandomUpper < 5) { StringPassword += StringSymbols[Random]; }
	}
	return (StringPassword);
}

app.get("/", (req, res) => {
	res.render("index");
})

app.listen(3000, () => {
	console.log("Сервер запустился по этой ссылке: http://localhost:3000");
	console.log("Чтобы зарегистрироваться, вот ссылка: http://localhost:3000/register");
	console.log("Войти в свой профиль можно по этой ссылке: http://localhost:3000/");
})