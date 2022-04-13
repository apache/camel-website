@rem Run yarn in docker.
@rem supply the yarn arga/script on the command line, e.g.
@rem yarn-in-docker.bat workspace antora-ui-camel run build

docker build -t camel-website .
docker run --rm -it -p 1313:1313 -e "GITHUB_TOKEN=%GITHUB_TOKEN%" -e "CAMEL_ENV=%CAMEL_ENV%" -v "%CD%:/work:Z" --workdir /work camel-website yarn %*
