# TODO

## SECURITY ISSUES
- [ ] Avoid running as root
- [ ] Enable TLS for Docker in Docker

## MUST HAVE
- [ ] Avoid sending jobs to failed
- [ ] Handle concurrency
- [ ] Ask droid augmentor team to remove $USER param
  - [ ] Test file deletion after this removal
- [ ] Allow dataset upload .zip, .7z and .rar
  - [ ] Check content first
- [ ] JSdoc or similar like apiDoc
- [ ] Better repository documentation
  - [ ] Clear instructions about the two ways to run it
  - [ ] Single command to run it
  - [ ] References to the installation of the technologies
- [ ] Frontend
- [ ] Pagination

## NICE TO HAVE
- [ ] Allow upload dataset from URL
- [ ] Zip output

## EXPERIMENTS
- [ ] Upload to CDN
- [ ] Switch from Bull.js to Apache Kafka
- [ ] Change from Docker In Docker to another approach OR scale it into other machine or system, not the current backend machine
