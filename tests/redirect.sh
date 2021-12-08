#!/bin/bash

set -eu -o pipefail

BASE_URL="https://localhost"
VERBOSE=0
DEBUG=0
SERVE=0
while [[ $# -gt 0 ]]; do
  opt="$1"

  case $opt in
    -v|--verbose)
      VERBOSE=1
      shift
      ;;
    -x|--very-verbose)
      set -x
      DEBUG=1
      shift
      ;;
    -s|--serve)
      SERVE=1
      shift
      ;;
    *)
      BASE_URL="$1"
      shift
      ;;
  esac
done

GIT_ROOT=$(realpath "$(dirname "${BASH_SOURCE[0]}")/..")

if [ "$SERVE" == 1 ]; then
  CONTAINER_CMD=podman
  if ! command -v $CONTAINER_CMD &> /dev/null; then
    CONTAINER_CMD=docker
    if ! command -v $CONTAINER_CMD &> /dev/null; then
      echo -e "\e[1mFAILURE\e[0m: Nether podman nor docker command found"
      exit 1
    fi
  fi

  CONTAINER_ID=$($CONTAINER_CMD run -d -v "$GIT_ROOT/public":/usr/local/apache2/htdocs/:Z -v "$GIT_ROOT/support/http":/support:Z -p 443 httpd:2.4 /bin/bash -c "cp /support/* /usr/local/apache2/conf/ && httpd-foreground")
  trap '$CONTAINER_CMD stop $CONTAINER_ID > /dev/null; $CONTAINER_CMD rm $CONTAINER_ID > /dev/null' EXIT
  if [ "$DEBUG" == 1 ]; then
    $CONTAINER_CMD logs "$CONTAINER_ID"
  fi
  if [ -n "$($CONTAINER_CMD ps -q --filter id="$(hostname)")" ]; then
    # running within a container, we'll assume running on the same network, so we should be able to connect directly
    BASE_URL="https://$($CONTAINER_CMD inspect -f "{{ range .NetworkSettings.Networks }}{{.IPAddress}}{{ end }}" "$CONTAINER_ID")"
  else
    BASE_URL="https://$($CONTAINER_CMD port "$CONTAINER_ID" 443 | head -1)"
  fi
fi

TOTAL=0
SUCCESS=0

function test {
  local url=$1
  local code=$2
  local location=${3:-}

  local output
  set +e
  output=$(curl -k -w '%{http_code},%{redirect_url}\n' -o /dev/null -s "${url}")
  set -e
  TOTAL=$((TOTAL + 1))

  if [ "${output}" == "${code},${location}" ]; then
    SUCCESS=$((SUCCESS + 1))
    if [ "${VERBOSE}" == 1 ]; then
      echo -e " OK : ${url}"
    fi
  else
    echo -e "\e[1m\e[31mFAIL\e[m: ${url}\n    expected: \e[1m${code},${location}\e[0m\n         got: \e[1m${output}\e[0m"
  fi
}

COMPONENTS_VERSION="$(grep 'components/latest' "$GIT_ROOT/documentation/.htaccess" | grep -Z -o '[^/]*$')"
CAMEL_K_VERSION="$(grep 'camel-k/latest' "$GIT_ROOT/documentation/.htaccess" | grep -Z -o '[^/]*$')"
CAMEL_KAFKA_CONNECTOR_VERSION="$(grep 'camel-kafka-connector/latest' "$GIT_ROOT/documentation/.htaccess" | grep -Z -o '[^/]*$')"
CAMEL_QUARKUS_VERSION="$(grep 'camel-quarkus/latest' "$GIT_ROOT/documentation/.htaccess" | grep -Z -o '[^/]*$')"
CAMEL_KAMELETS_VERSION="$(grep 'camel-kamelets/latest' "$GIT_ROOT/documentation/.htaccess" | grep -Z -o '[^/]*$')"

test "$BASE_URL/components" 302 "$BASE_URL/components/${COMPONENTS_VERSION}/"
test "$BASE_URL/components/" 302 "$BASE_URL/components/${COMPONENTS_VERSION}/"
test "$BASE_URL/components/next" 301 "$BASE_URL/components/next/"
test "$BASE_URL/components/next/" 200
test "$BASE_URL/components/latest" 302 "$BASE_URL/components/${COMPONENTS_VERSION}"
test "$BASE_URL/components/latest/" 302 "$BASE_URL/components/${COMPONENTS_VERSION}/"
test "$BASE_URL/components/activemq-component.html" 302 "$BASE_URL/components/${COMPONENTS_VERSION}/activemq-component.html"
test "$BASE_URL/components/latest/activemq-component.html" 302 "$BASE_URL/components/${COMPONENTS_VERSION}/activemq-component.html"
test "$BASE_URL/components/${COMPONENTS_VERSION}/activemq-component.html" 200
test "$BASE_URL/components/next/activemq-component.html" 200

