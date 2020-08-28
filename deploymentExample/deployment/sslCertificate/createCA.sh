sudo cd ~
sudo rm -r -f myCA
mkdir myCA
sudo openssl genrsa -des3 -out myCA/myCA.key 2048
sudo openssl req -x509 -new -nodes -key myCA/myCA.key -sha256 -days 2000 -out myCA/myCA.pem