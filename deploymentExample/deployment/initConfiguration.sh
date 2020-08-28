sudo mv self-signed.conf /etc/nginx/snippets/self-signed.conf
sudo mv ssl-params.conf /etc/nginx/snippets/ssl-params.conf
sudo mv index.eyesecure.html /var/www/html/index.eyesecure.html
sudo mv default /etc/nginx/sites-available/default
sleep 5
sudo systemctl start nginx
sleep 5
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 4B7C549A058F8B6B
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org=4.2.1 mongodb-org-server=4.2.1 mongodb-org-shell=4.2.1 mongodb-org-mongos=4.2.1 mongodb-org-tools=4.2.1
sleep 5
echo "mongodb-org hold" | sudo dpkg --set-selections
echo "mongodb-org-server hold" | sudo dpkg --set-selections
echo "mongodb-org-shell hold" | sudo dpkg --set-selections
echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
echo "mongodb-org-tools hold" | sudo dpkg --set-selections
sleep 5
sudo systemctl unmask mongod
sleep 5
sudo systemctl start mongod
sleep 5
sudo systemctl enable mongod
sleep 5
mongo admin createMongoDBuser.js
sleep 5
sudo sh -c 'echo "security:\n  authorization: enabled" >> /etc/mongod.conf'
sleep 5
sudo systemctl restart mongod
sleep 5
mongo tfg -u <usernameDB> -p "<passwordDB>" --authenticationDatabase admin createAdministratorsEyeSecure.js
sleep 5
sudo rm -f /var/www/html/index.nginx-debian.html
sudo systemctl restart nginx
rm -f createMongoDBuser.js
rm -f createAdministratorsEyeSecure.js
rm -f initConfiguration.sh