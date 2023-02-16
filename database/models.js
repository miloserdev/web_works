const utils = require("./utils.js");

class User {
		constructor (first_name, last_name, middle_name, birth_day, sex) {
			if ( !utils.not_null(first_name) ) throw "first_name must be not null";
			if ( !utils.is_type(first_name, "string") ) throw "first_name must be string";
			this.first_name = first_name;

			if ( !utils.not_null(last_name) ) throw "last_name must be not null";
			if ( !utils.is_type(last_name, "string") ) throw "last_name must be string";
			this.last_name = last_name;

			if ( !utils.not_null(middle_name) ) throw "middle_name must be not null";
			if ( !utils.is_type(middle_name, "string") ) throw "middle_name must be string";
			this.middle_name = middle_name;

			if ( !utils.not_null(birth_day) ) throw "birth_day must be not null";
			if ( !utils.is_type(birth_day, "object") ) throw "birth_day must be object";
			this.birth_day = birth_day;

			if ( !utils.not_null(sex) ) throw "sex must be not null";
			if ( !utils.is_type(sex, "number") ) throw "sex must be number";
			this.sex = sex;		// 1-male | 2-female
		}

		data() {
			return {
				first_name: this.first_name,
				last_name: this.last_name,
				middle_name: this.middle_name,
				birth_day: this.birth_day,
				sex: this.sex
			}
		}
}


module.exports = {
	User
}