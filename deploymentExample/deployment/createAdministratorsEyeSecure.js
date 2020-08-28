db.users.insertOne(
 {
	username: "<softwareAdministratorUsername>",
	password: "<softwareAdministratorPasswordHashedSha256WithNodeJSpassword>",
	role: "administrator"
 }
);
