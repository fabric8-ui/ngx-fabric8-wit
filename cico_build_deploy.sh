#!/bin/bash

# Show command before executing
set -x

# Exit on error
set -e

# Export needed vars
for var in BUILD_NUMBER BUILD_URL JENKINS_URL GIT_BRANCH; do
  export $(grep ${var} jenkins-env | xargs)
done
export BUILD_TIMESTAMP=`date -u +%Y-%m-%dT%H:%M:%S`+00:00

# We need to disable selinux for now, XXX
/usr/sbin/setenforce 0

# Get all the deps in
yum -y install docker
yum clean all
sed -i '/OPTIONS=.*/c\OPTIONS="--selinux-enabled --log-driver=journald --insecure-registry registry.ci.centos.org:5000"' /etc/sysconfig/docker
service docker start

# Build builder image
docker build -t ngx-fabric8-wit-builder -f Dockerfile.builder .
mkdir -p dist && docker run --detach=true --name=ngx-fabric8-wit-builder -e "FABRIC8_WIT_API_URL=http://api.openshift.io/api/" -e JENKINS_URL -e GIT_BRANCH -e "CI=true" -t -v $(pwd)/dist:/dist:Z ngx-fabric8-wit-builder

# Build almigty-ui
docker exec ngx-fabric8-wit-builder npm install

## Exec functional tests
docker exec ngx-fabric8-wit-builder ./run_unit_tests.sh

if [ $? -eq 0 ]; then
  echo 'CICO: unit tests OK'
else
  echo 'CICO: unit tests FAIL'
  exit 1
fi

## Exec functional tests
docker exec ngx-fabric8-wit-builder ./run_functional_tests.sh


if [ $? -eq 0 ]; then
  echo 'CICO: functional tests OK'
  docker exec ngx-fabric8-wit-builder npm run build
  ## All ok, deploy
  if [ $? -eq 0 ]; then
    echo 'CICO: build OK'
    # Publish to npm
    docker exec ngx-fabric8-wit-builder npm run semantic-release
    if [ $? -eq 0 ]; then
      echo 'CICO: module pushed to npmjs.com'
      exit 0
    else
      echo 'CICO: module push to npmjs.com failed'
      exit 2
    fi
  else
    echo 'CICO: app tests Failed'
    exit 1
  fi
else
  echo 'CICO: functional tests FAIL'
  exit 1
fi

