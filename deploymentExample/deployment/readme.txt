//Configure server Ubuntu 16.04 LTS (Initial configuration, Timezone, nodejs, proccess daemonizer, nginx, firewall, ssl and mongodb)
0.1.- As root move to the server the runAsRoot.sh file
0.2.- Run "bash runAsRoot.sh"
0.3.- Change to the user <username>
1.- Move to the server the previousConfiguration.sh file, the initConfiguration.sh file, the default (nginx configuration) file, the self-signed.conf file, the ssl-params.conf file, the index.eyesecure.html, the createAdministratorsEyeSecure.js file and the createMongoDBuser.js file
2.- Run the previousConfiguration.sh file with "bash previousConfiguration.sh"
3.- Configure ssl certificate following the instructions available at "sslCertificate/readme.txt"
4.- Run "bash initConfiguration.sh" and answer what it asks


//Interesting URLs
https://www.digitalocean.com/community/tutorials/how-to-set-up-time-synchronization-on-ubuntu-16-04         https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
https://www.sitepoint.com/configuring-nginx-ssl-node-js/ https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-16-04               https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands
https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04