ARGS :=
docker_registry := 192.168.10.101:5000/
commit_id := $(shell git log -1 --format=%h)

image_name := ${docker_registry}ditto-expressway-map:${commit_id}

build-image:
	docker build ${ARGS} -t ${image_name} .

push-image:
	docker push ${image_name} ${ARGS}

print-image:
	@echo ${image_name}

## run in the local env
run-image:
	docker run -p 8123:80 ${ARGS} ${image_name}

run-helm-install:
	helm install ditto-expressway-map ci/helm/ditto-expressway-map --set image.repository=${docker_registry}ditto-expressway-map --set image.tag=${commit_id}

run-drone-local:
	drone exec --trusted \
		--sha ${commit_id} --event tag --repo ditto-expressway-map \
		--network=host \
		--secret-file ci/secrets.local.txt ${ARGS}