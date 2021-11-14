#!/bin/sh

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

C_V="3.13.x"
CK_V="1.6.x"
CKC_V="0.11.0"
CQ_V="2.4.x"

test $BASE_URL/components 302 $BASE_URL/components/${C_V}/
test $BASE_URL/components/ 302 $BASE_URL/components/${C_V}/
test $BASE_URL/components/next 301 $BASE_URL/components/next/
test $BASE_URL/components/next/ 200
test $BASE_URL/components/latest 302 $BASE_URL/components/${C_V}
test $BASE_URL/components/latest/ 302 $BASE_URL/components/${C_V}/
test $BASE_URL/components/activemq-component.html 302 $BASE_URL/components/${C_V}/activemq-component.html
test $BASE_URL/components/latest/activemq-component.html 302 $BASE_URL/components/${C_V}/activemq-component.html
test $BASE_URL/components/${C_V}/activemq-component.html 200
test $BASE_URL/components/next/activemq-component.html 200

test $BASE_URL/camel-spring-boot 302 $BASE_URL/camel-spring-boot/${C_V}/
test $BASE_URL/camel-spring-boot/ 302 $BASE_URL/camel-spring-boot/${C_V}/
test $BASE_URL/camel-spring-boot/next 301 $BASE_URL/camel-spring-boot/next/
test $BASE_URL/camel-spring-boot/next/ 200
test $BASE_URL/camel-spring-boot/latest 302 $BASE_URL/camel-spring-boot/${C_V}
test $BASE_URL/camel-spring-boot/latest/ 302 $BASE_URL/camel-spring-boot/${C_V}/
test $BASE_URL/camel-spring-boot/list.html 302 $BASE_URL/camel-spring-boot/${C_V}/list.html
test $BASE_URL/camel-spring-boot/latest/list.html 302 $BASE_URL/camel-spring-boot/${C_V}/list.html
test $BASE_URL/camel-spring-boot/${C_V}/list.html 200
test $BASE_URL/camel-spring-boot/next/list.html 200

test $BASE_URL/camel-k 302 $BASE_URL/camel-k/${CK_V}/
test $BASE_URL/camel-k/ 302 $BASE_URL/camel-k/${CK_V}/
test $BASE_URL/camel-k/next 301 $BASE_URL/camel-k/next/
test $BASE_URL/camel-k/next/ 200
test $BASE_URL/camel-k/latest 302 $BASE_URL/camel-k/${CK_V}
test $BASE_URL/camel-k/latest/ 302 $BASE_URL/camel-k/${CK_V}/
test $BASE_URL/camel-k/traits/master.html 302 $BASE_URL/camel-k/${CK_V}/traits/master.html
test $BASE_URL/camel-k/latest/traits/master.html 302 $BASE_URL/camel-k/${CK_V}/traits/master.html
test $BASE_URL/camel-k/${CK_V}/traits/master.html 200
test $BASE_URL/camel-k/next/traits/master.html 200

test $BASE_URL/camel-karaf 302 $BASE_URL/camel-karaf/${C_V}/
test $BASE_URL/camel-karaf/ 302 $BASE_URL/camel-karaf/${C_V}/
test $BASE_URL/camel-karaf/next 301 $BASE_URL/camel-karaf/next/
test $BASE_URL/camel-karaf/next/ 200
test $BASE_URL/camel-karaf/latest 302 $BASE_URL/camel-karaf/${C_V}
test $BASE_URL/camel-karaf/latest/ 302 $BASE_URL/camel-karaf/${C_V}/
test $BASE_URL/camel-karaf/latest/components.html 302 $BASE_URL/camel-karaf/${C_V}/components.html
test $BASE_URL/camel-karaf/latest/components.html 302 $BASE_URL/camel-karaf/${C_V}/components.html
test $BASE_URL/camel-karaf/${C_V}/components.html 200
test $BASE_URL/camel-karaf/next/components.html 200

test $BASE_URL/camel-kafka-connector 302 $BASE_URL/camel-kafka-connector/${CKC_V}/
test $BASE_URL/camel-kafka-connector/ 302 $BASE_URL/camel-kafka-connector/${CKC_V}/
test $BASE_URL/camel-kafka-connector/next 301 $BASE_URL/camel-kafka-connector/next/
test $BASE_URL/camel-kafka-connector/next/ 200
test $BASE_URL/camel-kafka-connector/latest 302 $BASE_URL/camel-kafka-connector/${CKC_V}
test $BASE_URL/camel-kafka-connector/latest/ 302 $BASE_URL/camel-kafka-connector/${CKC_V}/
test $BASE_URL/camel-kafka-connector/contributor-guide/release-guide.html 302 $BASE_URL/camel-kafka-connector/${CKC_V}/contributor-guide/release-guide.html
test $BASE_URL/camel-kafka-connector/latest/contributor-guide/release-guide.html 302 $BASE_URL/camel-kafka-connector/${CKC_V}/contributor-guide/release-guide.html
test $BASE_URL/camel-kafka-connector/${CKC_V}/contributor-guide/release-guide.html 200
test $BASE_URL/camel-kafka-connector/next/contributor-guide/release-guide.html 200

test $BASE_URL/camel-kamelets 302 $BASE_URL/camel-kamelets/next/
test $BASE_URL/camel-kamelets/ 302 $BASE_URL/camel-kamelets/next/
test $BASE_URL/camel-kamelets/next 301 $BASE_URL/camel-kamelets/next/
test $BASE_URL/camel-kamelets/next/ 200
test $BASE_URL/camel-kamelets/latest 302 $BASE_URL/camel-kamelets/next
test $BASE_URL/camel-kamelets/latest/ 302 $BASE_URL/camel-kamelets/next/
test $BASE_URL/camel-kamelets/github-source.html 302 $BASE_URL/camel-kamelets/next/github-source.html
test $BASE_URL/camel-kamelets/latest/github-source.html 302 $BASE_URL/camel-kamelets/next/github-source.html
test $BASE_URL/camel-kamelets/next/github-source.html 200
test $BASE_URL/camel-kamelets/next/github-source.html 200

test $BASE_URL/camel-quarkus 302 $BASE_URL/camel-quarkus/${CQ_V}/
test $BASE_URL/camel-quarkus/ 302 $BASE_URL/camel-quarkus/${CQ_V}/
test $BASE_URL/camel-quarkus/next 301 $BASE_URL/camel-quarkus/next/
test $BASE_URL/camel-quarkus/next/ 200
test $BASE_URL/camel-quarkus/latest 302 $BASE_URL/camel-quarkus/${CQ_V}
test $BASE_URL/camel-quarkus/latest/ 302 $BASE_URL/camel-quarkus/${CQ_V}/
test $BASE_URL/camel-quarkus/user-guide/cdi.html 302 $BASE_URL/camel-quarkus/${CQ_V}/user-guide/cdi.html
test $BASE_URL/camel-quarkus/latest/user-guide/cdi.html 302 $BASE_URL/camel-quarkus/${CQ_V}/user-guide/cdi.html
test $BASE_URL/camel-quarkus/${CQ_V}/user-guide/cdi.html 200
test $BASE_URL/camel-quarkus/next/user-guide/cdi.html 200

test $BASE_URL/manual 301 $BASE_URL/manual/
test $BASE_URL/manual/latest 302 $BASE_URL/manual
test $BASE_URL/manual/latest/ 302 $BASE_URL/manual/
test $BASE_URL/manual/latest/component-dsl.html 302 $BASE_URL/manual/component-dsl.html
test $BASE_URL/manual/ 200
test $BASE_URL/manual/component-dsl.html 200
