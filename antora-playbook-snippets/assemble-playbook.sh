#!/bin/sh

cd `dirname $0`

if [ "../$1" = "../" ]
then
  echo "Usage: ./antora-playbook-snippets/antora-playbook-assemble.sh <target playbook> [<playbook snippet>]+"
  exit 1
fi

TARGET=../$1

cp antora-playbook.yml $TARGET

shift

for arg
do
  cat $arg >> $TARGET
done
