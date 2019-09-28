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
            username: "PROFESOREJEMPLO",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Ejemplo",
            lastName: "Profesor"
        };
        var user4 = {
            username: "ROLINEXISTENTE",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "noExiste",
            name: "Rol",
            lastName: "Inexistente"
        };

        var user5 = {
            username: "MARGA",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("1318").digest('hex'),
            role: "student",
            name: "Margarita",
            lastName: "García"
        };

        var user6 = {
            username: "BELEN",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("2201").digest('hex'),
            role: "student",
            name: "Belén",
            lastName: "Casillas"
        };

        var user7 = {
            username: "ALEX",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("1234").digest('hex'),
            role: "student",
            name: "Alejandro",
            lastName: "Puente"
        };

        var user8 = {
            username: "PROFESOREJEMPLO2",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Paco",
            lastName: "Rodríguez"
        };

        var user9 = {
            username: "PROFESOREJEMPLO3",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Lucía",
            lastName: "Vázquez"
        };

        var user10 = {
            username: "UO333333",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('key'))
                .update("123456").digest('hex'),
            role: "student",
            name: "Laura",
            lastName: "Méndez"
        };

        var group1 = {
            name: "SSI-grupo1",
            professors: ["PROFESOREJEMPLO", "PROFESOREJEMPLO2"],
            students: ["BELEN", "UO111111", "MARGA", "ALEX"],
            moduleDecription: "Seguridad de Sistemas Informáticos"
        };

        var group2 = {
            name: "SDI-grupo1",
            professors: ["PROFESOREJEMPLO3"],
            students: ["UO222222"],
            moduleDecription: "Sistemas Distribuidos e Internet"
        };

        var group3 = {
            name: "DLP-grupo1",
            professors: ["PROFESOREJEMPLO"],
            students: ["UO333333"],
            moduleDecription: "Diseño de Lenguajes de Programación"
        };

        //startTime-> 28/09/2019 9:30:00
        //endTime-> 02/10/2019 9:30:00
        var slot1 = {
            description: "examen 1 de ssi",
            startTime: 1569655800000,
            endTime: 1570001400000,
            listMode: "whitelist",
            urls: ["https://www.google.com/", "http://www.uniovi.es/", "https://es.wikipedia.org"],
            groupName: group1.name,
            groupId: ""
        };

        //startTime-> 28/09/2019 9:30:00
        //endTime-> 02/10/2019 9:30:00
        var slot2 = {
            description: "practica 1 de sdi",
            startTime: 1569655800000,
            endTime: 1570001400000,
            listMode: "blacklist",
            urls: ["https://es.yahoo.com/", "https://elpais.com/"],
            groupName: group2.name,
            groupId: ""
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
        this.logger.info("The user " + user5.username + " has been generated");
        this.bdManagement.addUser(user5, function (id) {
        });
        this.logger.info("The user " + user6.username + " has been generated");
        this.bdManagement.addUser(user6, function (id) {
        });
        this.logger.info("The user " + user7.username + " has been generated");
        this.bdManagement.addUser(user7, function (id) {
        });
        this.logger.info("The user " + user8.username + " has been generated");
        this.bdManagement.addUser(user8, function (id) {
        });
        this.logger.info("The user " + user9.username + " has been generated");
        this.bdManagement.addUser(user9, function (id) {
        });
        this.logger.info("The user " + user10.username + " has been generated");
        this.bdManagement.addUser(user10, function (id) {
        });

        this.logger.info("The group " + group1.name + " has been generated");
        this.bdManagement.addClassGroup(group1, function (id) {
            if (id != null){
                this.logger.info("The slot [" + slot1.description + "] has been generated");
                slot1.groupId= id;
                this.bdManagement.addSlot(slot1, function (id) {
                });
            }
        }.bind(this));
        this.logger.info("The group " + group2.name + " has been generated");
        this.bdManagement.addClassGroup(group2, function (id) {
            if (id != null){
                this.logger.info("The slot [" + slot2.description + "] has been generated");
                slot2.groupId= id;
                this.bdManagement.addSlot(slot2, function (id) {
                });
            }
        }.bind(this));
        this.logger.info("The group " + group3.name + " has been generated");
        this.bdManagement.addClassGroup(group3, function (id) {
        });
    }
}
