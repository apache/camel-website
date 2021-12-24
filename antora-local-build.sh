#!/bin/sh

#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

cd "$(dirname "${BASH_SOURCE[0]}")"

LOCAL=$1

if [ ! -d $LOCAL ]
then
   echo Local project $LOCAL not found
   exit
fi

antora-playbook-snippets/assemble-playbook.sh antora-playbook-local-full.yml ../$LOCAL/docs/source-map.yml playbook-export-site-manifest.yml

antora-playbook-snippets/assemble-playbook.sh antora-playbook-local-partial.yml ../$LOCAL/docs/source-map.yml ../$LOCAL/docs/source-watch.yml playbook-import-site-manifest-local.yml

antora-playbook-snippets/assemble-playbook.sh antora-playbook-local-quick.yml ../$LOCAL/docs/source-map.yml ../$LOCAL/docs/source-watch.yml playbook-import-site-manifest-remote.yml

if [ "$2" = "full" ]
then
  yarn build:antora-local-full2
elif [ "$2" = "quick" ]
then
  yarn build:antora-local-quick
else
  yarn build:antora-local-partial2
fi
