useradd -m -s /bin/bash <username> --groups sudo
echo "<username>:<password>" | chpasswd
rm -f runAsRoot.sh