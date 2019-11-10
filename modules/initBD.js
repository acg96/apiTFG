module.exports = {
    app: null,
    bdManagement: null,
    logger: null,
    init: function (app, bdManagement, logger) {
        this.app = app;
        this.bdManagement = bdManagement;
        this.logger = logger;
    },
    /*addJustGroupsAndModules: function(){
        const module1 = {
            name: "Seguridad de Sistemas Informáticos",
            code: "GIISOF01-3-010",
            year: "3",
            term: "2",
            groupsIds: ["5db46a45a579e44bc8ee5bc5", "5db46a45a579e44bc8ee5bc1"]
        };

        const module2 = {
            name: "Sistemas Distribuidos e Internet",
            code: "GIISOF01-3-005",
            year: "3",
            term: "2",
            groupsIds: ["5db46a45a579e44bc8ee5bc3", "5db46a45a579e44bc8ee5bc2"]
        };

        const module3 = {
            name: "Diseño de Lenguajes de Programación",
            code: "GIISOF01-3-009",
            year: "3",
            term: "2",
            groupsIds: ["5db46a45a579e44bc8ee5bcd"]
        };

        const group1 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc5"),
            name: "SSI-grupo1",
            professors: ["PROFESOREJEMPLO", "PROFESOREJEMPLO2"],
            students: ["BELEN", "UO111111", "UO222222", "ALEX"]
        };

        const group2 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc3"),
            name: "SDI-grupo1",
            professors: ["PROFESOREJEMPLO3"],
            students: ["MARGA"]
        };

        const group3 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bcd"),
            name: "DLP-grupo1",
            professors: ["PROFESOREJEMPLO"],
            students: ["UO333333", "BELEN"]
        };

        const group4 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc2"),
            name: "SDI-grupo2",
            professors: ["PROFESOREJEMPLO3"],
            students: ["BELEN", "UO111111"]
        };

        const group5 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc1"),
            name: "SSI-grupo2",
            professors: ["PROFESOREJEMPLO"],
            students: ["MARGA", "UO333333"]
        };

        this.logger.info("The group " + group1.name + " has been generated");
        this.bdManagement.addClassGroup(group1, function (id) {
        }.bind(this));

        this.logger.info("The group " + group2.name + " has been generated");
        this.bdManagement.addClassGroup(group2, function (id) {
        }.bind(this));

        this.logger.info("The group " + group3.name + " has been generated");
        this.bdManagement.addClassGroup(group3, function (id) {
        }.bind(this));

        this.logger.info("The group " + group4.name + " has been generated");
        this.bdManagement.addClassGroup(group4, function (id) {
        }.bind(this));

        this.logger.info("The group " + group5.name + " has been generated");
        this.bdManagement.addClassGroup(group5, function (id) {
        }.bind(this));

        this.logger.info("The module " + module1.name + " has been generated");
        this.bdManagement.addModule(module1, function (id) {
        }.bind(this));

        this.logger.info("The module " + module2.name + " has been generated");
        this.bdManagement.addModule(module2, function (id) {
        }.bind(this));

        this.logger.info("The module " + module3.name + " has been generated");
        this.bdManagement.addModule(module3, function (id) {
        }.bind(this));
    },*/
    generateData: function () {
        const user1 = {
            username: "UO111111",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "student",
            name: "Daniel",
            lastName: "González"
        };
        const user2 = {
            username: "UO222222",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "student",
            name: "Sara",
            lastName: "Carrión"
        };
        const user3 = {
            username: "PROFESOREJEMPLO",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Ejemplo",
            lastName: "Profesor"
        };
        const user4 = {
            username: "ROLINEXISTENTE",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "noExiste",
            name: "Rol",
            lastName: "Inexistente"
        };

        const user5 = {
            username: "MARGA",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("1318").digest('hex'),
            role: "student",
            name: "Margarita",
            lastName: "García"
        };

        const user6 = {
            username: "BELEN",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("2201").digest('hex'),
            role: "student",
            name: "Belén",
            lastName: "Casillas"
        };

        const user7 = {
            username: "ALEX",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("1234").digest('hex'),
            role: "student",
            name: "Alejandro",
            lastName: "Puente"
        };

        const user8 = {
            username: "PROFESOREJEMPLO2",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Paco",
            lastName: "Rodríguez"
        };

        const user9 = {
            username: "PROFESOREJEMPLO3",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Lucía",
            lastName: "Vázquez"
        };

        const user10 = {
            username: "UO333333",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "student",
            name: "Laura",
            lastName: "Méndez"
        };

        const user11 = {
            username: "maria.prada@uniovi.es",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "María",
            lastName: "Prada"
        };

        const user12 = {
            username: "claudio@uniovi.es",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "professor",
            name: "Claudio",
            lastName: "Rodríguez"
        };

        const module1 = {
            name: "Seguridad de Sistemas Informáticos",
            code: "GIISOF01-3-010",
            year: "3",
            term: "2",
            groupsIds: ["5db46a45a579e44bc8ee5bc5", "5db46a45a579e44bc8ee5bc1"]
        };

        const module2 = {
            name: "Sistemas Distribuidos e Internet",
            code: "GIISOF01-3-005",
            year: "3",
            term: "2",
            groupsIds: ["5db46a45a579e44bc8ee5bc3", "5db46a45a579e44bc8ee5bc2"]
        };

        const module3 = {
            name: "Diseño de Lenguajes de Programación",
            code: "GIISOF01-3-009",
            year: "3",
            term: "2",
            groupsIds: ["5db46a45a579e44bc8ee5bcd"]
        };

        const group1 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc5"),
            name: "SSI-grupo1",
            professors: ["PROFESOREJEMPLO", "PROFESOREJEMPLO2"],
            students: ["BELEN", "UO111111", "UO222222", "ALEX"]
        };

        const group2 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc3"),
            name: "SDI-grupo1",
            professors: ["PROFESOREJEMPLO3"],
            students: ["MARGA"]
        };

        const group3 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bcd"),
            name: "DLP-grupo1",
            professors: ["PROFESOREJEMPLO"],
            students: ["UO333333", "BELEN"]
        };

        const group4 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc2"),
            name: "SDI-grupo2",
            professors: ["PROFESOREJEMPLO3"],
            students: ["BELEN", "UO111111"]
        };

        const group5 = {
            _id: this.bdManagement.mongoPure.ObjectID("5db46a45a579e44bc8ee5bc1"),
            name: "SSI-grupo2",
            professors: ["PROFESOREJEMPLO"],
            students: ["MARGA", "UO333333"]
        };

        //startTime-> 28/09/2019 9:30:00
        //endTime-> 05/10/2019 21:04:00
        let slot1 = {
            description: "examen 1 de ssi",
            startTime: 1569655800000,
            endTime: 1570302240000,
            listMode: "whitelist",
            urls: ["https://www.google.com/", "http://www.uniovi.es/", "https://es.wikipedia.org"],
            groupName: group1.name,
            groupId: "",
            studentsExcluded: [],
            author: "PROFESOREJEMPLO"
        };

        //startTime-> 28/09/2019 9:30:00
        //endTime-> 25/10/2019 9:00:00
        let slot2 = {
            description: "practica 1 de sdi",
            startTime: 1569655800000,
            endTime: 1571986800000,
            listMode: "blacklist",
            urls: ["https://es.yahoo.com/"],
            groupName: group2.name,
            groupId: "",
            studentsExcluded: [],
            author: "PROFESOREJEMPLO3"
        };

        //startTime-> 05/10/2019 21:08:00
        //endTime-> 06/10/2019 19:59:20
        let slot3 = {
            description: "examen 2 de ssi",
            startTime: 1570302480000,
            endTime: 1570383380000,
            listMode: "whitelist",
            urls: ["https://www.google.com/", "https://twitter.com/"],
            groupName: group1.name,
            groupId: "",
            studentsExcluded: ["BELEN"],
            author: "PROFESOREJEMPLO"
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
        this.logger.info("The user " + user11.username + " has been generated");
        this.bdManagement.addUser(user11, function (id) {
        });
        this.logger.info("The user " + user12.username + " has been generated");
        this.bdManagement.addUser(user12, function (id) {
        });

        this.logger.info("The group " + group1.name + " has been generated");
        this.bdManagement.addClassGroup(group1, function (id) {
            if (id != null){
                this.logger.info("The slot [" + slot1.description + "] has been generated");
                this.logger.info("The slot [" + slot3.description + "] has been generated");
                slot1.groupId= id;
                slot3.groupId= id;
                this.bdManagement.addSlot(slot1, function (id) {
                });
                this.bdManagement.addSlot(slot3, function (id) {
                });
            }
        }.bind(this));

        this.logger.info("The group " + group4.name + " has been generated");
        this.bdManagement.addClassGroup(group4, function (id) {
        }.bind(this));

        this.logger.info("The group " + group5.name + " has been generated");
        this.bdManagement.addClassGroup(group5, function (id) {
        }.bind(this));

        this.logger.info("The module " + module1.name + " has been generated");
        this.bdManagement.addModule(module1, function (id) {
        }.bind(this));

        this.logger.info("The module " + module2.name + " has been generated");
        this.bdManagement.addModule(module2, function (id) {
        }.bind(this));

        this.logger.info("The module " + module3.name + " has been generated");
        this.bdManagement.addModule(module3, function (id) {
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
};
