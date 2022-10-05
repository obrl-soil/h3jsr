## Release Summary

  * Updated core library; API revision, new functions
  * This is a resubmission after a reverse dependency was missed; see below
  * a NOTE related to inconsistent NEWS.md formatting has been resolved
  
## Test environments

  * Local: 
    * Windows 11, R 4.2.1
    * Ubuntu 20.04, R 4.2.1 via WSL
  * Github Actions via usethis::use_github_action_check_standard()

## R CMD Check Results

  * Local: 
    * Windows 0 errors | 0 warnings | 0 notes
    * Ubuntu  0 errors | 0 warnings | 0 notes
  * Github Actions: 0 errors | 0 warnings | 0 notes
  
## Downstream dependencies

Downstream dependency 'valuemap' has been informed of the API changes at https://github.com/Curycu/valuemap/issues/1 (2022-09-27, acknowledged 2022-10-04)