test "$BASE_URL/camel-spring-boot" 302 "$BASE_URL/camel-spring-boot/${COMPONENTS_VERSION}/"
test "$BASE_URL/camel-spring-boot/" 302 "$BASE_URL/camel-spring-boot/${COMPONENTS_VERSION}/"
test "$BASE_URL/camel-spring-boot/next" 301 "$BASE_URL/camel-spring-boot/next/"
test "$BASE_URL/camel-spring-boot/next/" 200
test "$BASE_URL/camel-spring-boot/latest" 302 "$BASE_URL/camel-spring-boot/${COMPONENTS_VERSION}"
test "$BASE_URL/camel-spring-boot/latest/" 302 "$BASE_URL/camel-spring-boot/${COMPONENTS_VERSION}/"
test "$BASE_URL/camel-spring-boot/list.html" 302 "$BASE_URL/camel-spring-boot/${COMPONENTS_VERSION}/list.html"
test "$BASE_URL/camel-spring-boot/latest/list.html" 302 "$BASE_URL/camel-spring-boot/${COMPONENTS_VERSION}/list.html"
test "$BASE_URL/camel-spring-boot/${COMPONENTS_VERSION}/list.html" 200
test "$BASE_URL/camel-spring-boot/next/list.html" 200

test "$BASE_URL/camel-k" 302 "$BASE_URL/camel-k/${CAMEL_K_VERSION}/"
test "$BASE_URL/camel-k/" 302 "$BASE_URL/camel-k/${CAMEL_K_VERSION}/"
test "$BASE_URL/camel-k/next" 301 "$BASE_URL/camel-k/next/"
test "$BASE_URL/camel-k/next/" 200
test "$BASE_URL/camel-k/latest" 302 "$BASE_URL/camel-k/${CAMEL_K_VERSION}"
test "$BASE_URL/camel-k/latest/" 302 "$BASE_URL/camel-k/${CAMEL_K_VERSION}/"
test "$BASE_URL/camel-k/traits/master.html" 302 "$BASE_URL/camel-k/${CAMEL_K_VERSION}/traits/master.html"
test "$BASE_URL/camel-k/latest/traits/master.html" 302 "$BASE_URL/camel-k/${CAMEL_K_VERSION}/traits/master.html"
test "$BASE_URL/camel-k/${CAMEL_K_VERSION}/traits/master.html" 200
test "$BASE_URL/camel-k/next/traits/master.html" 200

test "$BASE_URL/camel-karaf" 302 "$BASE_URL/camel-karaf/${COMPONENTS_VERSION}/"
test "$BASE_URL/camel-karaf/" 302 "$BASE_URL/camel-karaf/${COMPONENTS_VERSION}/"
test "$BASE_URL/camel-karaf/next" 301 "$BASE_URL/camel-karaf/next/"
test "$BASE_URL/camel-karaf/next/" 200
test "$BASE_URL/camel-karaf/latest" 302 "$BASE_URL/camel-karaf/${COMPONENTS_VERSION}"
test "$BASE_URL/camel-karaf/latest/" 302 "$BASE_URL/camel-karaf/${COMPONENTS_VERSION}/"
test "$BASE_URL/camel-karaf/latest/components.html" 302 "$BASE_URL/camel-karaf/${COMPONENTS_VERSION}/components.html"
test "$BASE_URL/camel-karaf/latest/components.html" 302 "$BASE_URL/camel-karaf/${COMPONENTS_VERSION}/components.html"
test "$BASE_URL/camel-karaf/${COMPONENTS_VERSION}/components.html" 200
test "$BASE_URL/camel-karaf/next/components.html" 200

