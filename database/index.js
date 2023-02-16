( main = async () => {
	
	const low = require('lowdb'); // == v1.0.0
	const FileSync = require('lowdb/adapters/FileSync');
	const db = low(new FileSync('./data/db.json'));

	const db_fast = low(new FileSync('./data/db_fast.json'));
	let users = db_fast.get("users").cloneDeep().value();

	const models = require("./models.js");
	const utils = require("./utils.js");

	/* WHEN HACKER ATTACKS JUST UNCOMMENT ;) */
	//db.defaults({ users: [] }).write();

	let argv = process.argv;
	let param = argv[2];
		param = parseInt( param );
	console.log( `param -> ${param}` );
	try {
		switch (param) {
			case 1: {
				console.log( "1 just run;" );
				break;
			}
			case 2: {
				console.log( "2 user creation;" );
				let [fn, ln, mn] = String(argv[3]).split(" ");
				let date = new Date(argv[4]);
				let sex = ( String(argv[5]).toLowerCase() == "male" ? 1 : 2 );
				let user = new models.User(fn, ln, mn, date, sex);
				//db.get("users").push(user).write();
				console.log(user.data())
				break;
			}
			case 3: {
				console.log( "3 get unique users sorted by names;" );
				let tmp = {};
				let unique = [];
				db.get("users").value().forEach( u => {
					let sum = urils.hashsum( String(u.first_name, u.last_name, u.middle_name, u.birth_date) );
					console.log(sum)
					tmp[sum] = u;
				});
				Object.keys(tmp).forEach( (t, u) => {
					unique.push(tmp[t]);
				})
				unique.sort( (a, b) => {
					let afns = [a.first_name, a.last_name, a.middle_name].sort()[0];
					let bfns = [b.first_name, b.last_name, b.middle_name].sort()[0];
					//let ffns = [afns, bfns].sort()[0];
					return ( bfns > afns ) ? -1 : 1;
				})
				unique.forEach( u => {
					console.log(
						` ${u.first_name} ${u.last_name} ${u.middle_name} ${u.sex == 1 ? "male" : "female"} ${ new Date().getFullYear() - new Date(u.birth_day).getFullYear()}`
					)
				})
				break;
			}
			case 4: {
				console.log( "4 generate 1.000.000 users;" );
				for (let i = 0; i < 1000000; i++) {
					let [f, l, m, d, s] = utils.generateUser();
					//if (i < 100) f = "F" + f; l = "F" + l; m = "F" + m;
					//console.log( f, l, m, d, s );
					let user = new models.User(f, l, m, d, s);
					db.get("users").push(user).write();
				}
				break;
			}
			case 5: {
				console.time( "5" );
				console.log( "5 get all F prefixed male users with time benchmark;" );
				let users = db.get("users").value();
				users = users.filter( u => u.sex == 1 && u.first_name[0] == "F" && u.last_name[0] == "F" && u.middle_name[0] == "F" );
			/*
				users.forEach(u => {
					console.log(
						` ${u.first_name} ${u.last_name} ${u.middle_name} ${u.sex == 1 ? "male" : "female"} ${ new Date().getFullYear() - new Date(u.birth_day).getFullYear()}`
					)
				});
			*/
				console.timeEnd( "5" );
				break;

				/*
					время исполнения с console.log -> 14.370ms - 17.410ms ;
					время исполнения без console.log -> 1.99ms - 2.760ms ;
				*/
			}
			case 6: {
				console.time( "6" );
				console.log( "6 do it faster!;" );
				users = users.filter( u => u.s == 1 && u.f[0] == "F" && u.l[0] == "F" && u.m[0] == "F" );
			/*
				users.forEach(u => {
					console.log(
						` ${u.f} ${u.l} ${u.m} ${u.s == 1 ? "male" : "female"} ${new Date().getFullYear() - new Date(u.b).getFullYear()}`
					)
				});
			*/
				console.timeEnd( "6" );
				break;

				/*
					время исполнения с console.log -> 11.770ms - 15.050ms ;
					время исполнения без console.log -> 1.550ms - 1.750ms ;
					уменьшив количество символов мы ускоряем запись файла в оперативную память и чтение из неё;
					запрос к данным из оперативной памяти затрачивает меньше процессорного времени, чем чтение с носителя;
				*/
				
			}
		}
	} catch (e) {
		console.log("error", e);
	}
	
})();