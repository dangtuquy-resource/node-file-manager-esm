# Screen Shot
![screenshot](https://raw.githubusercontent.com/efeiefei/node-file-manager/master/example/screenshot.png)

# Usage

```sh
  npm install -g node-file-manager
  node-file-manager -p 8080 -d /path/to/
```

Or

```sh
  git clone https://github.com/efeiefei/node-file-manager.git
  cd node-file-manager
  npm i
  cd lib
  node --harmony index.js -p 8080 -d /path/to
```

We can run node-file-manager in terminal directly. We can specify prot add data root dir by `-p` and `-d`, default with 5000 and scripts directory.

Then, we can view localhost:8080/ in our browr.

# HTTP Basic Auth
The app is protected with simple http basic auth, so it's recommended to use it just over TLS (HTTPS). Let's Encrypt is your friend. ;)

## Setup
If you use linux you can simply use `htpasswd` comming with `apache2-utils` (on Debian/Ubuntu)

On Debian/Ubuntu do:
```bash
sudo apt-get update
sudo apt-get -y install apache2-utils
```

## Add User
The following command creates a new `htpasswd` file in the current folder with the user `peter`. After creating a new file copy it into the `lib` dir of the app or append the content of the new file to the existing one.
```bash
htpasswd -c ./htpasswd peter
cp ./htpasswd node-file-manager/lib
```