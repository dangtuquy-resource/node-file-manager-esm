# usage `make` or `make image` or `make run` or `make rmi`
# using `make`, use `make image && make run && make kill` to rebuild and run and stop + clear docker afterwards
all: image run

# build the image for distribution
image:
	docker build -t docker-node-filemanager-esm .

# test the image on port 5000
run:
	docker run -p 5000:5000 -d --name node-filemanager-esm docker-node-filemanager-esm

run-win:
	docker run -p 5000:5000 -it --volume D:\:/data --name node-filemanager-esm docker-node-filemanager-esm

# just remove the image
rmi:
	docker rmi docker-node-filemanager-esm --force
	echo "reopen Kitematic to update correctly / use CTRL+R to reload / CMD+R to reload"

# stop container and delete its image from docker
kill:
	docker rm `docker stop \`docker ps -a -q  --filter ancestor=docker-node-filemanager-esm\``
	#docker kill `docker ps -a -q  --filter ancestor=docker-node-filemanager-esm`
	docker rmi docker-node-filemanager-esm --force
	echo "reopen Kitematic to update correctly / use CTRL+R to reload / CMD+R to reload"


id:
	docker ps -a -q  --filter ancestor=docker-node-filemanager-esm


# 1. make image, 2. login, 3. tag, 4. push
publish:
	make login && make tag && make push

login:
	docker login

tag:
	docker tag docker-node-filemanager-esm bananaacid/docker-node-filemanager-esm

# for this, the image name has to be without the username until here
push:
	docker push bananaacid/docker-node-filemanager-esm
