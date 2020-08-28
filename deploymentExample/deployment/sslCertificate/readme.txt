1.- Generate the CA certificate if it not exists running "bash createCA.sh" and use as password what you want but take note of it.
2.- Move to the home user directory the file "nginx-selfsigned.ext" and be sure that the myCA folder is created with the certificate inside, if not create a new one following the step 1.
3.- Generate the ssl certificate running "bash createSSLcertificate.sh".
4.- Import the CA certificate on the Chrome browsers in order to allow communication with the extension

//Interesting URL
https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/
https://stackoverflow.com/questions/10175812/how-to-create-a-self-signed-certificate-with-openssl