test "$BASE_URL/camel-kafka-connector" 302 "$BASE_URL/camel-kafka-connector/${CAMEL_KAFKA_CONNECTOR_VERSION}/"
test "$BASE_URL/camel-kafka-connector/" 302 "$BASE_URL/camel-kafka-connector/${CAMEL_KAFKA_CONNECTOR_VERSION}/"
test "$BASE_URL/camel-kafka-connector/next" 301 "$BASE_URL/camel-kafka-connector/next/"
test "$BASE_URL/camel-kafka-connector/next/" 200
test "$BASE_URL/camel-kafka-connector/latest" 302 "$BASE_URL/camel-kafka-connector/${CAMEL_KAFKA_CONNECTOR_VERSION}"
test "$BASE_URL/camel-kafka-connector/latest/" 302 "$BASE_URL/camel-kafka-connector/${CAMEL_KAFKA_CONNECTOR_VERSION}/"
test "$BASE_URL/camel-kafka-connector/contributor-guide/release-guide.html" 302 "$BASE_URL/camel-kafka-connector/${CAMEL_KAFKA_CONNECTOR_VERSION}/contributor-guide/release-guide.html"
test "$BASE_URL/camel-kafka-connector/latest/contributor-guide/release-guide.html" 302 "$BASE_URL/camel-kafka-connector/${CAMEL_KAFKA_CONNECTOR_VERSION}/contributor-guide/release-guide.html"
test "$BASE_URL/camel-kafka-connector/${CAMEL_KAFKA_CONNECTOR_VERSION}/contributor-guide/release-guide.html" 200
test "$BASE_URL/camel-kafka-connector/next/contributor-guide/release-guide.html" 200

test "$BASE_URL/camel-kamelets" 302 "$BASE_URL/camel-kamelets/${CAMEL_KAMELETS_VERSION}/"
test "$BASE_URL/camel-kamelets/" 302 "$BASE_URL/camel-kamelets/${CAMEL_KAMELETS_VERSION}/"
test "$BASE_URL/camel-kamelets/next" 301 "$BASE_URL/camel-kamelets/next/"
test "$BASE_URL/camel-kamelets/next/" 200
test "$BASE_URL/camel-kamelets/latest" 302 "$BASE_URL/camel-kamelets/${CAMEL_KAMELETS_VERSION}"
test "$BASE_URL/camel-kamelets/latest/" 302 "$BASE_URL/camel-kamelets/${CAMEL_KAMELETS_VERSION}/"
test "$BASE_URL/camel-kamelets/github-source.html" 302 "$BASE_URL/camel-kamelets/${CAMEL_KAMELETS_VERSION}/github-source.html"
test "$BASE_URL/camel-kamelets/latest/github-source.html" 302 "$BASE_URL/camel-kamelets/${CAMEL_KAMELETS_VERSION}/github-source.html"
test "$BASE_URL/camel-kamelets/next/github-source.html" 200
test "$BASE_URL/camel-kamelets/next/github-source.html" 200

test "$BASE_URL/camel-quarkus" 302 "$BASE_URL/camel-quarkus/${CAMEL_QUARKUS_VERSION}/"
test "$BASE_URL/camel-quarkus/" 302 "$BASE_URL/camel-quarkus/${CAMEL_QUARKUS_VERSION}/"
test "$BASE_URL/camel-quarkus/next" 301 "$BASE_URL/camel-quarkus/next/"
test "$BASE_URL/camel-quarkus/next/" 200
test "$BASE_URL/camel-quarkus/latest" 302 "$BASE_URL/camel-quarkus/${CAMEL_QUARKUS_VERSION}"
test "$BASE_URL/camel-quarkus/latest/" 302 "$BASE_URL/camel-quarkus/${CAMEL_QUARKUS_VERSION}/"
test "$BASE_URL/camel-quarkus/user-guide/cdi.html" 302 "$BASE_URL/camel-quarkus/${CAMEL_QUARKUS_VERSION}/user-guide/cdi.html"
test "$BASE_URL/camel-quarkus/latest/user-guide/cdi.html" 302 "$BASE_URL/camel-quarkus/${CAMEL_QUARKUS_VERSION}/user-guide/cdi.html"
test "$BASE_URL/camel-quarkus/${CAMEL_QUARKUS_VERSION}/user-guide/cdi.html" 200
test "$BASE_URL/camel-quarkus/next/user-guide/cdi.html" 200

test "$BASE_URL/manual" 301 "$BASE_URL/manual/"
test "$BASE_URL/manual/latest" 302 "$BASE_URL/manual"
test "$BASE_URL/manual/latest/" 302 "$BASE_URL/manual/"
test "$BASE_URL/manual/latest/component-dsl.html" 302 "$BASE_URL/manual/component-dsl.html"
test "$BASE_URL/manual/" 200
test "$BASE_URL/manual/component-dsl.html" 200

if [ "$TOTAL" == "$SUCCESS" ]; then
  echo -e "$0 \e[1mSUCCESSFULLY\e[0m ran $TOTAL tests"
else
  echo -e "$0 \e[1m\e[31mFAILURE\e[0m: $((TOTAL - SUCCESS)) tests failed out of ${TOTAL}"
  exit 1
fi
