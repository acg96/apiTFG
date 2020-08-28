db.createUser(
 {
	user: "<usernameDB>",
	pwd: "<passwordDB>",
	roles: [ { role: "userAdminAnyDatabase", db: "admin" }, { role: "readWrite", db: "tfg" }, { role: "dbAdmin", db: "tfg" }, { role: "dbOwner", db: "tfg" }, { role: "userAdmin", db: "tfg" } ]
 }
);
