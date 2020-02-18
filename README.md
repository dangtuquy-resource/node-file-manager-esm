# node-file-manager-esm
![screenshot v3](https://user-images.githubusercontent.com/1894723/74705515-7a209280-5214-11ea-8547-79287118ef43.png)



# Usage

## as Docker container
see [DockerHub - docker-node-filemanager-esm](https://hub.docker.com/r/bananaacid/docker-node-filemanager-esm)

## Standalone / CLI
Requires Node >= v10.5

```sh
# no installation required (linux, osx, win)
$ npx node-file-manager-esm -p 8080 -d /path/to/show --logging --secure --open
```
or
```sh
npm install -g node-file-manager-esm
node-file-manager-esm -p 8080 -d /path/to/show
```
or with port as environment variable (Heroku, Linux, OSX, IIS: iisnode uses the port-env as well)
```sh
$    PORT=8080 node-file-manager-esm
\>   set PORT=8080 && node-file-manager-esm
ps1> $PORT=8080 ; node-file-manager-esm
```

Or

```sh
git clone https://github.com/BananaAcid/node-file-manager-esm.git && cd node-file-manager-esm && npm i
node --experimental-modules ./bin/node-file-manager-esm.mjs -p 8080 -d /path/to/show
```

Or use ESM + Node >= v4

```sh
git clone https://github.com/BananaAcid/node-file-manager-esm.git && cd node-file-manager-esm && npm i && npm i --only=dev
node ./bin/node-file-manager-esm -p 8080 -d /path/to/show
```
or Node < v12
```sh
node -r esm ./bin/node-file-manager-esm.mjs
```
or Node >= v13
```sh
node ./bin/node-file-manager-esm.mjs
```

We can run node-file-manager in terminal directly. We can specify the port add data root dir by `-p` and `-d`, default with 5000 and scripts directory.

Then, we can view http://localhost:8080/ in our browser.



## koa app: how to mount

```js
import fm from 'app-filemanager-esm';
var appFm = fm('/tmp/uploadpath', 'zip|txt|mp4').app; // see params: d & f
mainApp.use(mount('/fm', appFm));
```

So we can use it as koa app, mounted within another koa instance.

# Major changes in this fork
- updated to use a recent Koa
- be koa-mount compatible
- rewritten to be an ECMAScript Module (or Babel), works with both as well as the preferred `esm` module
- has Multi file upload
- Reduced dependencies

# mjs
The `Michael Jackson Script` or `.mjs` (or` modular JS`) extension is used by NodeJs to detect ECMAScript Modules with the `--experimental-modules` flag in NodeJS prior to v13. Since Babel does have problems `import.meta`, the `esm` npm module is used to transpill the code for older node versions. See the files within the `./bin` folder.

# Standalone / CLI
The app can be started all by itself from the command line. You shoud set the `--directory`/`-d` to use and use the `--secure` option. As well as the `--logging` option.
```sh
#example:
node-file-manager-esm -p 8080 -d /path/to/show --logging --secure /path/to/htpasswd
```

## CLI params
There are some configuration options for the commandline

- `-p` | `--port int` -- [5000] can be set as environment variable PORT 
- `-d` | `--directory string` -- [current path] the path to provide the files from
- `-f` | `--filter string` -- [zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|jpg|png|avi|mp4] pattern, seperated by |
- `-s` | `--secure <string>` -- is off by default, set it use BASIC-AUTH with the .htpasswd of the path provided, or leave empty for the htpasswd within the bin directory (default login is adam:adam)
- `-v` | `--version` -- show the version number
- `-l` | `--logging <string>` -- output logging info [using just `-l` or `--logging` resolves to `--logging *` and can be set as environment variable with `DEBUG=fm:*` as well. `-l traffic` will only show `fm:traffic`]
- `-o` | `--open` -- Open the website to this service (localhost with selected port)

## Environment variables
Fallback, if no param was used

- `FM_PORT` -- tries FM_PORT then PORT if no port param was given
- `FM_DIRECTORY` -- like `-p`
- `FM_FILTER` -- like `-f`
- `FM_SECURE` -- like `-s`
- `FM_LOGGING` -- like `-l`


## HTTP Basic Auth
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

## Manually add a user
The following command creates a new `htpasswd` file in the current folder with the user `peter`. After creating a new file copy it into the `lib` dir of the app or append the content of the new file to the existing one.
```bash
htpasswd -c ./htpasswd adam
```
