## Release Summary

This is a resubmission. Issues found:

  * non-standard FOSS license. 
    * Response: ran `usethis::use_apache_license()` to update the LICENSE.md file and
      DESCRIPTION syntax. Added separate copy of Apache 2.0 license specific to bundled
      h3js code in `inst/js` and added a LICENSE.note file consistent with advice at
      https://r-pkgs.org/license.html and https://github.com/uber/h3-js/issues/123.
  * busted URLs
    * all URLs reviewed and updated.
	
	thanks :)
  
## Test environments

  * Local: 
    * Windows 10, R 4.1.0 
    * Ubuntu 18.04 bionic, R 4.1.0 via WSL-2 
  * Github Actions via usethis::use_github_check_standard() 

## R CMD Check Results

  * Local: 
    * Windows 0 errors | 0 warnings | 0 notes
    * Ubuntu  0 errors | 0 warnings | 0 notes
  * Github Actions: 0 errors | 0 warnings | 0 notes
  
## Downstream dependencies

There are currently no downstream dependencies for this package.
