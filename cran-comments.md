## Release Summary

This is a resubmission. Issues found:

  * Build failure on Solaris led to package being archived
  
  This is due to a (very) old version of the V8 core library on OpenCSW. A
  recent update to the R wrapper package 'V8' solves this dependency issue by
  providing cross-platform access to a static build of a current version.
	
	thanks :)
  
## Test environments

  * Local: 
    * Windows 11, R 4.1.2 
    * Ubuntu 20.04, R 4.1.2 via WSL
  * Github Actions via usethis::use_github_check_standard()
  * Solaris build check via rhub::check_for_cran(platforms = c('solaris-x86-patched-ods', 'solaris-x86-patched'))

## R CMD Check Results

  * Local: 
    * Windows 0 errors | 0 warnings | 0 notes
    * Ubuntu  0 errors | 0 warnings | 0 notes
  * Github Actions: 0 errors | 0 warnings | 0 notes
  * RHub: 0 errors | 0 warnings | 3 notes (package archived, possible misspellings (not correct), pandoc unavailable)
  
## Downstream dependencies

There are currently no downstream dependencies for this package.
