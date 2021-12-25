## Release Summary

This is a resubmission. Issues found:

  * Build failure on Solaris led to package being archived
  
  This is due to a (very) old version of the V8 core library on OpenCSW.
  Attempted to request an update via the OpenCSW website but the form is broken
  and apparently has been for some years. Attempted to gain access to the
  relevant mailing list for requesting updates as well, but no-one seems to be
  approving requests.
  
  A recent update to the R wrapper package 'V8' solves this dependency
  issue by providing cross-platform access to a static build of a current
  version of V8.
	
	thanks :)
  
## Test environments

  * Local: 
    * Windows 10, R 4.1.2 
    * Ubuntu 18.04 bionic, R 4.1.2 via WSL-2 
  * Github Actions via usethis::use_github_check_standard()
  * Solaris build check via rhub::check_for_cran(platforms = c('solaris-x86-patched-ods', 'solaris-x86-patched'))

## R CMD Check Results

  * Local: 
    * Windows 0 errors | 0 warnings | 0 notes
    * Ubuntu  0 errors | 0 warnings | 0 notes
  * Github Actions: 0 errors | 0 warnings | 0 notes
  * RHub: 0 errors | 0 warnings | 0 notes
  
## Downstream dependencies

There are currently no downstream dependencies for this package.
