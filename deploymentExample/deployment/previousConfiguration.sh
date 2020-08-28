sudo apt-get update
sudo apt-get install
sudo apt-get update && sudo apt-get dist-upgrade
sudo apt-get autoclean
sudo apt-get autoremove -y
sudo timedatectl set-timezone Europe/Madrid
sudo timedatectl set-ntp no
sudo apt-get install -y ntp
cd ~
sudo apt-get install -y curl
sudo apt install -y build-essential
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash
sudo apt-get install -y nodejs
sudo npm install -g pm2
sudo pm2 startup systemd
sudo apt-get install -y nginx
sudo ufw allow OpenSSH
sudo ufw allow 7545
sudo ufw allow 6993
sudo ufw enable
sudo systemctl stop nginx
rm -f previousConfiguration.sh