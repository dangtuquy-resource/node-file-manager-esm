# Screen Shot
![screenshot](https://raw.githubusercontent.com/efeiefei/node-file-manager/master/example/screenshot.png)


# Usage

## Standalone
Requires Node >= v10.5
```sh
  npm install -g node-file-manager-2
  node-file-manager -p 8080 -d /path/to/
```

Or

```sh
  git clone https://github.com/BananaAcid/node-file-manager-2.git && cd node-file-manager-2 && npm i
  node --experimental-modules server.mjs -p 8080 -d /path/to/show
```

Or use Babel + Node >= v4

```sh
  git clone https://github.com/BananaAcid/node-file-manager-2.git && cd node-file-manager-2 && npm i && npm i --only=dev
  node server.babel-entry.js -p 8080 -d /path/to/show
```
*for Babel, you need to remove one code line in index:20 or server:14 (where `__dirname` gets patched for node modules)*

We can run node-file-manager in terminal directly. We can specify prot add data root dir by `-p` and `-d`, default with 5000 and scripts directory.

Then, we can view localhost:8080/ in our browser.

## as koa app to be mounted

```js
  import fm from 'app-filemanager-2';
  var appFm = fm('/tmp/uploadpath', 'zip|txt|mp4').app; // see params: d & f
  mainApp.use(mount('/fm', appFm));
```

So we can use it as koa app, mounted within another koa instance.

# Major changes in this fork
- updated to use a recent Koa
- be koa-mount compatible
- rewritten to be an ECMAScript Module (or Babel), works with both
- has Multi file upload
- Reduced dependencies

# mjs
The `Michael Jackson Script` or `.mjs` (or modular JS) extension is used by NodeJs to detect ECMAScript Modules, Babel does not care - look at the babel entry files.

# Params
There are some configuration options for the commandline

- `-p` | `--port int` -- [5000]
- `-d` | `--directory string` -- [current path] a path string to be accessible
- `-f` | `--filter string` -- [zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|jpg|png|avi|mp4] pattern, seperated by |
- `-s` | `--secure` -- is off by default, enable HTTP Basic Auth, htpasswd file is used
- `-v` | `--version` -- show the version number

# HTTP Basic Auth
The app is protected with simple http basic auth, so it's recommended to use it just over TLS (HTTPS). Let's Encrypt is your friend. ;)

## Shortcut
Google for "online htpasswd generator". The more secure way is getting the required tools to generate a htpasswd file.

## Manual setup
If you use linux you can simply use `htpasswd` comming with `apache2-utils` (on Debian/Ubuntu)

On Debian/Ubuntu do:
```bash
sudo apt-get update
sudo apt-get -y install apache2-utils
```

## Manualy add a User
The following command creates a new `htpasswd` file in the current folder with the user `peter`. After creating a new file copy it into the `lib` dir of the app or append the content of the new file to the existing one.
```bash
htpasswd -c ./htpasswd peter
cp ./htpasswd node-file-manager/lib
```