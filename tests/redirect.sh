#!/bin/env bash

BASE_URL="${1:-https://localhost}"

function test {
  local url=$1
  local code=$2
  local location=$3

  local output=$(curl -k -w '%{http_code},%{redirect_url}\n' -o /dev/null -s "${url}")

  if [ "${output}" == "${code},${location}" ]; then 
    echo " OK : ${url}"
  else
    echo "FAIL: ${url} -> ${code},${location} != ${output}"
  fi
}

test $BASE_URL/components 301 $BASE_URL/components/next/
test $BASE_URL/components/ 301 $BASE_URL/components/next/
test $BASE_URL/components/next 301 $BASE_URL/components/next/
test $BASE_URL/components/next/ 200
test $BASE_URL/components/latest 301 $BASE_URL/components/next/
test $BASE_URL/components/latest/ 301 $BASE_URL/components/next/
test $BASE_URL/components/latest/activemq-component.html 301 $BASE_URL/components/next/activemq-component.html
test $BASE_URL/components/next/activemq-component.html 200

test $BASE_URL/camel-spring-boot 301 $BASE_URL/camel-spring-boot/next/
test $BASE_URL/camel-spring-boot/ 301 $BASE_URL/camel-spring-boot/next/
test $BASE_URL/camel-spring-boot/next 301 $BASE_URL/camel-spring-boot/next/
test $BASE_URL/camel-spring-boot/next/ 200
test $BASE_URL/camel-spring-boot/latest 301 $BASE_URL/camel-spring-boot/next/
test $BASE_URL/camel-spring-boot/latest/ 301 $BASE_URL/camel-spring-boot/next/
test $BASE_URL/camel-spring-boot/latest/list.html 301 $BASE_URL/camel-spring-boot/next/list.html
test $BASE_URL/camel-spring-boot/next/list.html 200

test $BASE_URL/camel-k 301 $BASE_URL/camel-k/next/
test $BASE_URL/camel-k/ 301 $BASE_URL/camel-k/next/
test $BASE_URL/camel-k/next 301 $BASE_URL/camel-k/next/
test $BASE_URL/camel-k/next/ 200
test $BASE_URL/camel-k/latest 301 $BASE_URL/camel-k/next/
test $BASE_URL/camel-k/latest/ 301 $BASE_URL/camel-k/next/
test $BASE_URL/camel-k/latest/traits/master.html 301 $BASE_URL/camel-k/next/traits/master.html
test $BASE_URL/camel-k/next/traits/master.html 200

test $BASE_URL/camel-karaf 301 $BASE_URL/camel-karaf/next/
test $BASE_URL/camel-karaf/ 301 $BASE_URL/camel-karaf/next/
test $BASE_URL/camel-karaf/next 301 $BASE_URL/camel-karaf/next/
test $BASE_URL/camel-karaf/next/ 200
test $BASE_URL/camel-karaf/latest 301 $BASE_URL/camel-karaf/next/
test $BASE_URL/camel-karaf/latest/ 301 $BASE_URL/camel-karaf/next/
test $BASE_URL/camel-karaf/latest/components.html 301 $BASE_URL/camel-karaf/next/components.html
test $BASE_URL/camel-karaf/next/components.html 200

test $BASE_URL/camel-kafka-connector 301 $BASE_URL/camel-kafka-connector/next/
test $BASE_URL/camel-kafka-connector/ 301 $BASE_URL/camel-kafka-connector/next/
test $BASE_URL/camel-kafka-connector/next 301 $BASE_URL/camel-kafka-connector/next/
test $BASE_URL/camel-kafka-connector/next/ 200
test $BASE_URL/camel-kafka-connector/latest 301 $BASE_URL/camel-kafka-connector/next/
test $BASE_URL/camel-kafka-connector/latest/ 301 $BASE_URL/camel-kafka-connector/next/
test $BASE_URL/camel-kafka-connector/latest/contributor-guide/release-guide.html 301 $BASE_URL/camel-kafka-connector/next/contributor-guide/release-guide.html
test $BASE_URL/camel-kafka-connector/next/contributor-guide/release-guide.html 200

test $BASE_URL/camel-quarkus 301 $BASE_URL/camel-quarkus/next/
test $BASE_URL/camel-quarkus/ 301 $BASE_URL/camel-quarkus/next/
test $BASE_URL/camel-quarkus/next 301 $BASE_URL/camel-quarkus/next/
test $BASE_URL/camel-quarkus/next/ 200
test $BASE_URL/camel-quarkus/latest 301 $BASE_URL/camel-quarkus/next/
test $BASE_URL/camel-quarkus/latest/ 301 $BASE_URL/camel-quarkus/next/
test $BASE_URL/camel-quarkus/latest/user-guide/cdi.html 301 $BASE_URL/camel-quarkus/next/user-guide/cdi.html
test $BASE_URL/camel-quarkus/next/user-guide/cdi.html 200

test $BASE_URL/manual 301 $BASE_URL/manual/
test $BASE_URL/manual/latest 301 $BASE_URL/manual/
test $BASE_URL/manual/latest/ 301 $BASE_URL/manual/
test $BASE_URL/manual/latest/component-dsl.html 301 $BASE_URL/manual/component-dsl.html
test $BASE_URL/manual/ 200
test $BASE_URL/manual/component-dsl.html 200
