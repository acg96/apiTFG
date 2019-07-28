module.exports = {
    app: null,
    bdManagement: null,
    logger: null,
    init: function (app, bdManagement, logger) {
        this.app = app;
        this.bdManagement = bdManagement;
        this.logger = logger;
    },
    generateData: function () {
        var user1 = {
            username: "UO111111",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "student",
            name: "Daniel",
            lastName: "González"
        };
        var user2 = {
            username: "UO222222",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "student",
            name: "Sara",
            lastName: "Carrión"
        };
        var user3 = {
            username: "profesorEjemplo",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Ejemplo",
            lastName: "Profesor"
        };
        var user4 = {
            username: "rolInexistente",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "noExiste",
            name: "Rol",
            lastName: "Inexistente"
        };


        this.logger.info("The user " + user1.username + " has been generated");
        this.bdManagement.addUser(user1, function (id) {
        });
        this.logger.info("The user " + user2.username + " has been generated");
        this.bdManagement.addUser(user2, function (id) {
        });
        this.logger.info("The user " + user3.username + " has been generated");
        this.bdManagement.addUser(user3, function (id) {
        });
        this.logger.info("The user " + user4.username + " has been generated");
        this.bdManagement.addUser(user4, function (id) {
        });
    }
}
