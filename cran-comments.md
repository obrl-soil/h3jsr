## Release Summary

This is a resubmission. Issues found:

  * URL containing fragment identifier flagged as potentially broken
    * Fragment removed with commit https://github.com/obrl-soil/h3jsr/commit/a0f0bc2d1b0f22539414c253ee4b5debf9b8bc4b. 
  * Please reset options() in vignette after knitting
    * Vignette code modified to ensure this behaviour with commit https://github.com/obrl-soil/h3jsr/commit/00617b2a5b9a8f4ea6652eee5e647a11ebd3f423
	
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
