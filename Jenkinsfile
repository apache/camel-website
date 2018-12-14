/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
def NODE = 'git-websites'
def NODE_IMAGE = 'node:11'
def YARN_OPTS = '--non-interactive --frozen-lockfile --json --cache-folder $WORKSPACE/.yarn --modules-folder node_modules'

pipeline {
    agent {
        label "$NODE"
    }

    options {
        buildDiscarder(
            logRotator(artifactNumToKeepStr: '5', numToKeepStr: '10')
        )
    }

    stages {
        stage('Build') {
            agent {
                docker {
                    label "$NODE"
                    image "$NODE_IMAGE"
                    reuseNode true
                }
            }

            environment {
                ANTORA_CACHE_DIR = "$WORKSPACE/.antora"
            }

            steps {
                sh "yarn install"
                sh "yarn $YARN_OPTS build"
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }

            steps {
                dir('deploy/staging') {
                    deleteDir()
                    sh 'git clone -b asf-site https://gitbox.apache.org/repos/asf/camel-website.git .'
                    sh 'git rm -r *'
                    sh "cp -R $WORKSPACE/public/* ."
                    sh 'git add .'
                    sh 'git commit -m "Website updated to $(git rev-parse --short HEAD)"'
                    sh 'git push origin asf-site'
                }
            }
       }
    }
}
