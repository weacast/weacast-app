# How to generate self-signed certificates for develoment

> Under Windows simply prefix all commands using `winpty` from Git Bash

Follow this [guide](https://www.akadia.com/services/ssh_test_certificate.html):
```bash
openssl genrsa -des3 -out server.key 1024
openssl req -new -key server.key -out server.csr
cp server.key server.key.org
openssl rsa -in server.key.org -out server.key
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

Certificate information:

* Country Name (2 letter code) [AU]:FR
* State or Province Name (full name) [Some-State]:Occitanie
* Locality Name (eg, city) []:Castelnaudary
* Organization Name (eg, company) [Internet Widgits Pty Ltd]:Weacast
* Organizational Unit Name (eg, section) []:
* Common Name (e.g. server FQDN or YOUR name) []:localhost
* Email Address []:weacast@weacast.xyz
* A challenge password []:
* An optional company name []:

The weacast app follows [Feathers guide to enable HTTPS](https://docs.feathersjs.com/api/express.html#https) and also similarly manages HTTPS on the client side when using Webpack in development.
