cd ~
sudo rm -f /etc/ssl/private/nginx-selfsigned.key
sudo rm -f /etc/ssl/certs/nginx-selfsigned.crt
sudo rm -f /etc/ssl/certs/dhparam.pem
sudo rm -r -f currentSSL
sudo mkdir currentSSL
sudo openssl genrsa -out currentSSL/nginx-selfsigned.key 2048
sudo openssl req -new -key currentSSL/nginx-selfsigned.key -subj "/C=<countryCode>/ST=<StateOrProvince>/O=<OrganizationName>/OU=<OrganizationUnit>/CN=<ipAddress>" -out currentSSL/nginx-selfsigned.csr
echo "Use the password of the CA certificate creation"
sudo openssl x509 -req -in currentSSL/nginx-selfsigned.csr -CA myCA/myCA.pem -CAkey myCA/myCA.key -CAcreateserial \
-out currentSSL/nginx-selfsigned.crt -days 1000 -sha256 -extfile nginx-selfsigned.ext
sudo cp currentSSL/nginx-selfsigned.key /etc/ssl/private/nginx-selfsigned.key
sudo cp currentSSL/nginx-selfsigned.crt /etc/ssl/certs/nginx-selfsigned.crt
sudo mkdir /etc/ssl/certs/CA
sudo cp myCA/myCA.pem /etc/ssl/certs/CA/myCA.pem
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048