#!/bin/bash
set -e

echo Apache Camel-Website
echo ===============================
echo Running Uninstaller..

# Ensure we only use unmodified commands
export PATH=/bin:/sbin:/usr/bin:/usr/sbin

# Make sure only root can run our script
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

echo Removing files...
rm -rf ../camel-website

echo Finished!